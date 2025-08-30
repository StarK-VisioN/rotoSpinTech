const pool = require("../config/db");

// @desc Add new entry product
// @route POST /api/entry-products
const createEntryProduct = async (req, res) => {
  try {
    const { clientName, productName, productColor, quantity, date } = req.body;

    // Validate required fields
    if (!clientName || !productName || !productColor || !quantity || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Insert into DB
    const result = await pool.query(
      `INSERT INTO entry_products (client_name, product_name, product_color, quantity, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [clientName, productName, productColor, quantity, date]
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
      "SELECT * FROM entry_products ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Entries Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update an entry product
// @route PUT /api/entry-products/:id
const updateEntryProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, productName, productColor, quantity, date } = req.body;

    const result = await pool.query(
      `UPDATE entry_products
       SET client_name=$1, product_name=$2, product_color=$3, quantity=$4, date=$5
       WHERE id=$6
       RETURNING *`,
      [clientName, productName, productColor, quantity, date, id]
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
// @route DELETE /api/entry-products/:id
const deleteEntryProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM entry_products WHERE id=$1 RETURNING *",
      [id]
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
