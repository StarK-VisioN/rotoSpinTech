const pool = require("../config/db");

// @desc Add new raw stock entry
// @route POST /api/raw-stock
const createRawStock = async (req, res) => {
  try {
    const { material_grade, invoice_number, invoice_date, colors, remarks } = req.body;

    if (!material_grade || !invoice_number || !invoice_date || !colors || colors.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // calculate total KG and total amount (price)
    let total_kgs = 0;
    let total_amount = 0;
    colors.forEach(c => {
      total_kgs += parseFloat(c.kgs);
      total_amount += parseFloat(c.kgs) * parseFloat(c.rate_per_kg);
    });

    // insert main stock entry
    const stockResult = await pool.query(
      `INSERT INTO entry_raw_stock (material_grade, total_kgs, total_amount, invoice_number, invoice_date, remarks)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING order_id`,
      [material_grade, total_kgs, total_amount, invoice_number, invoice_date, remarks || null]
    );

    const order_id = stockResult.rows[0].order_id;

    // insert details per color
    for (const c of colors) {
      // Check if this is a custom color that needs to be created
      let color_id = c.color_id;
      
      if (c.is_custom && c.color_name) {
        // Insert custom color and get its ID
        const colorResult = await pool.query(
          `INSERT INTO colors (color_name, is_custom) VALUES ($1, TRUE) RETURNING color_id`,
          [c.color_name]
        );
        color_id = colorResult.rows[0].color_id;
      }

      await pool.query(
        `INSERT INTO entry_raw_stock_details (order_id, color_id, kgs, rate_per_kg)
         VALUES ($1, $2, $3, $4)`,
        [order_id, color_id, c.kgs, c.rate_per_kg]
      );
    }

    res.status(201).json({ message: "Raw stock entry created", order_id });
  } catch (err) {
    console.error("Create Raw Stock Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get all raw stock entries
// @route GET /api/raw-stock
const getRawStocks = async (req, res) => {
  try {
    const stockResult = await pool.query(
      `SELECT * FROM entry_raw_stock ORDER BY created_at DESC`
    );

    const stocks = [];

    for (const stock of stockResult.rows) {
      const detailsResult = await pool.query(
        `SELECT d.detail_id, d.kgs, d.rate_per_kg, d.total_price, 
                COALESCE(c.color_name, 'Unknown') AS color,
                c.color_id
         FROM entry_raw_stock_details d
         LEFT JOIN colors c ON d.color_id = c.color_id
         WHERE d.order_id = $1`,
        [stock.order_id]
      );

      stocks.push({ ...stock, details: detailsResult.rows });
    }

    res.json(stocks);
  } catch (err) {
    console.error("Get Raw Stocks Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update raw stock entry
// @route PUT /api/raw-stock/:id
const updateRawStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { material_grade, invoice_number, invoice_date, colors, remarks } = req.body;

    if (!material_grade || !invoice_number || !invoice_date || !colors || colors.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let total_kgs = 0;
    let total_amount = 0;
    colors.forEach(c => {
      total_kgs += parseFloat(c.kgs);
      total_amount += parseFloat(c.kgs) * parseFloat(c.rate_per_kg);
    });

    await pool.query(
      `UPDATE entry_raw_stock
       SET material_grade=$1, total_kgs=$2, total_amount=$3, invoice_number=$4, invoice_date=$5, remarks=$6
       WHERE order_id=$7`,
      [material_grade, total_kgs, total_amount, invoice_number, invoice_date, remarks || null, id]
    );

    // remove previous details
    await pool.query(`DELETE FROM entry_raw_stock_details WHERE order_id=$1`, [id]);

    // insert updated details
    for (const c of colors) {
      // Check if this is a custom color that needs to be created
      let color_id = c.color_id;
      
      if (c.is_custom && c.color_name) {
        // Check if custom color already exists
        const colorCheck = await pool.query(
          `SELECT color_id FROM colors WHERE color_name = $1 AND is_custom = TRUE`,
          [c.color_name]
        );
        
        if (colorCheck.rows.length > 0) {
          color_id = colorCheck.rows[0].color_id;
        } else {
          // Insert custom color and get its ID
          const colorResult = await pool.query(
            `INSERT INTO colors (color_name, is_custom) VALUES ($1, TRUE) RETURNING color_id`,
            [c.color_name]
          );
          color_id = colorResult.rows[0].color_id;
        }
      }

      await pool.query(
        `INSERT INTO entry_raw_stock_details (order_id, color_id, kgs, rate_per_kg)
         VALUES ($1, $2, $3, $4)`,
        [id, color_id, c.kgs, c.rate_per_kg]
      );
    }

    res.json({ message: "Raw stock entry updated" });
  } catch (err) {
    console.error("Update Raw Stock Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete raw stock entry
// @route DELETE /api/raw-stock/:id
const deleteRawStock = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM entry_raw_stock WHERE order_id=$1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Raw stock entry deleted successfully" });
  } catch (err) {
    console.error("Delete Raw Stock Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// DELETE specific color (detail)
// @route DELETE /api/raw-stock/:orderId/color/:detailId
const deleteColorFromRawStock = async (req, res) => {
  try {
    const { orderId, detailId } = req.params;

    // delete specific detail row
    const result = await pool.query(
      "DELETE FROM entry_raw_stock_details WHERE detail_id=$1 AND order_id=$2 RETURNING *",
      [detailId, orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Color entry not found" });
    }

    // recalculate totals for parent entry_raw_stock
    const totals = await pool.query(
      `SELECT 
         COALESCE(SUM(kgs), 0) AS total_kgs,
         COALESCE(SUM(total_price), 0) AS total_amount
       FROM entry_raw_stock_details
       WHERE order_id=$1`,
      [orderId]
    );

    await pool.query(
      `UPDATE entry_raw_stock
       SET total_kgs=$1, total_amount=$2
       WHERE order_id=$3`,
      [totals.rows[0].total_kgs, totals.rows[0].total_amount, orderId]
    );

    res.json({ message: "Color deleted successfully" });
  } catch (err) {
    console.error("Delete Color Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createRawStock,
  getRawStocks,
  updateRawStock,
  deleteRawStock,
  deleteColorFromRawStock,
};
