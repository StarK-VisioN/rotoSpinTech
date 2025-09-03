const express = require("express");
const {
  getSapProducts,
  createSapProduct,
  updateSapProduct,
  deleteSapProduct,
} = require("../controllers/sapProductsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// to get all SAP products
router.get("/", protect, getSapProducts);

// to add new SAP product
router.post("/", protect, createSapProduct);

// to update SAP product
router.put("/:sap_name", protect, updateSapProduct);

// to delete SAP product
router.delete("/:sap_name", protect, deleteSapProduct);

module.exports = router;