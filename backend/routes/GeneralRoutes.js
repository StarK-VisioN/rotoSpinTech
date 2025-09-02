const express = require("express");
const { createUser, findUserByWorkingId } = require("../models/UserModel");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("login page");
});

router.post("/signup", async (req, res) => {
  try {
    const { name, position, workingId, password } = req.body;

    if (!name || !position || !workingId || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // check if user already exists
    const existingUser = await findUserByWorkingId(workingId);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this Working ID already exists" });
    }

    const newUser = await createUser(name, position, workingId, password);
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
