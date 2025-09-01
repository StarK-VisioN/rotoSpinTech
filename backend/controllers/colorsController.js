const pool = require("../config/db");

// @desc Get all colors
// @route GET /api/colors
const getColors = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM colors ORDER BY color_name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Colors Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getColors };
