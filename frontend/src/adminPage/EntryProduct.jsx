import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Edit2, X, LoaderCircle, Plus, MoreVertical, Settings, AlertTriangle } from "lucide-react";
import Title from "../components/Title";
import { API_PATHS } from "../../utils/apiPaths";

const colorMap = {
  yellow: "#FFD700",
  black: "#000000",
  blue: "#0000FF",
  red: "#FF0000",
  green: "#008000",
  white: "#FFFFFF",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  brown: "#A52A2A",
  gray: "#808080",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  teal: "#008080",
  navy: "#000080",
  maroon: "#800000",
  olive: "#808000",
  lime: "#00FF00",
  indigo: "#4B0082",
  turquoise: "#40E0D0",
  silver: "#C0C0C0",
  beige: "#F5F5DC",
  lavender: "#E6E6FA",
  coral: "#FF7F50",
  crimson: "#DC143C",
  khaki: "#F0E68C",
  salmon: "#FA8072",
  mint: "#98FF98",
};

const EntryProduct = () => {
  // useStates
  const [entries, setEntries] = useState([]);
  const [sapProducts, setSapProducts] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [sapManagerVisible, setSapManagerVisible] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingSapProducts, setLoadingSapProducts] = useState(true);
  const [showNewSapForm, setShowNewSapForm] = useState(false);
  const [showEditSapForm, setShowEditSapForm] = useState(false);
  const [newSapLoading, setNewSapLoading] = useState(false);
  const [editSapLoading, setEditSapLoading] = useState(false);
  const [sapActionsOpen, setSapActionsOpen] = useState(null);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [customColor, setCustomColor] = useState("");
  const [showEditCustomColorInput, setShowEditCustomColorInput] = useState(false);
  const [editCustomColor, setEditCustomColor] = useState("");

  const [formData, setFormData] = useState({
    client_name: "AeroMarine",
    sap_name: "",
    part_description: "",
    unit: "",
    color: "",
    quantity: "",
    remarks: "",
  });

  const [newSapData, setNewSapData] = useState({
    sap_name: "",
    part_description: "",
    unit: "",
    color: "",
    remarks: "",
    weight_per_unit: "",
  });

  const [editSapData, setEditSapData] = useState({
    original_sap_name: "",
    sap_name: "",
    part_description: "",
    unit: "",
    color: "",
    remarks: "",
    weight_per_unit: "",
    is_custom: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientNameEditable, setClientNameEditable] = useState(false);

  // Ref for dropdown
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchEntries();
    fetchSapProducts();
  }, []);

  // Update form data when SAP products change and a SAP is selected
  useEffect(() => {
    if (formData.sap_name) {
      const selectedSap = sapProducts.find(p => p.sap_name === formData.sap_name);
      if (selectedSap) {
        setFormData(prev => ({
          ...prev,
          part_description: selectedSap.part_description,
          unit: selectedSap.unit,
          remarks: selectedSap.remarks,
          color: selectedSap.color,
        }));
      }
    }
  }, [sapProducts, formData.sap_name]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSapActionsOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchEntries = async () => {
    try {
      setLoadingEntries(true);
      const res = await axiosInstance.get(API_PATHS.ENTRY_PRODUCTS.GET);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch entry products!", { autoClose: 4000 });
    } finally {
      setLoadingEntries(false);
    }
  };

  const fetchSapProducts = async () => {
    try {
      setLoadingSapProducts(true);
      const res = await axiosInstance.get(API_PATHS.SAP_PRODUCTS.GET);
      setSapProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch SAP products!", { autoClose: 4000 });
    } finally {
      setLoadingSapProducts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sap_name") {
      const selected = sapProducts.find((p) => p.sap_name === value);
      setFormData((prev) => ({
        ...prev,
        sap_name: value,
        part_description: selected ? selected.part_description : "",
        unit: selected ? selected.unit : "",
        remarks: selected ? selected.remarks : "",
        color: selected ? selected.color : "",
      }));
      setSapActionsOpen(null); // Close dropdown when selecting a new SAP
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNewSapChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "color" && value === "custom") {
      setShowCustomColorInput(true);
      setNewSapData(prev => ({ ...prev, color: "" }));
    } else if (name === "color") {
      setShowCustomColorInput(false);
      setCustomColor("");
      setNewSapData(prev => ({ ...prev, [name]: value }));
    } else {
      setNewSapData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSapChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "color" && value === "custom") {
      setShowEditCustomColorInput(true);
      setEditSapData(prev => ({ ...prev, color: "" }));
    } else if (name === "color") {
      setShowEditCustomColorInput(false);
      setEditCustomColor("");
      setEditSapData(prev => ({ ...prev, [name]: value }));
    } else {
      setEditSapData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddNewSap = async (e) => {
    e.preventDefault();
    setNewSapLoading(true);

    try {
      // Use custom color if selected, otherwise use the selected color
      const finalColor = showCustomColorInput && customColor ? customColor : newSapData.color;
      
      const res = await axiosInstance.post(API_PATHS.SAP_PRODUCTS.POST, {
        ...newSapData,
        color: finalColor,
        weight_per_unit: parseFloat(newSapData.weight_per_unit) || 1.0
      });
      
      toast.success("New SAP product added successfully!", { autoClose: 4000 });
      
      // Add the new SAP product to the list
      setSapProducts(prev => [...prev, res.data]);
      
      // Pre-fill the form with the new SAP product
      setFormData(prev => ({
        ...prev,
        sap_name: res.data.sap_name,
        part_description: res.data.part_description,
        unit: res.data.unit,
        remarks: res.data.remarks,
        color: res.data.color,
      }));
      
      setShowNewSapForm(false);
      setNewSapData({
        sap_name: "",
        part_description: "",
        unit: "",
        color: "",
        remarks: "",
        weight_per_unit: "",
      });
      setShowCustomColorInput(false);
      setCustomColor("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error adding new SAP product!", { autoClose: 4000 });
    } finally {
      setNewSapLoading(false);
    }
  };

  const handleEditSap = async (e) => {
    e.preventDefault();
    setEditSapLoading(true);

    try {
      // Use custom color if selected, otherwise use the selected color
      const finalColor = showEditCustomColorInput && editCustomColor ? editCustomColor : editSapData.color;
      
      const res = await axiosInstance.put(
        API_PATHS.SAP_PRODUCTS.PUT(editSapData.original_sap_name),
        {
          new_sap_name: editSapData.sap_name,
          part_description: editSapData.part_description,
          unit: editSapData.unit,
          remarks: editSapData.remarks,
          color: finalColor,
          weight_per_unit: parseFloat(editSapData.weight_per_unit) || 1.0
        }
      );
      
      toast.success("SAP product updated successfully!", { autoClose: 4000 });
      
      // Update the SAP products list
      setSapProducts(prev => 
        prev.map(product => 
          product.sap_name === editSapData.original_sap_name ? res.data : product
        )
      );
      
      // If the edited product is currently selected in the form, update it
      if (formData.sap_name === editSapData.original_sap_name) {
        setFormData(prev => ({
          ...prev,
          sap_name: res.data.sap_name,
          part_description: res.data.part_description,
          unit: res.data.unit,
          remarks: res.data.remarks,
          color: res.data.color,
        }));
      }
      
      setShowEditSapForm(false);
      setEditSapData({
        original_sap_name: "",
        sap_name: "",
        part_description: "",
        unit: "",
        color: "",
        remarks: "",
        weight_per_unit: "",
        is_custom: false,
      });
      setShowEditCustomColorInput(false);
      setEditCustomColor("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating SAP product!", { autoClose: 4000 });
    } finally {
      setEditSapLoading(false);
    }
  };

  const handleDeleteSap = async (sapName, isCustom) => {
    try {
      // Use soft delete API
      await axiosInstance.delete(API_PATHS.SAP_PRODUCTS.DELETE(sapName));
      
      toast.success("SAP product removed from options successfully!", {
        autoClose: 5000
      });
      
      // Remove from the SAP products list
      setSapProducts(prev => prev.filter(product => product.sap_name !== sapName));
      
      // If the deleted product is currently selected, clear the form
      if (formData.sap_name === sapName) {
        setFormData(prev => ({
          ...prev,
          sap_name: "",
          part_description: "",
          unit: "",
          remarks: "",
          color: "",
          quantity: "",
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error removing SAP product!", {
        autoClose: 5000
      });
    }
  };

  const openEditSapForm = (sapProduct) => {
    setEditSapData({
      original_sap_name: sapProduct.sap_name,
      sap_name: sapProduct.sap_name,
      part_description: sapProduct.part_description,
      unit: sapProduct.unit,
      color: sapProduct.color || "",
      remarks: sapProduct.remarks || "",
      weight_per_unit: sapProduct.weight_per_unit || "",
      is_custom: sapProduct.is_custom || false,
    });
    setShowEditSapForm(true);
    setSapActionsOpen(null);
  };

  const confirmDeleteSap = (sapName, isCustom) => {
    // Check if there are any associated entries
    const associatedEntries = entries.filter(entry => entry.sap_name === sapName);
    const entryCount = associatedEntries.length;
    
    if (entryCount > 0) {
      // Show confirmation with info about soft deletion
      const confirmToast = ({ closeToast }) => (
        <div>
          <p className="font-semibold">This SAP product is used in {entryCount} entries</p>
          <p className="text-sm text-blue-600 mt-1">
            It will be removed from selection options but all historical data (including color) will be preserved.
          </p>
          <p className="text-sm mt-2">Are you sure you want to proceed?</p>
          <div className="flex justify-end mt-3 gap-2">
            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              onClick={async () => {
                await handleDeleteSap(sapName, isCustom);
                toast.dismiss();
              }}
            >
              Yes, Remove from Options
            </button>
            <button className="bg-gray-300 px-3 py-1 rounded text-sm" onClick={() => toast.dismiss()}>
              Cancel
            </button>
          </div>
        </div>
      );
      toast.info(confirmToast, { autoClose: false });
    } else {
      // No associated entries, use simpler confirmation
      const confirmToast = ({ closeToast }) => (
        <div>
          <p>Are you sure you want to remove this SAP product from options?</p>
          <p className="text-sm text-blue-600 mt-1">
            All product information will be preserved for historical records.
          </p>
          {!isCustom && (
            <div className="flex items-start mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <AlertTriangle size={16} className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                This is a predefined SAP product. Removing it may affect system functionality.
              </p>
            </div>
          )}
          <div className="flex justify-end mt-2 gap-2">
            <button className="bg-red-600 text-white px-2 py-1 rounded"
              onClick={async () => {
                await handleDeleteSap(sapName, isCustom);
                toast.dismiss();
              }}
            >
              Yes
            </button>
            <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => toast.dismiss()}>
              No
            </button>
          </div>
        </div>
      );
      toast.info(confirmToast, { autoClose: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        client_name: formData.client_name,
        sap_name: formData.sap_name,
        quantity: Number(formData.quantity),
        // Include these fields for creating new SAP products if needed
        part_description: formData.part_description,
        unit: formData.unit,
        remarks: formData.remarks,
        color: formData.color,
      };

      if (editingId) {
        await axiosInstance.put(API_PATHS.ENTRY_PRODUCTS.PUT(editingId), payload);
        toast.success("Entry updated successfully!", { autoClose: 4000 });
        setEditingId(null);
      } else {
        await axiosInstance.post(API_PATHS.ENTRY_PRODUCTS.POST, payload);
        toast.success("Entry added successfully!", { autoClose: 4000 });
      }

      setFormData({
        client_name: "AeroMarine",
        sap_name: "",
        part_description: "",
        unit: "",
        color: "",
        quantity: "",
        remarks: "",
      });
      setClientNameEditable(false);
      setFormVisible(false);
      fetchEntries();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting entry!", { autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setFormVisible(true);
    setFormData({
      client_name: entry.client_name || "AeroMarine",
      sap_name: entry.sap_name,
      part_description: entry.part_description || "",
      unit: entry.unit || "",
      color: entry.product_color || "",
      quantity: entry.quantity,
      remarks: entry.remarks || "",
    });
    setEditingId(entry.product_id);
    toast.info("Editing mode enabled", { autoClose: 4000 });
  };

  const handleDelete = (id) => {
    const confirmToast = ({ closeToast }) => (
      <div>
        <p>Are you sure you want to delete this product?</p>
        <div className="flex justify-end mt-2 gap-2">
          <button className="bg-red-600 text-white px-2 py-1 rounded"
            onClick={async () => {
              try {
                await axiosInstance.delete(API_PATHS.ENTRY_PRODUCTS.DELETE(id));
                fetchEntries();
                toast.dismiss();
                toast.success("Product deleted successfully!", { autoClose: 4000 });
              } catch (err) {
                console.error(err);
                toast.error("Error deleting product!", { autoClose: 4000 });
              }
            }}
          >
            Yes
          </button>
                    <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => toast.dismiss()}>
            No
          </button>
        </div>
      </div>
    );
    toast.info(confirmToast, { autoClose: false });
  };

  const toggleSapActions = (sapName) => {
    setSapActionsOpen(sapActionsOpen === sapName ? null : sapName);
  };

  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1="PRODUCT" text2="ENTRY" />
      </div>

      <ToastContainer position="top-right" autoClose={4000} />

      <div className="flex justify-end my-4 gap-2">
        <button
          onClick={() => setSapManagerVisible(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Settings size={18} />
          Manage SAP Products
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setFormVisible(true)}
        >
          {editingId ? "Edit Product" : "Add Product"}
        </button>
      </div>

      {/* SAP Manager Modal */}
      {sapManagerVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-6xl relative shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
            <X
              size={28}
              className="absolute top-3 right-3 text-red-600 cursor-pointer hover:text-red-800 z-10"
              onClick={() => setSapManagerVisible(false)}
            />
            <h2 className="text-2xl font-bold mb-6 text-center">
              Manage SAP Products
            </h2>

            <div className="overflow-y-auto flex-grow pr-2 -mr-2">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">All SAP Products</h3>
                  <button
                    onClick={() => {
                      setShowNewSapForm(true);
                      setSapManagerVisible(false);
                      setFormVisible(true);
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add New SAP
                  </button>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">SAP Name</th>
                        <th className="px-4 py-2 text-left">Part Description</th>
                        <th className="px-4 py-2 text-left">Unit</th>
                        <th className="px-4 py-2 text-left">Weight (kg)</th>
                        <th className="px-4 py-2 text-left">Color</th>
                        <th className="px-4 py-2 text-left">Remarks</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sapProducts.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                            No SAP products found
                          </td>
                        </tr>
                      ) : (
                        sapProducts.map((product) => (
                          <tr key={product.sap_name} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">{product.sap_name}</td>
                            <td className="px-4 py-3">{product.part_description}</td>
                            <td className="px-4 py-3">{product.unit}</td>
                            <td className="px-4 py-3">{product.weight_per_unit ? `${product.weight_per_unit} kg` : "-"}</td>
                            <td className="px-4 py-3">
                              {product.color ? (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ 
                                      backgroundColor: colorMap[product.color.toLowerCase()] || "#ccc",
                                      borderColor: product.color.toLowerCase() === 'white' ? '#ccc' : 'transparent'
                                    }}
                                  ></div>
                                  {product.color}
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3">{product.remarks || "-"}</td>
                            <td className="px-4 py-3">
                              {product.is_custom ? (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Custom
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  Predefined
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSapManagerVisible(false);
                                    setFormVisible(true);
                                    openEditSapForm(product);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit SAP Product"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => confirmDeleteSap(product.sap_name, product.is_custom)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete SAP Product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setSapManagerVisible(false)}
                  className="w-full bg-gray-600 text-white py-2 rounded font-semibold hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg relative shadow-lg">
            <X
              size={28}
              className="absolute top-3 right-3 text-red-600 cursor-pointer hover:text-red-800"
              onClick={() => {
                setFormVisible(false);
                setEditingId(null);
                setClientNameEditable(false);
                setShowNewSapForm(false);
                setShowEditSapForm(false);
                setShowCustomColorInput(false);
                setCustomColor("");
                setShowEditCustomColorInput(false);
                setEditCustomColor("");
                setFormData({
                  client_name: "AeroMarine",
                  sap_name: "",
                  part_description: "",
                  unit: "",
                  color: "",
                  quantity: "",
                  remarks: "",
                });
              }}
            />
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editingId ? "Edit Product Entry" : "New Product Entry"}
            </h2>

            {!showNewSapForm && !showEditSapForm ? (
              <form onSubmit={handleSubmit} className="space-y-1">
                {/* Client Name with Edit button */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Client's Name</label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleChange}
                      className={`border p-1 rounded w-full ${!clientNameEditable ? "bg-gray-100" : ""}`}
                      readOnly={!clientNameEditable}
                    />
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 mt-6"
                    type="button"
                    onClick={() => setClientNameEditable((prev) => !prev)}
                  >
                    {clientNameEditable ? "Lock" : "Edit"}
                  </button>
                </div>

                {/* SAP Name with Add New button */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <label className="block font-semibold mb-1">SAP Name</label>
                    <div className="relative">
                      <select
                        name="sap_name"
                        value={formData.sap_name}
                        onChange={handleChange}
                        className="border p-1 rounded w-full pr-10"
                        required
                        disabled={loadingSapProducts}
                      >
                        <option value="">Select SAP Name</option>
                        {loadingSapProducts ? (
                          <option value="" disabled>Loading SAP products...</option>
                        ) : (
                          sapProducts.map((p) => (
                            <option key={p.sap_name} value={p.sap_name}>
                              {p.sap_name}
                            </option>
                          ))
                        )}
                      </select>
                      
                      {/* SAP Actions Dropdown */}
                      {formData.sap_name && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2" ref={dropdownRef}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSapActions(formData.sap_name);
                            }}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {sapActionsOpen === formData.sap_name && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const selected = sapProducts.find(p => p.sap_name === formData.sap_name);
                                  if (selected) openEditSapForm(selected);
                                }}
                                className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                              >
                                <Edit2 size={14} className="mr-2" />
                                Edit SAP
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const selected = sapProducts.find(p => p.sap_name === formData.sap_name);
                                  if (selected) confirmDeleteSap(formData.sap_name, selected.is_custom);
                                }}
                                className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete SAP
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewSapForm(true)}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center"
                    title="Add New SAP Product"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Auto-filled fields */}
                <div>
                  <label className="block font-semibold mb-1">Part Description</label>
                  <input
                    type="text"
                    name="part_description"
                    value={formData.part_description}
                    readOnly
                    className="border p-1 rounded w-full bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    readOnly
                    className="border p-1 rounded w-full bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    readOnly
                    rows={2}
                    className="border p-1 rounded w-full bg-gray-100"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block font-semibold mb-1">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color || "-"}
                    readOnly
                    className="border p-1 rounded w-full bg-gray-100"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="border p-1 rounded w-full"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || loadingSapProducts}
                  className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={20} />
                      {editingId ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    editingId ? "Update" : "Submit"
                  )}
                </button>
              </form>
            ) : showNewSapForm ? (
              <form onSubmit={handleAddNewSap} className="space-y-1">
                <h3 className="text-lg font-semibold mb-4 text-center">Add New SAP Product</h3>
                
                <div>
                  <label className="block font-semibold mb-1">SAP Name *</label>
                  <input
                    type="text"
                    name="sap_name"
                    value={newSapData.sap_name}
                    onChange={handleNewSapChange}
                    className="border p-1 rounded w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Part Description *</label>
                  <input
                    type="text"
                    name="part_description"
                    value={newSapData.part_description}
                    onChange={handleNewSapChange}
                    className="border p-1 rounded w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Unit *</label>
                                    <input
                    type="text"
                    name="unit"
                    value={newSapData.unit}
                    onChange={handleNewSapChange}
                    className="border p-1 rounded w-full"
                    required
                  />
                </div>

                {/* Weight per Unit Field */}
                <div>
                  <label className="block font-semibold mb-1">Weight per Unit (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight_per_unit"
                    value={newSapData.weight_per_unit}
                    onChange={handleNewSapChange}
                    className="border p-1 rounded w-full"
                    required
                    placeholder="e.g., 52.0"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={newSapData.remarks}
                    onChange={handleNewSapChange}
                    rows={2}
                    className="border p-1 rounded w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Color</label>
                  <select
                    name="color"
                    value={showCustomColorInput ? "custom" : newSapData.color}
                    onChange={handleNewSapChange}
                    className="border p-1 rounded w-full mb-1"
                  >
                    <option value="">--Select a color--</option>
                    <option value="BLACK">Black</option>
                    <option value="BLUE">Blue</option>
                    <option value="GREEN">Green</option>
                    <option value="RED">Red</option>
                    <option value="WHITE">White</option>
                    <option value="YELLOW">Yellow</option>
                    <option value="ORANGE">Orange</option>
                    <option value="PURPLE">Purple</option>
                    <option value="PINK">Pink</option>
                    <option value="BROWN">Brown</option>
                    <option value="GRAY">Gray</option>
                    <option value="CYAN">Cyan</option>
                    <option value="MAGENTA">Magenta</option>
                    <option value="TEAL">Teal</option>
                    <option value="NAVY">Navy</option>
                    <option value="MAROON">Maroon</option>
                    <option value="OLIVE">Olive</option>
                    <option value="LIME">Lime</option>
                    <option value="INDIGO">Indigo</option>
                    <option value="TURQUOISE">Turquoise</option>
                    <option value="SILVER">Silver</option>
                    <option value="BEIGE">Beige</option>
                    <option value="LAVENDER">Lavender</option>
                    <option value="CORAL">Coral</option>
                    <option value="CRIMSON">Crimson</option>
                    <option value="KHAKI">Khaki</option>
                    <option value="SALMON">Salmon</option>
                    <option value="MINT">Mint</option>
                    <option value="custom">Custom Color...</option>
                  </select>
                  
                  {showCustomColorInput && (
                    <div className="mt-2">
                      <label className="block font-semibold mb-1">Custom Color</label>
                      <input
                        type="text"
                        placeholder="Enter custom color (e.g., Orange, Light Blue, etc.)"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter any color name you want to add
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewSapForm(false);
                      setShowCustomColorInput(false);
                      setCustomColor("");
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded font-semibold hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newSapLoading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {newSapLoading ? (
                      <>
                        <LoaderCircle className="animate-spin" size={20} />
                        Adding...
                      </>
                    ) : (
                      "Add SAP Product"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEditSap} className="space-y-1">
                <h3 className="text-lg font-semibold mb-4 text-center">Edit SAP Product</h3>
                
                <div>
                  <label className="block font-semibold mb-1">SAP Name *</label>
                  <input
                    type="text"
                    name="sap_name"
                    value={editSapData.sap_name}
                    onChange={handleEditSapChange}
                    className="border p-1 rounded w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Part Description *</label>
                  <input
                    type="text"
                    name="part_description"
                    value={editSapData.part_description}
                    onChange={handleEditSapChange}
                    className="border p-1 rounded w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Unit *</label>
                  <input
                    type="text"
                    name="unit"
                    value={editSapData.unit}
                    onChange={handleEditSapChange}
                    className="border p-1 rounded w-full"
                    required
                  />
                </div>

                {/* Weight per Unit Field */}
                <div>
                  <label className="block font-semibold mb-1">Weight per Unit (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight_per_unit"
                    value={editSapData.weight_per_unit}
                    onChange={handleEditSapChange}
                    className="border p-1 rounded w-full"
                    required
                    placeholder="e.g., 52.0"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={editSapData.remarks}
                    onChange={handleEditSapChange}
                    rows={2}
                    className="border p-1 rounded w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Color</label>
                  <select
                    name="color"
                    value={showEditCustomColorInput ? "custom" : editSapData.color}
                    onChange={handleEditSapChange}
                    className="border p-1 rounded w-full mb-1"
                  >
                    <option value="">--Select a color--</option>
                    <option value="BLACK">Black</option>
                    <option value="BLUE">Blue</option>
                    <option value="GREEN">Green</option>
                    <option value="RED">Red</option>
                    <option value="WHITE">White</option>
                    <option value="YELLOW">Yellow</option>
                    <option value="ORANGE">Orange</option>
                    <option value="PURPLE">Purple</option>
                    <option value="PINK">Pink</option>
                    <option value="BROWN">Brown</option>
                    <option value="GRAY">Gray</option>
                    <option value="CYAN">Cyan</option>
                    <option value="MAGENTA">Magenta</option>
                    <option value="TEAL">Teal</option>
                    <option value="NAVY">Navy</option>
                    <option value="MAROON">Maroon</option>
                    <option value="OLIVE">Olive</option>
                    <option value="LIME">Lime</option>
                    <option value="INDIGO">Indigo</option>
                    <option value="TURQUOISE">Turquoise</option>
                    <option value="SILVER">Silver</option>
                    <option value="BEIGE">Beige</option>
                    <option value="LAVENDER">Lavender</option>
                    <option value="CORAL">Coral</option>
                    <option value="CRIMSON">Crimson</option>
                    <option value="KHAKI">Khaki</option>
                    <option value="SALMON">Salmon</option>
                    <option value="MINT">Mint</option>
                    <option value="custom">Custom Color...</option>
                  </select>
                  
                  {showEditCustomColorInput && (
                    <div className="mt-2">
                      <label className="block font-semibold mb-1">Custom Color</label>
                      <input
                        type="text"
                        placeholder="Enter custom color (e.g., Orange, Light Blue, etc.)"
                        value={editCustomColor}
                        onChange={(e) => setEditCustomColor(e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter any color name you want to use
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditSapForm(false);
                      setShowEditCustomColorInput(false);
                      setEditCustomColor("");
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded font-semibold hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSapLoading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {editSapLoading ? (
                      <>
                        <LoaderCircle className="animate-spin" size={20} />
                        Updating...
                      </>
                    ) : (
                      "Update SAP Product"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Table with loading state */}
      <div className="overflow-x-auto mt-6">
        {loadingEntries ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoaderCircle className="animate-spin mx-auto mb-4" size={48} />
              <p className="text-gray-600">Loading product entries...</p>
            </div>
          </div>
        ) : (
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="px-4 py-2 border">Client's Name</th>
                <th className="px-4 py-2 border">SAP Name</th>
                <th className="px-4 py-2 border">Part Description</th>
                <th className="px-4 py-2 border">Unit</th>
                <th className="px-4 py-2 border">Remarks</th>
                <th className="px-4 py-2 border">Color</th>
                <th className="px-4 py-2 border">Quantity</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length ? (
                entries.map((entry) => (
                  <tr key={entry.product_id} className="text-center">
                    <td className="px-4 py-2 border">{entry.client_name || "AeroMarine"}</td>
                    <td className="px-4 py-2 border">{entry.sap_name}</td>
                    <td className="px-4 py-2 border">{entry.part_description}</td>
                    <td className="px-4 py-2 border">{entry.unit}</td>
                    <td className="px-4 py-2 border">{entry.remarks}</td>

                    {/* Color column - updated to show "-" for empty values and proper white color */}
                    <td className="px-4 py-2 border">
                      {entry.color && entry.color !== "NA" ? (
                        <div className="flex justify-center gap-1">
                          {entry.color.split("/").map((c, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full border border-gray-300"
                              style={{ 
                                backgroundColor: colorMap[c.trim().toLowerCase()] || "#ccc",
                                borderColor: c.trim().toLowerCase() === 'white' ? '#ccc' : 'border-gray-300'
                              }}
                            ></div>
                          ))}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    <td className="px-4 py-2 border">{entry.quantity}</td>
                    <td className="px-4 py-2 border whitespace-nowrap">
                      {entry.created_at ? entry.created_at.split("T")[0] : "-"}
                    </td>

                    {/* Actions column */}
                    <td className="px-4 py-2 border">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.product_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-4 border">
                    No product entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EntryProduct;