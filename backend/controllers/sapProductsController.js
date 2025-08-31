const pool = require("../config/db");

// @desc Get all SAP products
// @route GET /api/sap-products
const getSapProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sap_products ORDER BY sap_name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch SAP Products Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getSapProducts };
