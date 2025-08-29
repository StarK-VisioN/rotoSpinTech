const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const { name, position, workingId, password } = req.body;

    if (!name || !position || !workingId || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE working_id = $1", [workingId]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User with this Working ID already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    const result = await pool.query(
      `INSERT INTO users (name, position, working_id, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, position, working_id, created_at`,
      [name, position, workingId, hashedPassword]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "User created successfully",
      user,
      token: generateToken(user.id),
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { workingId, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE working_id = $1", [workingId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid Working ID or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Working ID or password" });
    }

    res.json({
      id: user.id,
      name: user.name,
      position: user.position,
      workingId: user.working_id,
      token: generateToken(user.id),
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, position, working_id, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getUserProfile,
};
