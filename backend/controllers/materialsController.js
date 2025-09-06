const pool = require("../config/db");

// @desc Get all materials (only active ones)
// @route GET /api/materials
const getMaterials = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM materials WHERE is_active = TRUE ORDER BY material_grade, material_code"
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
    const { material_grade, material_code } = req.body;

    if (!material_grade) {
      return res.status(400).json({ message: "Material grade is required" });
    }

    // Check if material with same grade AND code already exists (including inactive ones)
    const existingMaterial = await pool.query(
      "SELECT * FROM materials WHERE material_grade = $1 AND material_code = $2",
      [material_grade, material_code || null]
    );

    if (existingMaterial.rows.length > 0) {
      // If exists but inactive, reactivate it
      if (!existingMaterial.rows[0].is_active) {
        await pool.query(
          "UPDATE materials SET is_active = TRUE WHERE material_id = $1",
          [existingMaterial.rows[0].material_id]
        );
        const reactivatedMaterial = await pool.query(
          "SELECT * FROM materials WHERE material_id = $1",
          [existingMaterial.rows[0].material_id]
        );
        return res.status(200).json(reactivatedMaterial.rows[0]);
      }
      return res.status(400).json({ message: "Material with this grade and code combination already exists" });
    }

    const result = await pool.query(
      "INSERT INTO materials (material_grade, material_code, is_active) VALUES ($1, $2, TRUE) RETURNING *",
      [material_grade, material_code || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Material Error:", err.message);
    
    if (err.code === '23505') {
      return res.status(400).json({ message: "Material with this grade and code combination already exists" });
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
    const { material_grade, material_code } = req.body;

    if (!material_grade) {
      return res.status(400).json({ message: "Material grade is required" });
    }

    // Get the current material values before update
    const currentMaterial = await client.query(
      "SELECT material_grade, material_code FROM materials WHERE material_id = $1",
      [id]
    );

    if (currentMaterial.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Material not found" });
    }

    const oldMaterialGrade = currentMaterial.rows[0].material_grade;
    const oldMaterialCode = currentMaterial.rows[0].material_code;

    // Check if another material with same grade AND code exists
    const duplicateCheck = await client.query(
      "SELECT * FROM materials WHERE material_grade = $1 AND material_code = $2 AND material_id != $3 AND is_active = TRUE",
      [material_grade, material_code || null, id]
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Another material with this grade and code combination already exists" });
    }

    // Update material in materials table
    const result = await client.query(
      "UPDATE materials SET material_grade = $1, material_code = $2 WHERE material_id = $3 RETURNING *",
      [material_grade, material_code || null, id]
    );

    await client.query('COMMIT'); // Commit transaction
    res.json(result.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error("Update Material Error:", err.message);
    
    if (err.code === '23505') {
      return res.status(400).json({ message: "Another material with this grade and code combination already exists" });
    }
    
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    client.release();
  }
};

// @desc Delete a material (soft delete)
// @route DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if material exists
    const existingMaterial = await pool.query(
      "SELECT material_grade FROM materials WHERE material_id = $1",
      [id]
    );

    if (existingMaterial.rows.length === 0) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Soft delete - mark as inactive instead of deleting
    await pool.query(
      "UPDATE materials SET is_active = FALSE WHERE material_id = $1",
      [id]
    );

    res.json({ message: "Material removed from options successfully" });
  } catch (err) {
    console.error("Delete Material Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};