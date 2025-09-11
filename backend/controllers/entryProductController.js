const pool = require("../config/db");

// @desc Add new entry product
// @route POST /api/entry-products
const createEntryProduct = async (req, res) => {
  try {
    const { client_name, sap_name, quantity, part_description, unit, remarks, color, weight_per_unit } = req.body;

    // validate required fields
    if (!client_name || !sap_name || !quantity) {
      return res.status(400).json({ message: "Client name, SAP name, and quantity are required" });
    }

    // Check if SAP product exists, if not create it
    const sapCheck = await pool.query(
      "SELECT * FROM sap_products WHERE sap_name = $1",
      [sap_name]
    );

    let finalColor = color || 'NA';
    let finalWeight = weight_per_unit || 1.0; // Default weight if not provided
    
    if (sapCheck.rows.length === 0) {
      // Create new SAP product if it doesn't exist
      if (!part_description || !unit) {
        return res.status(400).json({ 
          message: "Part description and unit are required when creating new SAP product" 
        });
      }

      await pool.query(
        `INSERT INTO sap_products (sap_name, part_description, unit, remarks, color, weight_per_unit, is_custom, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)`,
        [sap_name, part_description, unit, remarks || null, finalColor, finalWeight]
      );
    } else {
      // Use the color from the existing SAP product if not provided
      if (!finalColor || finalColor === 'NA') {
        finalColor = sapCheck.rows[0].color || 'NA';
      }
    }

    // Create the entry product with color
    const result = await pool.query(
      `INSERT INTO entry_products (client_name, sap_name, quantity, color) VALUES ($1, $2, $3, $4) RETURNING *`,
      [client_name, sap_name, quantity, finalColor]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Entry Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get all entry products
// @route GET /api/entry-products
const getEntryProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.product_id, e.client_name, e.sap_name, e.quantity, e.color, e.created_at,
              COALESCE(s.part_description, 'N/A') as part_description,
              COALESCE(s.unit, 'N/A') as unit,
              COALESCE(s.remarks, '') as remarks
       FROM entry_products e
       LEFT JOIN sap_products s ON e.sap_name = s.sap_name
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Entries Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update an entry product
// @route PUT /api/entry-products/:product_id
const updateEntryProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { client_name, sap_name, quantity, color } = req.body;

    const result = await pool.query(
      `UPDATE entry_products
       SET client_name=$1, sap_name=$2, quantity=$3, color=$4
       WHERE product_id=$5
       RETURNING *`,
      [client_name, sap_name, quantity, color || 'NA', product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Entry Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete an entry product
// @route DELETE /api/entry-products/:product_id
const deleteEntryProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const result = await pool.query(
      "DELETE FROM entry_products WHERE product_id=$1 RETURNING *",
      [product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error("Delete Entry Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createEntryProduct,
  getEntryProducts,
  updateEntryProduct,
  deleteEntryProduct,
};
