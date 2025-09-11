const pool = require("../config/db");

// @desc Get all SAP products (only active ones)
// @route GET /api/sap-products
const getSapProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sap_products WHERE is_active = TRUE ORDER BY is_custom, sap_name"
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
    const { sap_name, part_description, unit, color, remarks, weight_per_unit } = req.body;

    if (!sap_name || !part_description || !unit) {
      return res.status(400).json({ message: "SAP name, part description, and unit are required" });
    }

    // Check if SAP product already exists (including inactive ones)
    const existingProduct = await pool.query(
      "SELECT * FROM sap_products WHERE LOWER(sap_name) = LOWER($1)",
      [sap_name]
    );

    if (existingProduct.rows.length > 0) {
      // If exists but inactive, reactivate it with updated details
      if (!existingProduct.rows[0].is_active) {
        await pool.query(
          "UPDATE sap_products SET is_active = TRUE, part_description = $1, unit = $2, color = $3, remarks = $4, weight_per_unit = $5 WHERE sap_name = $6",
          [part_description, unit, color, remarks, weight_per_unit, sap_name]
        );
        const reactivatedProduct = await pool.query(
          "SELECT * FROM sap_products WHERE sap_name = $1",
          [sap_name]
        );
        return res.status(200).json(reactivatedProduct.rows[0]);
      }
      return res.status(400).json({ message: "SAP product already exists" });
    }

    const result = await pool.query(
      "INSERT INTO sap_products (sap_name, part_description, unit, color, remarks, weight_per_unit, is_custom, is_active) VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE) RETURNING *",
      [sap_name, part_description, unit, color, remarks, weight_per_unit]
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
    const { new_sap_name, part_description, unit, color, remarks, weight_per_unit } = req.body;

    if (!new_sap_name || !part_description || !unit) {
      return res.status(400).json({ message: "SAP name, part description, and unit are required" });
    }

    // Check if new SAP name already exists (if changing name)
    if (new_sap_name.toLowerCase() !== sap_name.toLowerCase()) {
      const existingProduct = await pool.query(
        "SELECT * FROM sap_products WHERE LOWER(sap_name) = LOWER($1) AND is_active = TRUE",
        [new_sap_name]
      );

      if (existingProduct.rows.length > 0) {
        return res.status(400).json({ message: "SAP product already exists" });
      }
    }

    const result = await pool.query(
      "UPDATE sap_products SET sap_name = $1, part_description = $2, unit = $3, color = $4, remarks = $5, weight_per_unit = $6 WHERE sap_name = $7 RETURNING *",
      [new_sap_name, part_description, unit, color, remarks, weight_per_unit, sap_name]
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

// @desc Delete a SAP product (soft delete)
// @route DELETE /api/sap-products/:sap_name
const deleteSapProduct = async (req, res) => {
  try {
    const { sap_name } = req.params;

    // Check if the SAP product is used in any entries
    const usageCheck = await pool.query(
      "SELECT COUNT(*) FROM entry_products WHERE sap_name = $1",
      [sap_name]
    );

    // Always do soft delete to preserve historical data
    // Just mark as inactive instead of deleting
    const result = await pool.query(
      "UPDATE sap_products SET is_active = FALSE WHERE sap_name = $1 RETURNING *",
      [sap_name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "SAP product not found" });
    }

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.json({ 
        message: "SAP product removed from options (still used in entries)" 
      });
    }

    res.json({ message: "SAP product removed from options" });
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