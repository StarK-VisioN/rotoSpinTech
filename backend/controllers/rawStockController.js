const pool = require("../config/db");

// @desc Add new raw stock entry
// @route POST /api/raw-stock
const createRawStock = async (req, res) => {
  try {
    const { material_grade, invoice_number, invoice_date, colors } = req.body;

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
      `INSERT INTO entry_raw_stock (material_grade, total_kgs, total_amount, invoice_number, invoice_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING order_id`,
      [material_grade, total_kgs, total_amount, invoice_number, invoice_date]
    );

    const order_id = stockResult.rows[0].order_id;

    // insert details per color
    for (const c of colors) {
      await pool.query(
        `INSERT INTO entry_raw_stock_details (order_id, color_id, kgs, rate_per_kg)
         VALUES ($1, $2, $3, $4)`,
        [order_id, c.color_id, c.kgs, c.rate_per_kg]
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
        `SELECT d.detail_id, d.kgs, d.rate_per_kg, d.total_price, c.color_name AS color
         FROM entry_raw_stock_details d
         JOIN colors c ON d.color_id = c.color_id
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
    const { material_grade, invoice_number, invoice_date, colors } = req.body;

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
       SET material_grade=$1, total_kgs=$2, total_amount=$3, invoice_number=$4, invoice_date=$5
       WHERE order_id=$6`,
      [material_grade, total_kgs, total_amount, invoice_number, invoice_date, id]
    );

    // remove previous details
    await pool.query(`DELETE FROM entry_raw_stock_details WHERE order_id=$1`, [id]);

    // insert updated details
    for (const c of colors) {
      await pool.query(
        `INSERT INTO entry_raw_stock_details (order_id, color_id, kgs, rate_per_kg)
         VALUES ($1, $2, $3, $4)`,
        [id, c.color_id, c.kgs, c.rate_per_kg]
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
