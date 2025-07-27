import React from "react";
import Title from "../components/Title";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";

const RawMaterial = () => {
  const rawMaterial = [
    { order_ID: 101, bags: 20, color: "Red", date: "2025-07-20", rate: 50 },
    { order_ID: 102, bags: 15, color: "Green", date: "2025-07-19", rate: 45 },
    { order_ID: 103, bags: 30, color: "Black", date: "2025-07-18", rate: 55 },
  ];

  const handleEdit = (id) => {
    console.log("", id);
  };

  const handleDelete = (id) => {
    console.log("", id);
  };

  return (
    <div>
      <div className="text-left px-14 py-8 text-3xl">
        <Title text1={"STOCK"} text2={"DETAILS"} />
      </div>

      <div className="px-14 py-2">
        <div className="flex justify-end mt-6 mb-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Add New Stock
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg shadow pt-2">
          <table className="min-w-full  border border-gray-300">
            <thead className="bg-gray-200 text-center">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Order ID</th>
                <th className="px-4 py-2 border border-gray-300">No. of Bags</th>
                <th className="px-4 py-2 border border-gray-300">Color</th>
                <th className="px-4 py-2 border border-gray-300">Date</th>
                <th className="px-4 py-2 border border-gray-300">Rate per Bag</th>
                <th className="px-4 py-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {rawMaterial.map((itm, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">{itm.order_ID}</td>
                  <td className="px-4 py-2 border border-gray-300">{itm.bags}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: itm.color.toLowerCase() }}
                    ></div>
                  </td>
                  <td className="px-4 py-2 border border-gray-300">{itm.date}</td>
                  <td className="px-4 py-2 border border-gray-300">₹{itm.rate}</td>
                  <td className="px-4 py-2 border border-gray-300 space-x-2">
                    <button
                      onClick={() => handleEdit(itm.order_ID)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-1 py-1 rounded text-sm"
                    >
                      <FaRegEdit />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(itm.order_ID)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RawMaterial;
