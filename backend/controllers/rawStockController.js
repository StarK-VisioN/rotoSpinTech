const pool = require("../config/db");

// @desc Add new raw stock entry
// @route POST /api/raw-stock
const createRawStock = async (req, res) => {
  try {
    const { no_of_bags, color, date, invoice_number, rate_per_bag } = req.body;

    if (!no_of_bags || !color || !date || !invoice_number || !rate_per_bag) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const total_price = no_of_bags * rate_per_bag; // backend calculates total price

    const result = await pool.query(
      `INSERT INTO entry_raw_stock (no_of_bags, color, date, invoice_number, rate_per_bag, total_price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING order_id, color, no_of_bags, total_kgs, invoice_number, date, rate_per_bag, total_price`,
      [no_of_bags, color, date, invoice_number, rate_per_bag, total_price]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Raw Stock Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get all raw stock entries
// @route GET /api/raw-stock
const getRawStocks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT order_id, color, no_of_bags, total_kgs, invoice_number, date, rate_per_bag, total_price
       FROM entry_raw_stock
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get Raw Stock Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update a raw stock entry
// @route PUT /api/raw-stock/:id
const updateRawStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { no_of_bags, color, date, invoice_number, rate_per_bag } = req.body;

    if (!no_of_bags || !color || !date || !invoice_number || !rate_per_bag) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const total_price = no_of_bags * rate_per_bag;

    const result = await pool.query(
      `UPDATE entry_raw_stock
       SET no_of_bags=$1, color=$2, date=$3, invoice_number=$4, rate_per_bag=$5, total_price=$6
       WHERE order_id=$7
       RETURNING *`,
      [no_of_bags, color, date, invoice_number, rate_per_bag, total_price, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Raw Stock Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete a raw stock entry
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

    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error("Delete Raw Stock Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createRawStock,
  getRawStocks,
  updateRawStock,
  deleteRawStock,
};
