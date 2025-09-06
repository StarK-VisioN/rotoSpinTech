import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Edit2, X, LoaderCircle, Plus, Settings, AlertTriangle } from "lucide-react";
import Title from "../components/Title";

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;

// helper to get token (supports both stored patterns)
const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))?.token || localStorage.getItem("token");
  } catch {
    return localStorage.getItem("token");
  }
};

const EntryRawStock = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [colorManagerVisible, setColorManagerVisible] = useState(false);
  const [materialManagerVisible, setMaterialManagerVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingColors, setLoadingColors] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [showCustomMaterialInput, setShowCustomMaterialInput] = useState(false);
  const [customMaterialGrade, setCustomMaterialGrade] = useState("");
  const [customMaterialCode, setCustomMaterialCode] = useState("");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editMaterialGrade, setEditMaterialGrade] = useState("");
  const [editMaterialCode, setEditMaterialCode] = useState("");

  const [formData, setFormData] = useState({
    material_grade: "",
    material_code: "",
    vendor_name: "",
    colors: [],
    kgPerColor: {},
    ratePerKg: {},
    invoice_number: "",
    invoice_date: "",
    remarks: "",
  });

  const [entries, setEntries] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [materialGradeOptions, setMaterialGradeOptions] = useState([]);

  // Predefined material grades
  const predefinedMaterialGrades = ["LLDPE", "Octane", "FlexiTuff-2", "Hexane"];
  // Predefined colors
  const predefinedColors = ["black", "blue", "green", "red", "white", "yellow"];

  // Format numbers with Indian commas & returns empty string for blank inputs.
  const formatNumber = (num) => {
    if (num === "" || num === null || num === undefined || Number.isNaN(Number(num))) return "";
    return new Intl.NumberFormat("en-IN").format(Number(num));
  };

  // Fetch available colors from backend
  const fetchColors = async () => {
    try {
      setLoadingColors(true);
      const token = getToken();
      const res = await axios.get(`${BASE_URL}/api/colors`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      // Filter out predefined colors and only keep custom colors
      const customColors = res.data.filter(color => 
        color.is_custom && !predefinedColors.includes(color.color_name.toLowerCase())
      );
      
      setColorOptions(customColors || []);
    } catch (err) {
      console.error("Fetch Colors Error:", err.message);
      toast.error("Failed to fetch colors!", { autoClose: 4000 });
    } finally {
      setLoadingColors(false);
    }
  };

  // Fetch material options from backend
  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const token = getToken();
      const res = await axios.get(`${BASE_URL}/api/materials`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setMaterialOptions(res.data || []);
    } catch (err) {
      console.error("Fetch Materials Error:", err.message);
      toast.error("Failed to fetch materials!", { autoClose: 4000 });
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Fetch material grade options
  const fetchMaterialGrades = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${BASE_URL}/api/raw-stock/material-grades`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setMaterialGradeOptions(res.data || []);
    } catch (err) {
      console.error("Fetch Material Grades Error:", err.message);
      // If the API fails, use predefined material grades as fallback
      setMaterialGradeOptions(predefinedMaterialGrades);
    }
  };

  // Fetch existing entries
  const fetchEntries = async () => {
    try {
      setLoadingEntries(true);
      const token = getToken();
      const res = await axios.get(`${BASE_URL}/api/raw-stock`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setEntries(res.data || []);
    } catch (err) {
      console.error("Fetch Entries Error:", err.message);
      toast.error("Failed to fetch raw stock entries!", { autoClose: 4000 });
      // Set empty array instead of showing error
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchColors();
    fetchMaterials();
    fetchMaterialGrades();
    fetchEntries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add a custom material
  const handleAddCustomMaterial = async () => {
    if (!customMaterialGrade.trim()) {
      toast.error("Please enter a material grade", { autoClose: 4000 });
      return;
    }

    try {
      const token = getToken();
      const response = await axios.post(`${BASE_URL}/api/materials`, {
        material_grade: customMaterialGrade.trim(),
        material_code: customMaterialCode.trim() || null
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 201) {
        toast.success("Material added successfully!", { autoClose: 4000 });
        setCustomMaterialGrade("");
        setCustomMaterialCode("");
        setShowCustomMaterialInput(false);
        fetchMaterials();
        fetchMaterialGrades();
        
        // Set the form to use the new material
        setFormData(prev => ({
          ...prev,
          material_grade: response.data.material_grade,
          material_code: response.data.material_code || ""
        }));
      }
    } catch (err) {
      console.error("Add Material Error:", err.message);
      if (err.response?.status === 400) {
        toast.error(err.response.data.message, { autoClose: 4000 });
      } else {
        toast.error("Error adding material!", { autoClose: 4000 });
      }
    }
  };

  // Update a material
  const handleUpdateMaterial = async (materialId, newGrade, newCode) => {
    if (!newGrade.trim()) {
      toast.error("Please enter a material grade", { autoClose: 4000 });
      return;
    }

    try {
      const token = getToken();
      const response = await axios.put(`${BASE_URL}/api/materials/${materialId}`, {
        material_grade: newGrade.trim(),
        material_code: newCode.trim() || null
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 200) {
        toast.success("Material updated successfully!", { autoClose: 4000 });
        setEditingMaterial(null);
        fetchMaterials();
        fetchMaterialGrades();
        
        // Update the form if the edited material is currently selected
        if (formData.material_grade === response.data.material_grade) {
          setFormData(prev => ({
            ...prev,
            material_grade: response.data.material_grade,
            material_code: response.data.material_code || ""
          }));
        }
      }
    } catch (err) {
      console.error("Update Material Error:", err.message);
      if (err.response?.status === 400) {
        toast.error(err.response.data.message, { autoClose: 4000 });
      } else {
        toast.error("Error updating material!", { autoClose: 4000 });
      }
    }
  };

  // Add a custom color
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) {
      toast.error("Please enter a color name", { autoClose: 4000 });
      return;
    }
    
    // Check if color already exists (case insensitive)
    const normalizedCustomName = customColorName.trim().toLowerCase();
    const exists = formData.colors.some(c => 
      c.color_name.toLowerCase() === normalizedCustomName
    );
    
    if (exists) {
      toast.error("This color has already been added", { autoClose: 4000 });
      return;
    }
    
    // Create a temporary ID for the custom color (will be replaced with real ID on submit)
    const tempId = `custom-${Date.now()}`;
    
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { 
        color_id: tempId, 
        color_name: customColorName.trim(),
        is_custom: true 
      }],
      kgPerColor: { ...prev.kgPerColor, [tempId]: "" },
      ratePerKg: { ...prev.ratePerKg, [tempId]: "" },
    }));
    
    setCustomColorName("");
    setShowCustomColorInput(false);
  };

  // Add a selected color to the form (preserves insertion order)
  const handleAddColor = (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;
    
    // Check if it's a predefined color or a custom color from the database
    if (predefinedColors.includes(selectedValue)) {
      // It's a predefined color
      const colorName = selectedValue;
      
      // Check if this color has already been added
      if (formData.colors.some(c => c.color_name.toLowerCase() === colorName.toLowerCase())) {
        toast.error("This color has already been added", { autoClose: 4000 });
        return;
      }
      
      // Add the predefined color
      const tempId = `predefined-${Date.now()}`;
      
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { 
          color_id: tempId, 
          color_name: colorName,
          is_custom: false 
        }],
        kgPerColor: { ...prev.kgPerColor, [tempId]: "" },
        ratePerKg: { ...prev.ratePerKg, [tempId]: "" },
      }));
    } else {
      // It's a custom color from the database
      const colorId = selectedValue;
      const colorObj = colorOptions.find((c) => String(c.color_id) === String(colorId));
      
      if (!colorObj) return;
      
      // Check if this color has already been added
      if (formData.colors.some((c) => String(c.color_id) === String(colorObj.color_id))) {
        toast.error("This color has already been added", { autoClose: 4000 });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { 
          color_id: colorObj.color_id, 
          color_name: colorObj.color_name,
          is_custom: false 
        }],
        // initialize as empty strings so the inputs are empty (no default 0)
        kgPerColor: { ...prev.kgPerColor, [colorObj.color_id]: "" },
        ratePerKg: { ...prev.ratePerKg, [colorObj.color_id]: "" },
      }));
    }
    
    // Reset the select value
    e.target.value = "";
  };

  // Remove a color line in the form (does not touch DB until submit)
  const handleRemoveColor = (color_id) => {
    setFormData((prev) => {
      const newColors = prev.colors.filter((c) => String(c.color_id) !== String(color_id));
      const newKg = { ...prev.kgPerColor };
      const newRate = { ...prev.ratePerKg };
      delete newKg[color_id];
      delete newRate[color_id];
      return { ...prev, colors: newColors, kgPerColor: newKg, ratePerKg: newRate };
    });
  };

// Remove a custom color from the options (soft delete)
const handleRemoveCustomColor = async (color_id, color_name) => {
  try {
    // Check if this is a saved custom color (not a temporary one)
    if (color_id.toString().startsWith('custom-') || color_id.toString().startsWith('predefined-')) {
      // This is a temporary color that hasn't been saved yet
      handleRemoveColor(color_id);
      return;
    }
    
    const token = getToken();
    const response = await axios.delete(`${BASE_URL}/api/colors/${color_id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    
    if (response.status === 200) {
      toast.success(`Color "${color_name}" removed from options successfully`, { autoClose: 4000 });
      // Remove from form if it's currently selected
      if (formData.colors.some(c => String(c.color_id) === String(color_id))) {
        handleRemoveColor(color_id);
      }
      // Refresh color options
      fetchColors();
    }
  } catch (err) {
    console.error("Delete Custom Color Error:", err.message);
    if (err.response?.status === 404) {
      toast.error("Color not found or already deleted", { autoClose: 4000 });
    } else if (err.response?.status === 400) {
      toast.error(err.response.data.message, { autoClose: 4000 });
    } else {
      toast.error("Error deleting color!", { autoClose: 4000 });
    }
  }
};

// Delete a material from the material options list (soft delete)
const handleDeleteMaterialOption = async (material_id, material_grade) => {
  const confirmToast = ({ closeToast }) => (
    <div>
      <p>Are you sure you want to remove the material "{material_grade}" from the options list?</p>
      <p className="text-sm text-gray-600 mt-1">
        This will only remove it from the selection options. Existing entries using this material will remain unchanged.
      </p>
      <div className="flex justify-end mt-2 gap-2">
        <button
          className="bg-red-600 text-white px-2 py-1 rounded"
          onClick={async () => {
            try {
              const token = getToken();
              const response = await axios.delete(`${BASE_URL}/api/materials/${material_id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              });
              
              if (response.status === 200) {
                toast.dismiss();
                toast.success(`Material "${material_grade}" removed from options successfully`, { autoClose: 4000 });
                fetchMaterials();
                fetchMaterialGrades();
              }
            } catch (err) {
              console.error("Delete Material Option Error:", err.message);
              toast.dismiss();
              if (err.response?.status === 404) {
                toast.error("Material not found or already deleted", { autoClose: 4000 });
              } else if (err.response?.status === 400) {
                toast.error(err.response.data.message, { autoClose: 4000 });
              } else {
                toast.error("Error deleting material!", { autoClose: 4000 });
              }
            }
          }}
        >
          Yes
        </button>
        <button
          className="bg-gray-300 px-2 py-1 rounded"
          onClick={() => toast.dismiss()}
        >
          No
        </button>
      </div>
    </div>
  );
  toast.info(confirmToast, { autoClose: false });
};

  const handleKgChange = (color_id, value) => {
    // keep empty string when user clears input
    setFormData((prev) => ({
      ...prev,
      kgPerColor: { ...prev.kgPerColor, [color_id]: value === "" ? "" : value },
    }));
  };

  const handleRateChange = (color_id, value) => {
    setFormData((prev) => ({
      ...prev,
      ratePerKg: { ...prev.ratePerKg, [color_id]: value === "" ? "" : value },
    }));
  };

  // totals treat blank as 0
  const totalKg = Object.values(formData.kgPerColor).reduce(
    (acc, v) => acc + (parseFloat(v) || 0),
    0
  );
  const totalAmount = Object.entries(formData.kgPerColor).reduce(
    (acc, [cid, kg]) => acc + (parseFloat(kg) || 0) * (parseFloat(formData.ratePerKg[cid]) || 0),
    0
  );

  // Create / Update entry
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  // basic validation
  if (!formData.material_grade) {
    toast.error("Select or create a material grade", { autoClose: 4000 });
    setSubmitting(false);
    return;
  }
  if (!formData.invoice_number) {
    toast.error("Enter invoice number", { autoClose: 4000 });
    setSubmitting(false);
    return;
  }
  if (!formData.invoice_date) {
    toast.error("Select invoice date", { autoClose: 4000 });
    setSubmitting(false);
    return;
  }
  if (!formData.colors || formData.colors.length === 0) {
    toast.error("Select at least one color", { autoClose: 4000 });
    setSubmitting(false);
    return;
  }

    // prepare payload
    const payload = {
    material_grade: formData.material_grade,
    material_code: formData.material_code, 
    vendor_name: formData.vendor_name,
    colors: formData.colors.map((c) => ({
      color_id: c.is_custom ? null : (c.color_id.toString().startsWith('predefined-') ? null : c.color_id),
      color_name: c.color_name,
      is_custom: c.is_custom || c.color_id.toString().startsWith('predefined-'),
      kgs: parseFloat(formData.kgPerColor[c.color_id]) || 0,
      rate_per_kg: parseFloat(formData.ratePerKg[c.color_id]) || 0,
    })),
    invoice_number: formData.invoice_number,
    invoice_date: formData.invoice_date,
    remarks: formData.remarks,
  };

    try {
    const token = getToken();
    if (editingId) {
      await axios.put(`${BASE_URL}/api/raw-stock/${editingId}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      toast.success("Raw stock updated successfully!", { autoClose: 4000 });
    } else {
      await axios.post(`${BASE_URL}/api/raw-stock`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      toast.success("Raw stock added successfully!", { autoClose: 4000 });
    }

      // reset
      setFormData({
      material_grade: "",
      material_code: "",
      vendor_name: "",
      colors: [],
      kgPerColor: {},
      ratePerKg: {},
      invoice_number: "",
      invoice_date: "",
      remarks: "",
    });
    setEditingId(null);
    setFormVisible(false);
    fetchEntries();
    fetchColors(); // Refresh colors in case new custom colors were added
  } catch (err) {
    console.error("Submit Error:", err.response?.data || err.message);
    toast.error("Error submitting entry!", { autoClose: 4000 });
  } finally {
    setSubmitting(false);
  }
};

  // Load data into form for editing group (pre-fill color lines in order returned by backend)
  const handleEdit = (entry) => {
    setFormVisible(true);
    setEditingId(entry.order_id);
    toast.info("Editing mode enabled", { autoClose: 4000 });

    // Map details to color objects
    const colors = (entry.details || []).map((d) => {
      return { 
        color_id: d.color_id, 
        color_name: d.color,
        is_custom: false // Assume existing colors are not custom
      };
    });

    const kgPerColor = {};
    const ratePerKg = {};
    (entry.details || []).forEach((d) => {
      if (d.color_id != null) {
        // keep as string so input shows exactly value or empty string
        kgPerColor[d.color_id] = d.kgs != null ? String(d.kgs) : "";
        ratePerKg[d.color_id] = d.rate_per_kg != null ? String(d.rate_per_kg) : "";
      }
    });

    setFormData({
      material_grade: entry.material_grade || "",
      material_code: entry.material_code || "",
      vendor_name: entry.vendor_name || "",
      colors,
      kgPerColor,
      ratePerKg,
      invoice_number: entry.invoice_number || "",
      invoice_date: entry.invoice_date ? entry.invoice_date.split("T")[0] : "",
      remarks: entry.remarks || "",
    });
  };

  // Delete whole entry (group)
  const handleDeleteGroup = (order_id) => {
    const confirmToast = ({ closeToast }) => (
      <div>
        <p>Are you sure you want to delete this group?</p>
        <div className="flex justify-end mt-2 gap-2">
          <button
            className="bg-red-600 text-white px-2 py-1 rounded"
            onClick={async () => {
              try {
                setLoading(true);
                const token = getToken();
                await axios.delete(`${BASE_URL}/api/raw-stock/${order_id}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                fetchEntries();
                toast.dismiss();
                toast.success("Raw stock deleted successfully!", { autoClose: 4000 });
              } catch (err) {
                console.error("Delete Error:", err.response?.data || err.message);
                toast.error("Error deleting entry!", { autoClose: 4000 });
              } finally {
                setLoading(false);
              }
            }}
          >
            Yes
          </button>
          <button
            className="bg-gray-300 px-2 py-1 rounded"
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>
    );
    toast.info(confirmToast, { autoClose: false });
  };

  // Delete a single color row (detail) - only from this specific entry
  const handleDeleteColor = (order_id, detail_id, color_name) => {
    const confirmToast = ({ closeToast }) => (
      <div>
        <p>Are you sure you want to delete the color "{color_name}" from this entry?</p>
        <p className="text-sm text-gray-600 mt-1">
          This will only remove the color from this specific entry. 
          If this color is not used in any other entries, it will be permanently deleted.
        </p>
        <div className="flex justify-end mt-2 gap-2">
          <button
            className="bg-red-600 text-white px-2 py-1 rounded"
            onClick={async () => {
              try {
                setLoading(true);
                const token = getToken();
                await axios.delete(`${BASE_URL}/api/raw-stock/${order_id}/color/${detail_id}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                fetchEntries();
                toast.dismiss();
                toast.success("Color removed from this entry successfully!", { autoClose: 4000 });
              } catch (err) {
                console.error("Delete Color Error:", err.response?.data || err.message);
                if (err.response?.status === 404) toast.error("Color not found or already deleted", { autoClose: 4000 });
                else toast.error("Error deleting color!", { autoClose: 4000 });
              } finally {
                setLoading(false);
              }
            }}
          >
            Yes
          </button>
          <button
            className="bg-gray-300 px-2 py-1 rounded"
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>
    );
    toast.info(confirmToast, { autoClose: false });
  };

  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ENTRY"} text2={"RAW STOCK"} />
      </div>
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="flex justify-end my-4 gap-2">
        <button
          onClick={() => setColorManagerVisible(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Settings size={18} />
          Manage Colors
        </button>
        <button
          onClick={() => setMaterialManagerVisible(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2"
        >
          <Settings size={18} />
          Manage Materials
        </button>
        <button
          onClick={() => {
            setFormVisible(true);
            setEditingId(null);
            // reset form for new entry
            setFormData({
              material_grade: "",
              material_code: "",
              vendor_name: "",
              colors: [],
              kgPerColor: {},
              ratePerKg: {},
              invoice_number: "",
              invoice_date: "",
              remarks: "",
            });
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          New Raw Stock
        </button>
      </div>

      {/* Color Manager Modal */}
      {colorManagerVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
            <X
              size={28}
              className="absolute top-3 right-3 text-red-600 cursor-pointer hover:text-red-800 z-10"
              onClick={() => setColorManagerVisible(false)}
            />
            <h2 className="text-2xl font-bold mb-6 text-center">
              Manage Colors
            </h2>

            <div className="overflow-y-auto flex-grow pr-2 -mr-2">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Predefined Colors</h3>
                <div className="border rounded p-2">
                  {predefinedColors.map(color => (
                    <div key={color} className="flex justify-between items-center py-1 border-b last:border-b-0">
                      <span className="capitalize">{color}</span>
                      <span className="text-xs text-gray-500">Predefined</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Custom Colors</h3>
                <div className="border rounded p-2">
                  {colorOptions.length === 0 ? (
                    <p className="text-gray-500">No custom colors</p>
                  ) : (
                    colorOptions.map(color => (
                      <div key={color.color_id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                        <span>{color.color_name}</span>
                        <button
                          onClick={() => handleRemoveCustomColor(color.color_id, color.color_name)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete this color from the system"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setColorManagerVisible(false)}
                  className="w-full bg-gray-600 text-white py-2 rounded font-semibold hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Material Manager Modal */}
      {materialManagerVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
            <X
              size={28}
              className="absolute top-3 right-3 text-red-600 cursor-pointer hover:text-red-800 z-10"
              onClick={() => setMaterialManagerVisible(false)}
            />
            <h2 className="text-2xl font-bold mb-6 text-center">
              Manage Materials
            </h2>

            <div className="overflow-y-auto flex-grow pr-2 -mr-2">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Predefined Materials</h3>
                <div className="border rounded p-2">
                  {predefinedMaterialGrades.map(grade => (
                    <div key={grade} className="py-2 border-b last:border-b-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{grade}</div>
                          <div className="text-sm text-gray-500">Code: Not specified</div>
                        </div>
                        <span className="text-xs text-gray-500">Predefined</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Custom Materials</h3>
                <div className="border rounded p-2">
                  {materialOptions.length === 0 ? (
                    <p className="text-gray-500">No custom materials found</p>
                  ) : (
                    materialOptions.map(material => (
                      <div key={material.material_id} className="py-2 border-b last:border-b-0">
                        {editingMaterial === material.material_id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editMaterialGrade}
                              onChange={(e) => setEditMaterialGrade(e.target.value)}
                              className="border p-2 rounded"
                              placeholder="Material Grade"
                            />
                            <input
                              type="text"
                              value={editMaterialCode}
                              onChange={(e) => setEditMaterialCode(e.target.value)}
                              className="border p-2 rounded"
                              placeholder="Material Code (Optional)"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleUpdateMaterial(material.material_id, editMaterialGrade, editMaterialCode)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMaterial(null)}
                                className="bg-gray-300 px-3 py-1 rounded text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{material.material_grade}</div>
                              <div className="text-sm text-gray-500">Code: {material.material_code || "Not specified"}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingMaterial(material.material_id);
                                  setEditMaterialGrade(material.material_grade);
                                  setEditMaterialCode(material.material_code || "");
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit this material"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteMaterialOption(material.material_id, material.material_grade)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete this material"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Add New Material</h3>
                <div className="border rounded p-3">
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Material Grade</label>
                    <input
                      type="text"
                      value={customMaterialGrade}
                      onChange={(e) => setCustomMaterialGrade(e.target.value)}
                      placeholder="Enter material grade"
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div className="mb-2">
  <label className="block text-sm font-medium mb-1">Material Code (Optional)</label>
  <input
    type="text"
    value={customMaterialCode}
    onChange={(e) => setCustomMaterialCode(e.target.value)}
    placeholder="Enter material code (numbers, letters, symbols)"
    className="border p-2 rounded w-full"
  />
</div>
<button
  onClick={handleAddCustomMaterial}
  className="bg-blue-600 text-white px-3 py-2 rounded w-full"
>
  Add Material
</button>
</div>
</div>

<div className="mt-6">
  <button
    onClick={() => setMaterialManagerVisible(false)}
    className="w-full bg-gray-600 text-white py-2 rounded font-semibold hover:bg-gray-700"
  >
    Close
  </button>
</div>
</div>
</div>
</div>
)}

{/* Modal Form */}
{formVisible && (
<div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
  <div className="bg-white p-6 rounded-2xl w-full max-w-lg relative shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
    <X
      size={28}
      className="absolute top-3 right-3 text-red-600 cursor-pointer hover:text-red-800 z-10"
      onClick={() => {
        setFormVisible(false);
        setEditingId(null);
      }}
    />
    <h2 className="text-2xl font-bold mb-6 text-center">
      {editingId ? "Edit Raw Stock" : "New Raw Stock"}
    </h2>

    <div className="overflow-y-auto flex-grow pr-2 -mr-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Material Selection */}
        <div>
          <label className="block font-semibold mb-1">Material Grade</label>
          <select
            value={formData.material_grade}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                material_grade: e.target.value
              }));
            }}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Select Material Grade</option>
            {predefinedMaterialGrades.map(grade => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
            {materialOptions.map((material) => (
              <option key={material.material_id} value={material.material_grade}>
                {material.material_grade}
              </option>
            ))}
          </select>
          
          <div className="mt-2">
            <label className="block font-semibold mb-1">Material Code (Optional)</label>
            <input
              type="text"
              name="material_code"
              value={formData.material_code}
              onChange={handleChange}
              placeholder="Enter material code (optional)"
              className="border p-2 rounded w-full"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowCustomMaterialInput(!showCustomMaterialInput)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-1"
          >
            <Plus size={16} /> {showCustomMaterialInput ? "Cancel" : "Add New Material Grade"}
          </button>
          
          {showCustomMaterialInput && (
            <div className="mt-2 p-3 border rounded bg-gray-50">
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Material Grade</label>
                <input
                  type="text"
                  value={customMaterialGrade}
                  onChange={(e) => setCustomMaterialGrade(e.target.value)}
                  placeholder="Enter material grade"
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Material Code (Optional)</label>
                <input
                  type="text"
                  value={customMaterialCode}
                  onChange={(e) => setCustomMaterialCode(e.target.value)}
                  placeholder="Enter material code (numbers, letters, symbols)"
                  className="border p-2 rounded w-full"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomMaterial}
                className="bg-blue-600 text-white px-3 py-2 rounded w-full"
              >
                Add Material
              </button>
            </div>
          )}
        </div>

        {/* Vendor Name */}
        <div>
          <label className="block font-semibold mb-1">Vendor's Name (Optional)</label>
          <input
            type="text"
            name="vendor_name"
            value={formData.vendor_name}
            onChange={handleChange}
            placeholder="Enter vendor's name"
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Select / Add Color */}
        <div>
          <label className="block font-semibold mb-1">Select Color</label>
          <select 
            onChange={handleAddColor} 
            className="border p-2 rounded w-full mb-2" 
            value=""
            disabled={loadingColors}
          >
            <option value="">--Select a color--</option>
            {predefinedColors.map(color => (
              <option
                key={color}
                value={color}
                disabled={formData.colors.some(c => c.color_name.toLowerCase() === color.toLowerCase())}
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </option>
            ))}
            {colorOptions.filter(c => c.is_custom).map(c => (
              <option
                key={c.color_id}
                value={c.color_id}
                disabled={formData.colors.some(fc => String(fc.color_id) === String(c.color_id))}
              >
                {c.color_name}
              </option>
            ))}
          </select>
          
          {/* Add Custom Color Button */}
          {!showCustomColorInput ? (
            <button
              type="button"
              onClick={() => setShowCustomColorInput(true)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Plus size={16} /> Add Custom Color
            </button>
          ) : (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                placeholder="Enter custom color name"
                className="border p-2 rounded flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                className="bg-blue-600 text-white px-3 py-2 rounded"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowCustomColorInput(false)}
                className="bg-gray-300 px-3 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Dynamic color rows (KG + Rate) */}
        {formData.colors.map((c) => (
          <div key={c.color_id} className="grid grid-cols-3 gap-2 items-end border-b pb-3">
            <div>
              <label className="block font-semibold">
                {c.color_name} {c.is_custom && "(Custom)"} (KG)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.kgPerColor[c.color_id] ?? ""}
                onChange={(e) => handleKgChange(c.color_id, e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">
                {c.color_name} Rate per KG
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ratePerKg[c.color_id] ?? ""}
                  onChange={(e) => handleRateChange(c.color_id, e.target.value)}
                  className="border p-2 rounded w-full pl-8"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => handleRemoveColor(c.color_id)}
                className="text-red-600 hover:text-red-800"
                title="Remove from this entry"
              >
                Remove
              </button>
              
              {/* Show delete button only for saved custom colors */}
              {c.is_custom && !c.color_id.toString().startsWith('custom-') && !c.color_id.toString().startsWith('predefined-') && (
                <button
                  type="button"
                  onClick={() => handleRemoveCustomColor(c.color_id, c.color_name)}
                  className="text-red-800 hover:text-red-900 text-xs flex items-center gap-1"
                  title="Permanently delete this custom color"
                >
                  <Trash2 size={14} />
                  Delete Color
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Totals */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-semibold">Total KG</label>
            <input
              type="text"
              value={formatNumber(totalKg)}
              className="border p-2 rounded w-full bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block font-semibold">Total Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">₹</span>
              </div>
              <input
                type="text"
                value={formatNumber(totalAmount)}
                className="border p-2 rounded w-full bg-gray-100 pl-8"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Invoice */}
        <div>
          <label className="block font-semibold mb-1">Invoice Number</label>
          <input
            type="text"
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Invoice Date</label>
          <input
            type="date"
            name="invoice_date"
            value={formData.invoice_date}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block font-semibold mb-1">Remarks (Optional)</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows="3"
            placeholder="Add any remarks here..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <LoaderCircle className="animate-spin" size={20} />
              {editingId ? "Updating..." : "Submitting..."}
            </>
          ) : (
            editingId ? "Update" : "Submit"
          )}
        </button>
      </form>
    </div>
  </div>
</div>
)}

{/* Table with loading state */}
<div className="overflow-x-auto mt-6">
  {loadingEntries ? (
    <div className="flex justify-center items-center py-20">
      <div className="text-center">
        <LoaderCircle className="animate-spin mx-auto mb-4" size={48} />
        <p className="text-gray-600">Loading raw stock entries...</p>
      </div>
    </div>
  ) : (
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-100 text-center">
          <th className="px-4 py-2 border">Vendor's Name</th>
          <th className="px-4 py-2 border">Material Grade</th>
          <th className="px-4 py-2 border">Material Code</th>
          <th className="px-4 py-2 border">Invoice Number</th>
          <th className="px-4 py-2 border">Invoice Date</th>
          <th className="px-4 py-2 border">Color</th>
          <th className="px-4 py-2 border">KG</th>
          <th className="px-4 py-2 border">Rate / KG</th>
          <th className="px-4 py-2 border">Total KG</th>
          <th className="px-4 py-2 border">Total Amount</th>
          <th className="px-4 py-2 border">Remarks</th>
          <th className="px-4 py-2 border">Edit</th>
          <th className="px-4 py-2 border">Delete Color</th>
          <th className="px-4 py-2 border">Delete Group</th>
        </tr>
      </thead>
      <tbody className="text-center">
        {entries.length === 0 ? (
          <tr>
            <td colSpan={14} className="py-4">
              No entries yet
            </td>
          </tr>
        ) : (
          entries.map((entry) => {
            const rows = entry.details || [];
            const rowSpan = Math.max(rows.length, 1);

            // render per-color rows while showing group-level cells once with rowSpan
            return rows.length > 0 ? (
              rows.map((d, idx) => {
                const isFirst = idx === 0;
                return (
                  <tr key={`${entry.order_id}-${d.detail_id ?? idx}`}>
                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        {entry.vendor_name || "-"}
                      </td>
                    )}
                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        {entry.material_grade}
                      </td>
                    )}
                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        {entry.material_code || "-"}
                      </td>
                    )}
                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        {entry.invoice_number}
                      </td>
                    )}
                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        {entry.invoice_date ? entry.invoice_date.split("T")[0] : ""}
                      </td>
                    )}

                    <td className="px-4 py-2 border">{d.color}</td>
                    <td className="px-4 py-2 border">{formatNumber(d.kgs)}</td>
                    <td className="px-4 py-2 border">₹ {formatNumber(d.rate_per_kg)}</td>

                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        {formatNumber(entry.total_kgs)}
                      </td>
                    )}
                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        ₹ {formatNumber(entry.total_amount)}
                      </td>
                    )}
                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        {entry.remarks || "-"}
                      </td>
                    )}

                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit this entry"
                      >
                        <Edit2 />
                      </button>
                    </td>

                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleDeleteColor(entry.order_id, d.detail_id, d.color)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete this color from this entry"
                      >
                        <Trash2 />
                      </button>
                    </td>

                    {isFirst && (
                      <td className="px-4 py-2 border align-middle" rowSpan={rowSpan}>
                        <button
                          onClick={() => handleDeleteGroup(entry.order_id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete entire entry"
                        >
                          <Trash2 />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              // fallback (shouldn't normally happen)
              <tr key={`${entry.order_id}-empty`}>
                <td className="px-4 py-2 border">{entry.vendor_name || "-"}</td>
                <td className="px-4 py-2 border">{entry.material_grade}</td>
                <td className="px-4 py-2 border">{entry.material_code || "-"}</td>
                <td className="px-4 py-2 border">{entry.invoice_number}</td>
                <td className="px-4 py-2 border">{entry.invoice_date?.split("T")[0] || ""}</td>
                <td className="px-4 py-2 border" colSpan={3}>
                  No colors
                </td>
                <td className="px-4 py-2 border">{formatNumber(entry.total_kgs)}</td>
                <td className="px-4 py-2 border">₹ {formatNumber(entry.total_amount)}</td>
                <td className="px-4 py-2 border">{entry.remarks || "-"}</td>
                <td className="px-4 py-2 border">
                  <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 />
                  </button>
                </td>
                <td className="px-4 py-2 border">
                  <button onClick={() => handleDeleteGroup(entry.order_id)} className="text-red-600 hover:text-red-800">
                    <Trash2 />
                  </button>
                </td>
                <td className="px-4 py-2 border" />
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  )}
</div>
</div>
);
};

export default EntryRawStock;