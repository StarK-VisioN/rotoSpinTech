import React, { useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";

const EntryProduct = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    clientName: "AeroMarine",
    productName: "",
    productSize: "",
    productColor: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0], // Default today’s date
  });

  const productNames = ["a", "b", "c", "d"];
  const productSizes = [
    "750",
    "1250",
    "1500",
    "1750",
    "2250",
    "3000",
    "2600",
    "2000",
  ];
  const productColors = ["yellow", "black", "red", "green"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editIndex !== null) {
      const updatedEntries = [...entries];
      updatedEntries[editIndex] = form;
      setEntries(updatedEntries);
      setEditIndex(null);
    } else {
      setEntries([...entries, form]);
    }

    setForm({
      clientName: "AeroMarine",
      productName: "",
      productSize: "",
      productColor: "",
      quantity: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  };

  const handleEdit = (index) => {
    setForm(entries[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
  };

  return (
    <div className="p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Entry Products</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditIndex(null);
            setForm({
              clientName: "AeroMarine",
              productName: "",
              productSize: "",
              productColor: "",
              quantity: "",
              date: new Date().toISOString().split("T")[0],
            });
          }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} className="mr-2" />
          New Entry Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4"
        >
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <select
              name="productName"
              value={form.productName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select product</option>
              {productNames.map((name, i) => (
                <option key={i} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Size */}
          <div>
            <label className="block text-sm font-medium">Product Size</label>
            <select
              name="productSize"
              value={form.productSize}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select size</option>
              {productSizes.map((size, i) => (
                <option key={i} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Product Color */}
          <div>
            <label className="block text-sm font-medium">Product Color</label>
            <select
              name="productColor"
              value={form.productColor}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select color</option>
              {productColors.map((color, i) => (
                <option key={i} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg"
            >
              {editIndex !== null ? "Update Entry" : "Submit"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Client Name</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Product Name</th>
            <th className="border p-2">Product Size</th>
            <th className="border p-2">Product Color</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2">{entry.clientName}</td>
              <td className="border p-2">{entry.date}</td>
              <td className="border p-2">{entry.productName}</td>
              <td className="border p-2">{entry.productSize}</td>
              <td className="border p-2">
                <div
                  className="w-6 h-6 mx-auto rounded-full border"
                  style={{ backgroundColor: entry.productColor }}
                ></div>
              </td>
              <td className="border p-2">{entry.quantity}</td>
              <td className="border p-2 flex justify-center gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={18} />
                </button>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                No entries yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EntryProduct;
