import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Edit2, X } from "lucide-react";
import Title from "../components/Title";

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;

// Map color names to actual color codes
const colorMap = {
  red: "#FF0000",
  green: "#008000",
  black: "#000000",
  yellow: "#FFD700",
};

const colorOptions = ["Red", "Green", "Black", "Yellow"];

const EntryRawStock = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    no_of_bags: "",
    color: "",
    date: "",
    invoice_number: "",
    rate_per_bag: "",
  });

  const [entries, setEntries] = useState([]);

  // Calculate total price dynamically
  const totalPrice =
    formData.no_of_bags && formData.rate_per_bag
      ? formData.no_of_bags * formData.rate_per_bag
      : 0;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchEntries = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(`${BASE_URL}/api/raw-stock`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(res.data);
    } catch (err) {
      console.error("Fetch Raw Stock Error:", err.message);
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
        await axios.put(
          `${BASE_URL}/api/raw-stock/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Raw stock updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/api/raw-stock`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Raw stock added successfully!");
      }

      setFormData({
        no_of_bags: "",
        color: "",
        date: "",
        invoice_number: "",
        rate_per_bag: "",
      });
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
    setEditingId(entry.order_id);
    setFormData({
      no_of_bags: entry.no_of_bags,
      color: entry.color,
      date: entry.date.split("T")[0],
      invoice_number: entry.invoice_number,
      rate_per_bag: entry.rate_per_bag,
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
                await axios.delete(`${BASE_URL}/api/raw-stock/${id}`, {
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
    <div>
      {/* Page Title */}
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ENTRY"} text2={"RAW STOCK"} />
      </div>
      <ToastContainer />

      {/* New Entry Button */}
      <div className="flex justify-end my-4">
        <button
          onClick={() => setFormVisible(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          New Raw Stock
        </button>
      </div>

      {/* Form Modal */}
      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg relative shadow-lg">
            <X
              size={28}
              className="absolute top-3 right-3 text-red-600 cursor-pointer hover:text-red-800"
              onClick={() => {
                setFormVisible(false);
                setEditingId(null);
                setFormData({
                  no_of_bags: "",
                  color: "",
                  date: "",
                  invoice_number: "",
                  rate_per_bag: "",
                });
              }}
            />
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editingId ? "Edit Raw Stock" : "New Raw Stock"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">No. of Bags</label>
                <input
                  type="number"
                  name="no_of_bags"
                  value={formData.no_of_bags}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Color</label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Color</option>
                  {colorOptions.map((color) => (
                    <option key={color} value={color.toLowerCase()}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="block font-semibold mb-1">Rate per Bag (₹)</label>
                <input
                  type="number"
                  name="rate_per_bag"
                  value={formData.rate_per_bag}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Total Price (₹)</label>
                <input
                  type="number"
                  value={totalPrice}
                  className="border p-2 rounded w-full bg-gray-100"
                  disabled
                />
              </div>

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
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Color</th>
              <th className="px-4 py-2 border">No. of Bags</th>
              <th className="px-4 py-2 border">Total Kgs</th>
              <th className="px-4 py-2 border">Invoice Number</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Rate per Bag</th>
              <th className="px-4 py-2 border">Total Price</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.order_id} className="text-center">
                <td className="px-4 py-2 border">
                  <div
                    className="w-6 h-6 mx-auto rounded-full border"
                    style={{ backgroundColor: colorMap[entry.color.toLowerCase()] || "#000" }}
                  />
                </td>
                <td className="px-4 py-2 border">{entry.no_of_bags}</td>
                <td className="px-4 py-2 border">{entry.total_kgs}</td>
                <td className="px-4 py-2 border">{entry.invoice_number}</td>
                <td className="px-4 py-2 border">{entry.date.split("T")[0]}</td>
                <td className="px-4 py-2 border">{entry.rate_per_bag}</td>
                <td className="px-4 py-2 border">{entry.total_price}</td>
                <td className="px-4 py-2 border flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.order_id)}
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

export default EntryRawStock;
