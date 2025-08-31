const express = require("express");
const {
  createEntryProduct,
  getEntryProducts,
  updateEntryProduct,
  deleteEntryProduct,
} = require("../controllers/entryProductController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Add new entry product
router.post("/", protect, createEntryProduct);

// Get all entry products
router.get("/", protect, getEntryProducts);

// Update an entry product
router.put("/:product_id", protect, updateEntryProduct);

// Delete an entry product
router.delete("/:product_id", protect, deleteEntryProduct);

module.exports = router;
