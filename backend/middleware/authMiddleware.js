const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // get user from DB
      const result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [
        decoded.id,
      ]);
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (err) {
    res.status(401).json({ message: "Token failed", error: err.message });
  }
};

module.exports = { protect };
