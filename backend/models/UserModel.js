const pool = require("../config/db");

async function createUser(name, position, workingId, password) {
  const query = `
    INSERT INTO users (name, position, working_id, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, position, working_id, created_at;
  `;

  const values = [name, position, workingId, password];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function findUserByWorkingId(workingId) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE working_id = $1",
    [workingId]
  );
  return rows[0];
}

module.exports = {
  createUser,
  findUserByWorkingId,
};
