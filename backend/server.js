require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db.js");

const GeneralRoutes = require("./routes/GeneralRoutes");
const authRoutes = require("./routes/authRoutes");
const entryProductRoutes = require("./routes/entryProductRoutes");
const rawStockRoutes = require("./routes/rawStockRoutes");
const staffRoutes = require("./routes/staffRoutes");
const sapProductsRoutes = require("./routes/sapProductsRoutes");
const colorsRoutes  = require("./routes/colorsRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/", GeneralRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/entry-products", entryProductRoutes);
app.use("/api/raw-stock", rawStockRoutes);
app.use("/api/staff", staffRoutes); 
app.use("/api/sap-products", sapProductsRoutes);
app.use("/api/colors", colorsRoutes);

// DB test
pool.query("SELECT NOW()")
  .then(res => console.log("Postgres Connected:", res.rows[0]))
  .catch(err => console.error("Postgres Connection Error:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
