const express = require("express");
const {
  createRawStock,
  getRawStocks,
  updateRawStock,
  deleteRawStock,
  deleteColorFromRawStock,
  getColorsByMaterial,
  deleteColorsByMaterial,
  getMaterialNames,
} = require("../controllers/rawStockController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// to add new raw stock
router.post("/", protect, createRawStock);

// to get all raw stock entries
router.get("/", protect, getRawStocks);

// to update raw stock entry
router.put("/:id", protect, updateRawStock);

// to delete raw stock entry
router.delete("/:id", protect, deleteRawStock);

// new route for deleting specific color detail
router.delete("/:orderId/color/:detailId", deleteColorFromRawStock);

// Add these new routes
router.get("/material-names", protect, getMaterialNames);
router.get("/material/:materialName/colors", protect, getColorsByMaterial);
router.delete("/material/:materialName/colors", protect, deleteColorsByMaterial);

module.exports = router;
