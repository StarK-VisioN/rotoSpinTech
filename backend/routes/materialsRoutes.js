const express = require("express");
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMaterials);
router.post("/", protect, createMaterial);
router.put("/:id", protect, updateMaterial);
router.delete("/:id", protect, deleteMaterial);

module.exports = router;