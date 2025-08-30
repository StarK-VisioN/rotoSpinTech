// EntryProduct.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Edit2, X } from "lucide-react";

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;

const colorMap = {
  yellow: "#FFD700",
  black: "#000000",
  red: "#FF0000",
  green: "#008000",
};

const productNames = ["750", "1250", "1500", "1750", "2250", "3000", "2600", "2000"];

const EntryProduct = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [clientName, setClientName] = useState("AeroMarine");
  const [isEditable, setIsEditable] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    productName: "",
    productColor: "",
    quantity: "",
    date: "",
  });

  const [entries, setEntries] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchEntries = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(`${BASE_URL}/api/entry-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data);
    } catch (err) {
      console.error("Fetch Entries Error:", err.message);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/entry-products/${editingId}`, { clientName, ...formData }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product entry updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/api/entry-products`, { clientName, ...formData }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product entry added successfully!");
      }
      setFormData({ productName: "", productColor: "", quantity: "", date: "" });
      setEditingId(null);
      setFormVisible(false);
      fetchEntries();
    } catch (err) {
      console.error("Submit Error:", err.message);
      toast.error("Error submitting entry!");
    }
  };

  const handleEdit = (entry) => {
    setFormVisible(true);
    setEditingId(entry.id);
    setClientName(entry.client_name);
    setFormData({
      productName: entry.product_name,
      productColor: entry.product_color,
      quantity: entry.quantity,
      date: entry.date.split("T")[0],
    });
    toast.info("Editing mode enabled");
  };

  const handleDelete = (id) => {
    const confirmToast = ({ closeToast }) => (
      <div>
        <p>Are you sure you want to delete this entry?</p>
        <div className="flex justify-end mt-2 gap-2">
          <button
            className="bg-red-600 text-white px-2 py-1 rounded"
            onClick={async () => {
              try {
                const token = JSON.parse(localStorage.getItem("user"))?.token;
                await axios.delete(`${BASE_URL}/api/entry-products/${id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                fetchEntries();
                toast.dismiss();
                toast.success("Entry deleted successfully!");
              } catch (err) {
                console.error(err);
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

  return (
    <div className="mt-10">
      <ToastContainer />

      {/* Top-right New Entry Product Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setFormVisible(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          New Entry Product
        </button>
      </div>

      {/* Form Modal */}
      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg relative shadow-lg">
            {/* Close Icon */}
            <X
              size={28}
              className="absolute top-3 right-3 text-red-600 cursor-pointer hover:text-red-800"
              onClick={() => {
                setFormVisible(false);
                setEditingId(null);
                setFormData({ productName: "", productColor: "", quantity: "", date: "" });
              }}
            />

            <h2 className="text-2xl font-bold mb-6 text-center">{editingId ? "Edit Entry Product" : "New Entry Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Client Name */}
              <div>
                <label className="block font-semibold mb-1">Client Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={!isEditable}
                    className="border p-2 rounded w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditable(!isEditable)}
                    className="px-3 py-2 bg-blue-500 text-white rounded"
                  >
                    {isEditable ? "Lock" : "Edit"}
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block font-semibold mb-1">Product Name</label>
                <select
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Product Name</option>
                  {productNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Product Color */}
              <div>
                <label className="block font-semibold mb-1">Product Color</label>
                <select
                  name="productColor"
                  value={formData.productColor}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Color</option>
                  {Object.keys(colorMap).map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-semibold mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
              >
                {editingId ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Client Name</th>
              <th className="px-4 py-2 border">Product Name</th>
              <th className="px-4 py-2 border">Product Color</th>
              <th className="px-4 py-2 border">Quantity</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="text-center">
                <td className="px-4 py-2 border">{entry.client_name}</td>
                <td className="px-4 py-2 border">{entry.product_name}</td>
                <td className="px-4 py-2 border">
                  <div
                    className="w-6 h-6 mx-auto rounded-full"
                    style={{ backgroundColor: colorMap[entry.product_color] || "#000" }}
                  />
                </td>
                <td className="px-4 py-2 border">{entry.quantity}</td>
                <td className="px-4 py-2 border">{entry.date.split("T")[0]}</td>
                <td className="px-4 py-2 border flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntryProduct;
