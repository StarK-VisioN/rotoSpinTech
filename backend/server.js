require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/db.js");    
const GeneralRoutes = require("./routes/GeneralRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();

// Middleware 
app.use(
    cors({
        origin: "*",   // change to frontend domain if needed
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// Middleware
app.use(express.json());

// Routes
app.use("/", GeneralRoutes);
app.use("/api/auth", authRoutes);

// DB connection test
pool.query("SELECT NOW()")
    .then((res) => console.log("Postgres Connected:", res.rows[0]))
    .catch((err) => console.error("Postgres Connection Error:", err.message));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
