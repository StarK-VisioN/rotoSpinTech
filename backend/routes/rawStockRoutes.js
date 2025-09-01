const express = require("express");
const {
  createRawStock,
  getRawStocks,
  updateRawStock,
  deleteRawStock,
  deleteColorFromRawStock,
} = require("../controllers/rawStockController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Add new raw stock
router.post("/", protect, createRawStock);

// Get all raw stock entries
router.get("/", protect, getRawStocks);

// Update raw stock entry
router.put("/:id", protect, updateRawStock);

// Delete raw stock entry
router.delete("/:id", protect, deleteRawStock);

// New route for deleting specific color detail
router.delete("/:orderId/color/:detailId", deleteColorFromRawStock);

module.exports = router;
