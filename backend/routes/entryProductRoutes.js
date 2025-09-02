const express = require("express");
const {
  createEntryProduct,
  getEntryProducts,
  updateEntryProduct,
  deleteEntryProduct,
} = require("../controllers/entryProductController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// for adding new entry product
router.post("/", protect, createEntryProduct);

// to get all entry products
router.get("/", protect, getEntryProducts);

// to update an entry product
router.put("/:product_id", protect, updateEntryProduct);

// for delete an entry product
router.delete("/:product_id", protect, deleteEntryProduct);

module.exports = router;
