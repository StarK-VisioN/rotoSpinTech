const pool = require("../config/db");

// @desc Add new raw stock entry
// @route POST /api/raw-stock
const createRawStock = async (req, res) => {
  try {
    const { material_grade, material_code, vendor_name, invoice_number, invoice_date, colors, remarks } = req.body;

    console.log("Received data:", req.body);

    if (!material_grade || !invoice_number || !invoice_date || !colors || colors.length === 0) {
      return res.status(400).json({ message: "Material grade, invoice number, invoice date, and colors are required" });
    }

    // calculate total KG and total amount (price)
    let total_kgs = 0;
    let total_amount = 0;
    colors.forEach(c => {
      total_kgs += parseFloat(c.kgs || 0);
      total_amount += parseFloat(c.kgs || 0) * parseFloat(c.rate_per_kg || 0);
    });

    // insert main stock entry
    const stockResult = await pool.query(
      `INSERT INTO entry_raw_stock (material_grade, material_code, vendor_name, total_kgs, total_amount, invoice_number, invoice_date, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING order_id`,
      [material_grade, material_code || null, vendor_name || null, total_kgs, total_amount, invoice_number, invoice_date, remarks || null]
    );

    const order_id = stockResult.rows[0].order_id;

    // insert details per color
    for (const c of colors) {
      // Check if this is a custom color that needs to be created
      let color_id = c.color_id;
      
      if (c.is_custom && c.color_name) {
        try {
          // Insert custom color and get its ID
          const colorResult = await pool.query(
            `INSERT INTO colors (color_name, is_custom) VALUES ($1, TRUE) RETURNING color_id`,
            [c.color_name]
          );
          color_id = colorResult.rows[0].color_id;
        } catch (colorError) {
          // If color already exists, try to find it
          if (colorError.code === '23505') { // unique violation
            const existingColor = await pool.query(
              `SELECT color_id FROM colors WHERE color_name = $1`,
              [c.color_name]
            );
            if (existingColor.rows.length > 0) {
              color_id = existingColor.rows[0].color_id;
            } else {
              throw colorError;
            }
          } else {
            throw colorError;
          }
        }
      }

      await pool.query(
        `INSERT INTO entry_raw_stock_details (order_id, color_id, kgs, rate_per_kg, material_grade)
         VALUES ($1, $2, $3, $4, $5)`,
        [order_id, color_id, c.kgs, c.rate_per_kg, material_grade]
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
        `SELECT d.detail_id, d.kgs, d.rate_per_kg, 
                COALESCE(c.color_name, 'Unknown') AS color,
                c.color_id, d.material_grade
         FROM entry_raw_stock_details d
         LEFT JOIN colors c ON d.color_id = c.color_id
         WHERE d.order_id = $1`,
        [stock.order_id]
      );

      stocks.push({ 
        ...stock, 
        details: detailsResult.rows 
      });
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
    const { material_grade, material_code, vendor_name, invoice_number, invoice_date, colors, remarks } = req.body;

    if (!material_grade || !invoice_number || !invoice_date || !colors || colors.length === 0) {
      return res.status(400).json({ message: "Material grade, invoice number, invoice date, and colors are required" });
    }

    let total_kgs = 0;
    let total_amount = 0;
    colors.forEach(c => {
      total_kgs += parseFloat(c.kgs || 0);
      total_amount += parseFloat(c.kgs || 0) * parseFloat(c.rate_per_kg || 0);
    });

    await pool.query(
      `UPDATE entry_raw_stock
       SET material_grade=$1, material_code=$2, vendor_name=$3, total_kgs=$4, total_amount=$5, invoice_number=$6, invoice_date=$7, remarks=$8
       WHERE order_id=$9`,
      [material_grade, material_code || null, vendor_name || null, total_kgs, total_amount, invoice_number, invoice_date, remarks || null, id]
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
        `INSERT INTO entry_raw_stock_details (order_id, color_id, kgs, rate_per_kg, material_grade)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, color_id, c.kgs, c.rate_per_kg, material_grade]
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

    // Get the color_id before deleting to check if it's a custom color
    const colorCheck = await pool.query(
      "SELECT color_id FROM entry_raw_stock_details WHERE detail_id = $1",
      [detailId]
    );

    const colorId = colorCheck.rows[0]?.color_id;

    // delete specific detail row
    const result = await pool.query(
      "DELETE FROM entry_raw_stock_details WHERE detail_id=$1 AND order_id=$2 RETURNING *",
      [detailId, orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Color entry not found" });
    }

    // Check if this color is used in any other entries
    if (colorId) {
      const usageCheck = await pool.query(
        "SELECT COUNT(*) FROM entry_raw_stock_details WHERE color_id = $1",
        [colorId]
      );

      // If this was the only usage of a custom color, delete it from colors table
      if (parseInt(usageCheck.rows[0].count) === 0) {
        await pool.query(
          "DELETE FROM colors WHERE color_id = $1 AND is_custom = TRUE",
          [colorId]
        );
      }
    }

    // recalculate totals for parent entry_raw_stock
    const totals = await pool.query(
      `SELECT 
         COALESCE(SUM(kgs), 0) AS total_kgs,
         COALESCE(SUM(kgs * rate_per_kg), 0) AS total_amount
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

// @desc Get available material grades
// @route GET /api/raw-stock/material-grades
const getMaterialGrades = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT material_grade FROM entry_raw_stock ORDER BY material_grade`
    );
    
    res.json(result.rows.map(row => row.material_grade));
  } catch (err) {
    console.error("Get Material Grades Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get colors by material grade
// @route GET /api/raw-stock/material/:materialGrade/colors
const getColorsByMaterial = async (req, res) => {
  try {
    const { materialGrade } = req.params;

    const colorsResult = await pool.query(
      `SELECT DISTINCT c.color_id, c.color_name, c.is_custom
       FROM entry_raw_stock_details d
       JOIN colors c ON d.color_id = c.color_id
       WHERE d.material_grade = $1
       ORDER BY c.color_name`,
      [materialGrade]
    );

    res.json(colorsResult.rows);
  } catch (err) {
    console.error("Get Colors By Material Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete colors by material grade
// @route DELETE /api/raw-stock/material/:materialGrade/colors
const deleteColorsByMaterial = async (req, res) => {
  try {
    const { materialGrade } = req.params;

    // First, get all color IDs used by this material
    const colorsResult = await pool.query(
      `SELECT DISTINCT color_id FROM entry_raw_stock_details WHERE material_grade = $1`,
      [materialGrade]
    );

    const colorIds = colorsResult.rows.map(row => row.color_id);

    if (colorIds.length === 0) {
      return res.status(404).json({ message: "No colors found for this material" });
    }

    // Delete the color entries from details table for this material
    await pool.query(
      `DELETE FROM entry_raw_stock_details WHERE material_grade = $1`,
      [materialGrade]
    );

    // For each custom color, check if it's used elsewhere before deleting
    for (const colorId of colorIds) {
      if (colorId) {
        const usageCheck = await pool.query(
          `SELECT COUNT(*) FROM entry_raw_stock_details WHERE color_id = $1`,
          [colorId]
        );

        // Only delete if this color is not used in any other materials
        if (parseInt(usageCheck.rows[0].count) === 0) {
          await pool.query(
            `DELETE FROM colors WHERE color_id = $1 AND is_custom = TRUE`,
            [colorId]
          );
        }
      }
    }

    res.json({ message: `Colors for material ${materialGrade} deleted successfully` });
  } catch (err) {
    console.error("Delete Colors By Material Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createRawStock,
  getRawStocks,
  updateRawStock,
  deleteRawStock,
  deleteColorFromRawStock,
  getMaterialGrades,
  getColorsByMaterial,
  deleteColorsByMaterial
};