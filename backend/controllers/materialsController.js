const pool = require("../config/db");

// @desc Get all materials
// @route GET /api/materials
const getMaterials = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM materials ORDER BY material_name, material_code"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Materials Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Create a new material
// @route POST /api/materials
const createMaterial = async (req, res) => {
  try {
    const { material_name, material_code } = req.body;

    if (!material_name || !material_code) {
      return res.status(400).json({ message: "Material name and code are required" });
    }

    // Check if material with same name AND code already exists
    const existingMaterial = await pool.query(
      "SELECT * FROM materials WHERE material_name = $1 AND material_code = $2",
      [material_name, material_code]
    );

    if (existingMaterial.rows.length > 0) {
      return res.status(400).json({ message: "Material with this name and code combination already exists" });
    }

    const result = await pool.query(
      "INSERT INTO materials (material_name, material_code) VALUES ($1, $2) RETURNING *",
      [material_name, material_code]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Material Error:", err.message);
    
    if (err.code === '23505') {
      return res.status(400).json({ message: "Material with this name and code combination already exists" });
    }
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Update a material
// @route PUT /api/materials/:id
const updateMaterial = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start transaction

    const { id } = req.params;
    const { material_name, material_code } = req.body;

    if (!material_name || !material_code) {
      return res.status(400).json({ message: "Material name and code are required" });
    }

    // Get the current material values before update
    const currentMaterial = await client.query(
      "SELECT material_name, material_code FROM materials WHERE material_id = $1",
      [id]
    );

    if (currentMaterial.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Material not found" });
    }

    const oldMaterialName = currentMaterial.rows[0].material_name;
    const oldMaterialCode = currentMaterial.rows[0].material_code;

    // Check if another material with same name AND code exists
    const duplicateCheck = await client.query(
      "SELECT * FROM materials WHERE material_name = $1 AND material_code = $2 AND material_id != $3",
      [material_name, material_code, id]
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Another material with this name and code combination already exists" });
    }

    // Update material in materials table
    const result = await client.query(
      "UPDATE materials SET material_name = $1, material_code = $2 WHERE material_id = $3 RETURNING *",
      [material_name, material_code, id]
    );

    // Update all related raw stock entries
    await client.query(
      "UPDATE entry_raw_stock SET material_name = $1, material_code = $2 WHERE material_name = $3 AND material_code = $4",
      [material_name, material_code, oldMaterialName, oldMaterialCode]
    );

    // Update all related raw stock details
    await client.query(
      "UPDATE entry_raw_stock_details SET material_name = $1 WHERE material_name = $2",
      [material_name, oldMaterialName]
    );

    await client.query('COMMIT'); // Commit transaction
    res.json(result.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error("Update Material Error:", err.message);
    
    if (err.code === '23505') {
      return res.status(400).json({ message: "Another material with this name and code combination already exists" });
    }
    
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    client.release();
  }
};

// @desc Delete a material
// @route DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start transaction

    const { id } = req.params;

    // Check if material exists and get its details
    const existingMaterial = await client.query(
      "SELECT material_name, material_code FROM materials WHERE material_id = $1",
      [id]
    );

    if (existingMaterial.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Material not found" });
    }

    const materialName = existingMaterial.rows[0].material_name;
    const materialCode = existingMaterial.rows[0].material_code;

    // Check if material is used in any raw stock entries
    const usageCheck = await client.query(
      "SELECT COUNT(*) FROM entry_raw_stock WHERE material_name = $1 AND material_code = $2",
      [materialName, materialCode]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: "Cannot delete material that is used in raw stock entries. Delete the entries first." 
      });
    }

    // Delete the material
    await client.query(
      "DELETE FROM materials WHERE material_id = $1",
      [id]
    );

    await client.query('COMMIT'); // Commit transaction
    res.json({ message: "Material deleted successfully" });

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error("Delete Material Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    client.release();
  }
};

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};