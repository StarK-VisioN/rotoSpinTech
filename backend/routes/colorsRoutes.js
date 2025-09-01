const express = require("express");
const router = express.Router();
const { getColors } = require("../controllers/colorsController");

router.get("/", getColors);

module.exports = router;
