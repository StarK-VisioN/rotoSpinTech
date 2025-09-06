const pool = require("../config/db");

// @desc Get all colors (only active ones)
// @route GET /api/colors
const getColors = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM colors WHERE is_active = TRUE ORDER BY is_custom, color_name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Colors Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Create a new color
// @route POST /api/colors
const createColor = async (req, res) => {
  try {
    const { color_name } = req.body;

    if (!color_name) {
      return res.status(400).json({ message: "Color name is required" });
    }

    // Check if color already exists (including inactive ones)
    const existingColor = await pool.query(
      "SELECT * FROM colors WHERE LOWER(color_name) = LOWER($1)",
      [color_name]
    );

    if (existingColor.rows.length > 0) {
      // If exists but inactive, reactivate it
      if (!existingColor.rows[0].is_active) {
        await pool.query(
          "UPDATE colors SET is_active = TRUE WHERE color_id = $1",
          [existingColor.rows[0].color_id]
        );
        const reactivatedColor = await pool.query(
          "SELECT * FROM colors WHERE color_id = $1",
          [existingColor.rows[0].color_id]
        );
        return res.status(200).json(reactivatedColor.rows[0]);
      }
      return res.status(400).json({ message: "Color already exists" });
    }

    const result = await pool.query(
      "INSERT INTO colors (color_name, is_custom, is_active) VALUES ($1, TRUE, TRUE) RETURNING *",
      [color_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Color Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete a color (soft delete)
// @route DELETE /api/colors/:id
const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the color is used in any stock entries
    const usageCheck = await pool.query(
      "SELECT COUNT(*) FROM entry_raw_stock_details WHERE color_id = $1",
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      // Instead of preventing deletion, we'll do a soft delete
      await pool.query(
        "UPDATE colors SET is_active = FALSE WHERE color_id = $1",
        [id]
      );
      return res.json({ message: "Color removed from options (still used in entries)" });
    }

    // If not used anywhere, we can do a hard delete
    const result = await pool.query(
      "DELETE FROM colors WHERE color_id = $1 AND is_custom = TRUE RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Custom color not found" });
    }

    res.json({ message: "Color deleted successfully" });
  } catch (err) {
    console.error("Delete Color Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getColors,
  createColor,
  deleteColor,
};