import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAdminUsers,
  getAllRoles,
  getUserRoles,
  createUserRole,
  updateUserRole,
  deleteUserRole,
} from "../api";
import Header from "../component/Header";

const UserAssign = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [newAssign, setNewAssign] = useState({ user_id: "", role_id: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const userRes = await getAdminUsers();
      const roleRes = await getAllRoles();
      const assignRes = await getUserRoles();

      const userMap = {};
      const roleMap = {};

      userRes.data?.data?.forEach((u) => {
        userMap[u.id] = u.name;
      });

      roleRes.data?.data?.forEach((r) => {
        roleMap[r.role_id] = r.role_name;
      });

      const finalAssignments = assignRes.data?.data?.map((a) => ({
        ...a,
        user_name: userMap[a.user_id] || "Unknown User",
        role_name: roleMap[a.role_id] || "Unknown Role",
      }));

      setUsers(userRes.data?.data || []);
      setRoles(roleRes.data?.data || []);
      setAssignments(finalAssignments || []);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAssign((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async () => {
    if (!newAssign.user_id || !newAssign.role_id) {
      toast.error("Please select both user and role");
      return;
    }

    try {
      if (editingId) {
        await updateUserRole(editingId, newAssign);
        toast.success("Role updated");
      } else {
        await createUserRole(newAssign);
        toast.success("Role assigned");
      }
      setNewAssign({ user_id: "", role_id: "" });
      setEditingId(null);
      fetchAll();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (assign) => {
    setNewAssign({ user_id: assign.user_id, role_id: assign.role_id });
    setEditingId(assign.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this assignment?")) return;

    try {
      await deleteUserRole(id);
      toast.success("Assignment deleted");
      fetchAll();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <Header />
      <div className="p-6 grid md:grid-cols-3 gap-6">
        {/* Assignment List Table */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">User Role Assignments</h2>
          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">User</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{item.user_name}</td>
                  <td className="border p-2">{item.role_name}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No role assignments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Role Assign Form */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? "Update Role" : "Assign Role"}
          </h2>
          <div className="bg-white p-4 shadow rounded space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select User</label>
              <select
                name="user_id"
                value={newAssign.user_id}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Select User --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select Role</label>
              <select
                name="role_id"
                value={newAssign.role_id}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Select Role --</option>
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddOrUpdate}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {editingId ? "Update" : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserAssign;
