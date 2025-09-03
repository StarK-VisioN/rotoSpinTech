const express = require("express");
const {
  getColors,
  createColor,
  deleteColor,
} = require("../controllers/colorsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getColors);
router.post("/", protect, createColor);
router.delete("/:id", protect, deleteColor);

module.exports = router;