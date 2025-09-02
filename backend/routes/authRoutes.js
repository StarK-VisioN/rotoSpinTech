const express = require("express");
const { signupUser, loginUser, getUserProfile } = require("../controllers/authController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// register user
router.post("/signup", signupUser);

// login user
router.post("/login", loginUser);

// get user profile (protected)
router.get("/profile", protect, getUserProfile);

module.exports = router;
