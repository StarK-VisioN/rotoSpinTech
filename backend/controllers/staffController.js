const pool = require("../config/db");
const bcrypt = require("bcrypt");

// @desc Add new staff (Worker or Manager)
// @route POST /api/staff
const addStaff = async (req, res) => {
  try {
    const { position, name, working_id, password } = req.body;

    if (!position || !name || !working_id || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if working_id already exists in users table
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE working_id=$1",
      [working_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Working ID already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into add_new_staff table
    const staffResult = await pool.query(
      `INSERT INTO add_new_staff (position, name, working_id, password, original_password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING staff_id, position, name, working_id, password, original_password`,
      [position, name, working_id, hashedPassword, password]
    );

    // Insert into users table for login
    await pool.query(
      `INSERT INTO users (name, position, working_id, password)
       VALUES ($1, $2, $3, $4)`,
      [name, position === "PM" ? "manager" : "worker", working_id, hashedPassword]
    );

    res.status(201).json(staffResult.rows[0]);
  } catch (err) {
    console.error("Add Staff Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get all staff
// @route GET /api/staff
const getStaffs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT staff_id, position, name, working_id, password, original_password
       FROM add_new_staff
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get Staff Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update staff
// @route PUT /api/staff/:id
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, name, working_id, password } = req.body;

    if (!position || !name || !working_id || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update staff table
    const result = await pool.query(
      `UPDATE add_new_staff
       SET position=$1, name=$2, working_id=$3, password=$4, original_password=$5
       WHERE staff_id=$6
       RETURNING staff_id, position, name, working_id, password, original_password`,
      [position, name, working_id, hashedPassword, password, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Update users table as well
    await pool.query(
      `UPDATE users
       SET name=$1, position=$2, working_id=$3, password=$4
       WHERE working_id=(SELECT working_id FROM add_new_staff WHERE staff_id=$5)`,
      [name, position === "PM" ? "manager" : "worker", working_id, hashedPassword, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Staff Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Delete staff
// @route DELETE /api/staff/:id
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Get working_id to delete from users table
    const staff = await pool.query("SELECT working_id FROM add_new_staff WHERE staff_id=$1", [id]);
    if (staff.rows.length === 0) return res.status(404).json({ message: "Staff not found" });

    const workingId = staff.rows[0].working_id;

    // Delete from staff table
    await pool.query("DELETE FROM add_new_staff WHERE staff_id=$1", [id]);

    // Delete from users table
    await pool.query("DELETE FROM users WHERE working_id=$1", [workingId]);

    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error("Delete Staff Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { addStaff, getStaffs, updateStaff, deleteStaff };
