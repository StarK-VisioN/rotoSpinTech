const express = require("express");
const { getSapProducts } = require("../controllers/sapProductsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all SAP products
router.get("/", protect, getSapProducts);

module.exports = router;
