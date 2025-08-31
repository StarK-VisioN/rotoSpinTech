const express = require("express");
const { addStaff, getStaffs, updateStaff, deleteStaff } = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addStaff);
router.get("/", protect, getStaffs);
router.put("/:id", protect, updateStaff);
router.delete("/:id", protect, deleteStaff);

module.exports = router;
