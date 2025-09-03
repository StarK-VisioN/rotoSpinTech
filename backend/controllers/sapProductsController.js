const pool = require("../config/db");

// @desc Get all SAP products
// @route GET /api/sap-products
const getSapProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sap_products ORDER BY sap_name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get SAP Products Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Add new SAP product
// @route POST /api/sap-products
const createSapProduct = async (req, res) => {
  try {
    const { sap_name, part_description, unit, remarks, color } = req.body;

    // validate required fields
    if (!sap_name || !part_description || !unit) {
      return res.status(400).json({ message: "SAP name, part description, and unit are required" });
    }

    const result = await pool.query(
      `INSERT INTO sap_products (sap_name, part_description, unit, remarks, color) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [sap_name, part_description, unit, remarks || null, color || 'NA']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create SAP Product Error:", err.message);
    
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ message: "SAP product with this name already exists" });
    }
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update SAP product
// @route PUT /api/sap-products/:sap_name
const updateSapProduct = async (req, res) => {
  try {
    const { sap_name } = req.params;
    const { new_sap_name, part_description, unit, remarks, color } = req.body;

    // Check if the new SAP name already exists (if it's being changed)
    if (new_sap_name && new_sap_name !== sap_name) {
      const existingCheck = await pool.query(
        "SELECT * FROM sap_products WHERE sap_name = $1",
        [new_sap_name]
      );
      
      if (existingCheck.rows.length > 0) {
        return res.status(400).json({ message: "SAP product with this name already exists" });
      }
    }

    const result = await pool.query(
      `UPDATE sap_products
       SET sap_name = COALESCE($1, sap_name),
           part_description = $2, 
           unit = $3, 
           remarks = $4, 
           color = $5
       WHERE sap_name = $6
       RETURNING *`,
      [new_sap_name || sap_name, part_description, unit, remarks || null, color || 'NA', sap_name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SAP product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update SAP Product Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete SAP product
// @route DELETE /api/sap-products/:sap_name
const deleteSapProduct = async (req, res) => {
  try {
    const { sap_name } = req.params;

    // Since we have ON DELETE CASCADE configured, we can directly delete
    // The database will automatically handle associated entries
    const result = await pool.query(
      "DELETE FROM sap_products WHERE sap_name = $1 RETURNING *",
      [sap_name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SAP product not found" });
    }

    res.json({ 
      message: "SAP product deleted successfully",
      deleted_sap: result.rows[0]
    });
  } catch (err) {
    console.error("Delete SAP Product Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getSapProducts,
  createSapProduct,
  updateSapProduct,
  deleteSapProduct,
};