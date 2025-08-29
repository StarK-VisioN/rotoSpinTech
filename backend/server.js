import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";   // 👈 DB connection
import GeneralRoutes from "./routes/GeneralRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

/////// Routes
app.get("/ping", (req, res) => {
  res.send("PONGG");
});
app.use("/", GeneralRoutes);

////// DB connection test ////////
pool.query("SELECT NOW()")
  .then((res) => console.log("Postgres Connected:", res.rows[0]))
  .catch((err) => console.error("Postgres Connection Error:", err.message));

///// Server Start ///////
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
