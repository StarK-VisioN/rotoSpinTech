const express = require("express");
const { signupUser, loginUser, getUserProfile } = require("../controllers/authController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Register user
router.post("/signup", signupUser);

// Login user
router.post("/login", loginUser);

// Get user profile (protected)
router.get("/profile", protect, getUserProfile);

module.exports = router;
