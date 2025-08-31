import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Edit2, X } from "lucide-react";
import Title from "../components/Title";

const AddStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    position: "PM",
    name: "",
    working_id: "",
    password: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.STAFF.GET);
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching staff data!");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axiosInstance.put(API_PATHS.STAFF.PUT(editingId), formData);
        toast.success("Staff updated successfully!");
      } else {
        await axiosInstance.post(API_PATHS.STAFF.POST, formData);
        toast.success("Staff added successfully!");
      }
      setFormData({ position: "PM", name: "", working_id: "", password: "" });
      setEditingId(null);
      setFormVisible(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error("Error submitting staff!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staff) => {
    setFormVisible(true);
    setFormData({
      position: staff.position,
      name: staff.name,
      working_id: staff.working_id,
      password: staff.original_password,
    });
    setEditingId(staff.staff_id);
    toast.info("Editing mode enabled");
  };

  const handleDelete = (id) => {
    const confirmToast = ({ closeToast }) => (
      <div>
        <p>Are you sure you want to delete this staff?</p>
        <div className="flex justify-end mt-2 gap-2">
          <button
            className="bg-red-600 text-white px-2 py-1 rounded"
            onClick={async () => {
              try {
                await axiosInstance.delete(API_PATHS.STAFF.DELETE(id));
                fetchStaff();
                toast.dismiss();
                toast.success("Staff deleted successfully!");
              } catch (err) {
                console.error(err);
                toast.error("Error deleting staff!");
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
        <Title text1={"STAFF"} text2={"MANAGEMENT"} />
      </div>

      <ToastContainer />

      {/* Add Staff Button */}
      <div className="flex justify-end my-4">
        <button
          onClick={() => setFormVisible(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {editingId ? "Edit Staff" : "New Staff"}
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
                setFormData({ position: "PM", name: "", working_id: "", password: "" });
              }}
            />
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editingId ? "Edit Staff" : "New Staff"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Position</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="PM">Production Manager</option>
                  <option value="W">Worker</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Working ID</label>
                <input
                  type="text"
                  name="working_id"
                  value={formData.working_id}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Password</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
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
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Position</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Working ID</th>
              <th className="px-4 py-2 border">Password</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length ? (
              staffList.map((staff) => (
                <tr key={staff.staff_id} className="text-center">
                  <td className="px-4 py-2 border">{staff.staff_id}</td>
                  <td className="px-4 py-2 border">{staff.position}</td>
                  <td className="px-4 py-2 border">{staff.name}</td>
                  <td className="px-4 py-2 border">{staff.working_id}</td>
                  <td className="px-4 py-2 border">{staff.original_password}</td>
                  <td className="px-4 py-2 border flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(staff)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(staff.staff_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No staff found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddStaff;