import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Edit2, X } from "lucide-react";
import Title from "../components/Title";
import { API_PATHS } from "../../utils/apiPaths";

const colorMap = {
  yellow: "#FFD700",
  black: "#000000",
  blue: "#0000FF",
  red: "#FF0000",
  green: "#008000",
  white: "#D6D6D6",
};

const EntryProduct = () => {
  // useStates
  const [entries, setEntries] = useState([]);
  const [sapProducts, setSapProducts] = useState([]);
  const [formVisible, setFormVisible] = useState(false);

  const [formData, setFormData] = useState({
    client_name: "AeroMarine",
    sap_name: "",
    part_description: "",
    unit: "",
    color: "",
    quantity: "",
    remarks: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientNameEditable, setClientNameEditable] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchSapProducts();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ENTRY_PRODUCTS.GET);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch entry products!");
    }
  };

  const fetchSapProducts = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.SAP_PRODUCTS.GET);
      setSapProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch SAP products!");
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        client_name: formData.client_name,
        sap_name: formData.sap_name,
        product_color: formData.color,
        quantity: Number(formData.quantity),
      };

      if (editingId) {
        await axiosInstance.put(API_PATHS.ENTRY_PRODUCTS.PUT(editingId), payload);
        toast.success("Entry updated successfully!");
        setEditingId(null);
      } else {
        await axiosInstance.post(API_PATHS.ENTRY_PRODUCTS.POST, payload);
        toast.success("Entry added successfully!");
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
      toast.error("Error submitting entry!");
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
    toast.info("Editing mode enabled");
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
                toast.success("Product deleted successfully!");
              } catch (err) {
                console.error(err);
                toast.error("Error deleting product!");
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

  return (
    <div className="p-4">
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1="PRODUCT" text2="ENTRY" />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-end my-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setFormVisible(true)}
        >
          {editingId ? "Edit Product" : "Add Product"}
        </button>
      </div>

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

            <form onSubmit={handleSubmit} className="space-y-1">
              {/* Client Name with Edit button */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Client Name</label>
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

              {/* SAP Name */}
              <div>
                <label className="block font-semibold mb-1">SAP Name</label>
                <select
                  name="sap_name"
                  value={formData.sap_name}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                  required
                >
                  <option value="">Select SAP Name</option>
                  {sapProducts.map((p) => (
                    <option key={p.sap_name} value={p.sap_name}>
                      {p.sap_name}
                    </option>
                  ))}
                </select>
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
                  value={formData.color}
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
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
              >
                {editingId ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="px-4 py-2 border">Client Name</th>
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

                  {/* Color column - now with proper border */}
                  <td className="px-4 py-2 border">
                    <div className="flex justify-center gap-1">
                      {entry.sap_name ? (
                        (() => {
                          const color = sapProducts.find(p => p.sap_name === entry.sap_name)?.color || "";
                          return color ? (
                            color.split("/").map((c, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full border border-gray-300"
                                style={{ backgroundColor: colorMap[c.toLowerCase()] || "#ccc" }}
                              ></div>
                            ))
                          ) : (
                            <div
                              className="w-6 h-6 rounded-full border border-gray-100"
                              style={{ backgroundColor: "#FCFCFC" }}
                            ></div>
                          );
                        })()
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full border border-gray-100"
                          style={{ backgroundColor: "#FCFCFC" }}
                        ></div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-2 border">{entry.quantity}</td>
                  <td className="px-4 py-2 border whitespace-nowrap">
                    {entry.created_at ? entry.created_at.split("T")[0] : "-"}
                  </td>

                  {/* Actions column - now with proper border */}
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
      </div>
    </div>
  );
};

export default EntryProduct;