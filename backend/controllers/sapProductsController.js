const pool = require("../config/db");

// @desc Get all SAP products
// @route GET /api/sap-products
const getSapProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sap_products ORDER BY is_custom, sap_name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get SAP Products Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Create a new SAP product
// @route POST /api/sap-products
const createSapProduct = async (req, res) => {
  try {
    const { sap_name, part_description, unit, color, remarks } = req.body;

    if (!sap_name || !part_description || !unit) {
      return res.status(400).json({ message: "SAP name, part description, and unit are required" });
    }

    // Check if SAP product already exists
    const existingProduct = await pool.query(
      "SELECT * FROM sap_products WHERE LOWER(sap_name) = LOWER($1)",
      [sap_name]
    );

    if (existingProduct.rows.length > 0) {
      return res.status(400).json({ message: "SAP product already exists" });
    }

    const result = await pool.query(
      "INSERT INTO sap_products (sap_name, part_description, unit, color, remarks, is_custom) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *",
      [sap_name, part_description, unit, color, remarks]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create SAP Product Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update a SAP product
// @route PUT /api/sap-products/:sap_name
const updateSapProduct = async (req, res) => {
  try {
    const { sap_name } = req.params;
    const { new_sap_name, part_description, unit, color, remarks } = req.body;

    if (!new_sap_name || !part_description || !unit) {
      return res.status(400).json({ message: "SAP name, part description, and unit are required" });
    }

    // Check if new SAP name already exists (if changing name)
    if (new_sap_name.toLowerCase() !== sap_name.toLowerCase()) {
      const existingProduct = await pool.query(
        "SELECT * FROM sap_products WHERE LOWER(sap_name) = LOWER($1)",
        [new_sap_name]
      );

      if (existingProduct.rows.length > 0) {
        return res.status(400).json({ message: "SAP product already exists" });
      }
    }

    const result = await pool.query(
      "UPDATE sap_products SET sap_name = $1, part_description = $2, unit = $3, color = $4, remarks = $5 WHERE sap_name = $6 RETURNING *",
      [new_sap_name, part_description, unit, color, remarks, sap_name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "SAP product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update SAP Product Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete a SAP product
// @route DELETE /api/sap-products/:sap_name
const deleteSapProduct = async (req, res) => {
  try {
    const { sap_name } = req.params;

    // Check if the SAP product is used in any entries
    const usageCheck = await pool.query(
      "SELECT COUNT(*) FROM entry_products WHERE sap_name = $1",
      [sap_name]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: "Cannot delete SAP product that is used in entries" 
      });
    }

    const result = await pool.query(
      "DELETE FROM sap_products WHERE sap_name = $1 RETURNING *",
      [sap_name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "SAP product not found" });
    }

    res.json({ message: "SAP product deleted successfully" });
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