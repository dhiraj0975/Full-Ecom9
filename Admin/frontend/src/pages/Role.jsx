import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../component/Header";

import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
} from "../api"; // <-- Role APIs
import { Search } from 'lucide-react';

const Role = () => {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ role_name: "" });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roles.filter(role =>
    role.role_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 8;

  // Pagination logic based on filtered roles
  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await getAllRoles();
      // ✅ Fix: Use res.data.data, not res.data
      setRoles(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ role_name: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.role_name.trim()) return;

    try {
      if (editId !== null) {
        await updateRole(editId, form);
        toast.success("Role updated successfully ✅");
      } else {
        await createRole(form);
        toast.success("Role added successfully ✅");
      }
      fetchRoles();
      setForm({ role_name: "" });
      setEditId(null);
    } catch (error) {
      console.error("Failed to save role:", error);
      toast.error("Failed to save role ❌");
    }
  };

  const handleEdit = (role) => {
    setForm({ role_name: role.role_name });
    setEditId(role.role_id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      await deleteRole(id);
      fetchRoles();
      toast.success("Role deleted successfully ✅");
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error("Delete failed ❌");
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusChange = async (roleId, newStatus) => {
    try {     
      await updateRoleStatus(roleId, newStatus);
      fetchRoles();
      toast.success("✅ Role status updated!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      <Header />
      <div className="w-full p-6 flex flex-col md:flex-row gap-6">
        {/* Table Section */}
        <div className="w-full md:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Role List</h2>
            <div className="text-gray-600 font-semibold">
              Total Roles: {filteredRoles.length}
            </div>
          </div>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by role name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full md:w-2/3 p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-left border">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-2 text-center border">S/N</th>
                  <th className="p-2 text-center border">Role Name</th>
                  <th className="p-2 text-center border">Actions</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentRoles.map((role, index) => (
                  <tr key={role.role_id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-center border">
                      {(currentPage - 1) * rolesPerPage + index + 1}
                    </td>
                    <td className="p-2 text-center border">{role.role_name}</td>
                    <td className="p-2   flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEdit(role)}
                        className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(role.role_id)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleStatusChange(role.role_id, role.status === "Active" ? "Inactive" : "Active")}
                        className={`px-4 py-1 rounded-full font-semibold transition-colors duration-200 ${
                          role.status === "Active"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {role.status === "Active" ? "ON" : "OFF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-center items-center space-x-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                ◀ Prev
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/3 md:pl-6 mt-6 md:mt-0">
          <h2 className="text-2xl font-bold mb-4">
            {editId ? "Edit Role" : "Add Role"}
          </h2>
          <div className="bg-white p-4 rounded shadow">
            <div className="mb-4">
              <label className="block mb-2">Role Name</label>
              <input
                type="text"
                name="role_name"
                value={form.role_name}
                onChange={handleChange}
                className="w-full p-2 text-center border rounded"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white p-2 text-center rounded hover:bg-blue-700"
            >
              {editId ? "Update Role" : "Add Role"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Role;
