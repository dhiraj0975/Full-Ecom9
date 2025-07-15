import React, { useEffect, useState } from "react";
import Layout from "./../component/Layout";
import { createRetailer, getAllRetailers } from "../api";

const Retailer_Managment = () => {
  const [retailerMappings, setRetailerMappings] = useState([]);
  const [newRetailer, setNewRetailer] = useState({
    user_id: "",
    retailer_id: "",
  });

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      const res = await getAllRetailers();
      setRetailerMappings(res.data);
    } catch (err) {
      console.error("Error fetching retailers:", err);
      alert("Failed to load retailer mappings");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRetailer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRetailer = async () => {
    if (newRetailer.user_id && newRetailer.retailer_id) {
      try {
        await createRetailer(newRetailer);
        alert("Retailer added successfully!");
        setNewRetailer({ user_id: "", retailer_id: "" });
        fetchRetailers();
      } catch (err) {
        console.error("Error adding retailer:", err);
        alert("Failed to add retailer");
      }
    }
  };

  const handleEditRetailer = (index) => {
    const retailerToEdit = retailerMappings[index];
    setNewRetailer({
      user_id: retailerToEdit.user_id,
      retailer_id: retailerToEdit.retailer_id,
    });
  };

  const handleDeleteRetailer = (index) => {
    const updatedRetailers = retailerMappings.filter((_, i) => i !== index);
    setRetailerMappings(updatedRetailers);
  };

  return (
    <Layout>
      <div className="w-full p-6 flex">
        <div className="w-2/3">
          <h2 className="text-2xl font-bold mb-4">Retailer Assignments</h2>
          <div className="bg-white p-4 rounded shadow">
            <table className="w-full text-left border">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-2">S/N</th>
                  <th className="p-2">User ID</th>
                  <th className="p-2">Retailer ID</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {retailerMappings.map((entry, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{entry.user_id}</td>
                    <td className="p-2">{entry.retailer_id}</td>
                    <td className="p-2 flex space-x-2">
                      <button
                        onClick={() => handleEditRetailer(index)}
                        className="bg-yellow-500 text-white p-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRetailer(index)}
                        className="bg-red-500 text-white p-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-1/3 pl-6">
          <h2 className="text-2xl font-bold mb-4">Add Retailer</h2>
          <div className="bg-white p-4 rounded shadow">
            <div className="mb-4">
              <label className="block mb-2">User ID</label>
              <input
                type="text"
                name="user_id"
                value={newRetailer.user_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Retailer ID</label>
              <input
                type="text"
                name="retailer_id"
                value={newRetailer.retailer_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={handleAddRetailer}
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Add Retailer
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Retailer_Managment;
