const pool = require("../config/db");

// @desc Add new entry product
// @route POST /api/entry-products
const createEntryProduct = async (req, res) => {
  try {
    const { client_name, sap_name, quantity } = req.body;

    // validate required fields
    if (!client_name || !sap_name || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await pool.query(
      `INSERT INTO entry_products (client_name, sap_name, quantity) VALUES ($1, $2, $3) RETURNING *`,
      [client_name, sap_name, quantity]
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
      `SELECT e.product_id, e.client_name, e.sap_name, e.quantity, e.created_at,
              s.part_description, s.unit, s.remarks, s.color
       FROM entry_products e
       JOIN sap_products s ON e.sap_name = s.sap_name
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
    const { client_name, sap_name, quantity } = req.body;

    const result = await pool.query(
      `UPDATE entry_products
       SET client_name=$1, sap_name=$2, quantity=$3
       WHERE product_id=$4
       RETURNING *`,
      [client_name, sap_name, quantity, product_id]
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
