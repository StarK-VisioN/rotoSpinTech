const express = require("express");
const {
  createEntryProduct,
  getEntryProducts,
  updateEntryProduct,
  deleteEntryProduct,
} = require("../controllers/entryProductController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
//add new entry product
router.post("/", protect, createEntryProduct);

// get all entry products
router.get("/", protect, getEntryProducts);

// update an entry product
router.put("/:id", protect, updateEntryProduct);

// delete an entry product
router.delete("/:id", protect, deleteEntryProduct);

module.exports = router;
