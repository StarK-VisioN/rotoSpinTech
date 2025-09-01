import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Edit2, X } from "lucide-react";
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
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    material_grade: "",
    colors: [], // array of { color_id, color_name }
    kgPerColor: {}, // { [color_id]: string (empty or numeric string) }
    ratePerKg: {}, // { [color_id]: string }
    invoice_number: "",
    invoice_date: "",
  });

  const [entries, setEntries] = useState([]);
  const [materialOptions] = useState(["Octen-123", "Flexitub-789", "Other-001"]);
  const [colorOptions, setColorOptions] = useState([]);

  // Format numbers with Indian commas. Returns empty string for blank inputs.
  const formatNumber = (num) => {
    if (num === "" || num === null || num === undefined || Number.isNaN(Number(num))) return "";
    return new Intl.NumberFormat("en-IN").format(Number(num));
  };

  // Fetch available colors from backend
  const fetchColors = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${BASE_URL}/api/colors`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setColorOptions(res.data || []);
    } catch (err) {
      console.error("Fetch Colors Error:", err.message);
    }
  };

  // Fetch existing entries
  const fetchEntries = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${BASE_URL}/api/raw-stock`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setEntries(res.data || []);
    } catch (err) {
      console.error("Fetch Entries Error:", err.message);
    }
  };

  useEffect(() => {
    fetchColors();
    fetchEntries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add a selected color to the form (preserves insertion order)
  const handleAddColor = (e) => {
    const colorId = e.target.value;
    if (!colorId) return;
    const colorObj = colorOptions.find((c) => String(c.color_id) === String(colorId));
    if (!colorObj) return;
    if (formData.colors.some((c) => String(c.color_id) === String(colorObj.color_id))) return;

    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { color_id: colorObj.color_id, color_name: colorObj.color_name }],
      // initialize as empty strings so the inputs are empty (no default 0)
      kgPerColor: { ...prev.kgPerColor, [colorObj.color_id]: "" },
      ratePerKg: { ...prev.ratePerKg, [colorObj.color_id]: "" },
    }));
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

    // basic validation
    if (!formData.material_grade) return toast.error("Select material grade");
    if (!formData.invoice_number) return toast.error("Enter invoice number");
    if (!formData.invoice_date) return toast.error("Select invoice date");
    if (!formData.colors || formData.colors.length === 0)
      return toast.error("Select at least one color");

    // prepare payload
    const payload = {
      material_grade: formData.material_grade,
      colors: formData.colors.map((c) => ({
        color_id: c.color_id,
        kgs: parseFloat(formData.kgPerColor[c.color_id]) || 0,
        rate_per_kg: parseFloat(formData.ratePerKg[c.color_id]) || 0,
      })),
      invoice_number: formData.invoice_number,
      invoice_date: formData.invoice_date,
    };

    try {
      const token = getToken();
      if (editingId) {
        await axios.put(`${BASE_URL}/api/raw-stock/${editingId}`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        toast.success("Raw stock updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/api/raw-stock`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        toast.success("Raw stock added successfully!");
      }

      // reset
      setFormData({
        material_grade: "",
        colors: [],
        kgPerColor: {},
        ratePerKg: {},
        invoice_number: "",
        invoice_date: "",
      });
      setEditingId(null);
      setFormVisible(false);
      fetchEntries();
    } catch (err) {
      console.error("Submit Error:", err.response?.data || err.message);
      toast.error("Error submitting entry!");
    }
  };

  // Load data into form for editing group (pre-fill color lines in order returned by backend)
  const handleEdit = (entry) => {
    setFormVisible(true);
    setEditingId(entry.order_id);
    toast.info("Editing mode enabled");

    // Map details to color objects (prefer color_id if present)
    const colors = (entry.details || []).map((d) => {
      // if backend returns color_id use it; else try to find by name
      const cid = d.color_id ?? colorOptions.find((c) => c.color_name === d.color)?.color_id;
      return { color_id: cid, color_name: d.color };
    });

    const kgPerColor = {};
    const ratePerKg = {};
    (entry.details || []).forEach((d) => {
      const cid = d.color_id ?? colorOptions.find((c) => c.color_name === d.color)?.color_id;
      if (cid != null) {
        // keep as string so input shows exactly value or empty string
        kgPerColor[cid] = d.kgs != null ? String(d.kgs) : "";
        ratePerKg[cid] = d.rate_per_kg != null ? String(d.rate_per_kg) : "";
      }
    });

    setFormData({
      material_grade: entry.material_grade || "",
      colors: colors.filter((c) => c.color_id != null), // drop unresolved
      kgPerColor,
      ratePerKg,
      invoice_number: entry.invoice_number || "",
      invoice_date: entry.invoice_date ? entry.invoice_date.split("T")[0] : "",
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
                const token = getToken();
                await axios.delete(`${BASE_URL}/api/raw-stock/${order_id}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                fetchEntries();
                toast.dismiss();
                toast.success("Raw stock deleted successfully!");
              } catch (err) {
                console.error("Delete Error:", err.response?.data || err.message);
                toast.error("Error deleting entry!");
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

  // Delete a single color row (detail)
  const handleDeleteColor = (order_id, detail_id) => {
    const confirmToast = ({ closeToast }) => (
      <div>
        <p>Are you sure you want to delete this color?</p>
        <div className="flex justify-end mt-2 gap-2">
          <button
            className="bg-red-600 text-white px-2 py-1 rounded"
            onClick={async () => {
              try {
                const token = getToken();
                await axios.delete(`${BASE_URL}/api/raw-stock/${order_id}/color/${detail_id}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                fetchEntries();
                toast.dismiss();
                toast.success("Color deleted successfully!");
              } catch (err) {
                console.error("Delete Color Error:", err.response?.data || err.message);
                if (err.response?.status === 404) toast.error("Color not found or already deleted");
                else toast.error("Error deleting color!");
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
      <ToastContainer />

      <div className="flex justify-end my-4">
        <button
          onClick={() => {
            setFormVisible(true);
            setEditingId(null);
            // reset form for new entry
            setFormData({
              material_grade: "",
              colors: [],
              kgPerColor: {},
              ratePerKg: {},
              invoice_number: "",
              invoice_date: "",
            });
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          New Raw Stock
        </button>
      </div>

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
                {/* Material Grade */}
                <div>
                  <label className="block font-semibold mb-1">Material Grade</label>
                  <select
                    name="material_grade"
                    value={formData.material_grade}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    required
                  >
                    <option value="">Select Material</option>
                    {materialOptions.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select / Add Color */}
                <div>
                  <label className="block font-semibold mb-1">Select Color</label>
                  <select onChange={handleAddColor} className="border p-2 rounded w-full" value="">
                    <option value="">--Select a color--</option>
                    {colorOptions.map((c) => (
                      <option
                        key={c.color_id}
                        value={c.color_id}
                        disabled={formData.colors.some((fc) => String(fc.color_id) === String(c.color_id))}
                      >
                        {c.color_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic color rows (KG + Rate) */}
                {formData.colors.map((c) => (
                  <div key={c.color_id} className="grid grid-cols-3 gap-2 items-end">
                    <div>
                      <label className="block font-semibold">{c.color_name} (KG)</label>
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
                      <label className="block font-semibold">{c.color_name} Rate per KG</label>
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

                    <div>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c.color_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
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

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Grouped table: common fields row-spanned; each color gets separate row */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="px-4 py-2 border">Material</th>
              <th className="px-4 py-2 border">Invoice Number</th>
              <th className="px-4 py-2 border">Invoice Date</th>
              <th className="px-4 py-2 border">Color</th>
              <th className="px-4 py-2 border">KG</th>
              <th className="px-4 py-2 border">Rate / KG</th>
              <th className="px-4 py-2 border">Total KG</th>
              <th className="px-4 py-2 border">Total Amount</th>
              <th className="px-4 py-2 border">Edit</th>
              <th className="px-4 py-2 border">Delete Color</th>
              <th className="px-4 py-2 border">Delete Group</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-4">
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
                            {entry.material_grade}
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
                            onClick={() => handleDeleteColor(entry.order_id, d.detail_id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete this color"
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
                    <td className="px-4 py-2 border">{entry.material_grade}</td>
                    <td className="px-4 py-2 border">{entry.invoice_number}</td>
                    <td className="px-4 py-2 border">{entry.invoice_date?.split("T")[0] || ""}</td>
                    <td className="px-4 py-2 border" colSpan={3}>
                      No colors
                    </td>
                    <td className="px-4 py-2 border">{formatNumber(entry.total_kgs)}</td>
                    <td className="px-4 py-2 border">₹ {formatNumber(entry.total_amount)}</td>
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
      </div>
    </div>
  );
};

export default EntryRawStock;