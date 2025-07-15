// 📁 src/pages/User.jsx
import React, { useEffect, useState, useContext } from "react";
import Layout from "../component/Layout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAllRoles,
  updateUserStatus,
  assignMultipleRoles,
} from "../api";
import AddUserForm from "../component/AddUser";
import AssignRoleModal from '../component/AssignRoleModal';
import ActionDropdown from '../component/ActionDropdown';
import StatusToggle from '../component/StatusToggle';
import { Search, Users, UserCheck, UserX, PlusCircle } from 'lucide-react';
import { DashboardContext } from "../context/DashboardContext";

const User = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", password: "", role_ids: [], status: "active" });
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const { fetchRecentUsers } = useContext(DashboardContext);

  const filteredUsers = users
    .filter(user => {
      if (statusFilter === 'all') return true;
      return user.status.toLowerCase() === statusFilter;
    })
    .filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsers();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      // Sort users by id ascending (oldest first, newest last)
      setUsers(data.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error("Frontend: Error fetching users:", error);
      toast.error("Failed to load users ❌");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getAllRoles();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRoles(data);
    } catch {
      toast.error("Failed to load roles ❌");
    }
  };

  const handleAddUser = async () => {
    const { name, email, phone, password, role_ids, status } = newUser;
    if (name && email && phone && password && role_ids && role_ids.length > 0) {
      try {
        await createAdminUser(newUser);
        await fetchUsers();
        fetchRecentUsers && fetchRecentUsers();
        toast.success("User added successfully ✅");
        setNewUser({ name: "", email: "", phone: "", password: "", role_ids: [], status: "active" });
        setShowModal(false);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to add user:", err);
        toast.error("Failed to add user ❌");
      }
    } else {
      toast.error("Please fill all fields and select at least one role ❗");
    }
  };

  const handleUpdateUser = async () => {
    try {
      await updateAdminUser(editingUser.id, newUser);
      await fetchUsers();
      fetchRecentUsers && fetchRecentUsers();
      toast.success("User updated successfully ✅");
      setEditingUser(null);
      setNewUser({ name: "", email: "", phone: "", password: "", role_ids: [], status: "active" });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to update user:", err);
      toast.error("Failed to update user ❌");
    }
  };

  const handleFormInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    
    if (type === 'checkbox' && name === 'role_ids') {
      const roleId = parseInt(value, 10);
     
      // Only proceed if roleId is a valid number
      if (!isNaN(roleId)) {
        setNewUser(prevUser => {
          const currentRoleIds = prevUser.role_ids || [];
        
          if (checked) {
            if (!currentRoleIds.includes(roleId)) {
              const newRoleIds = [...currentRoleIds, roleId];
             
              return { ...prevUser, role_ids: newRoleIds };
            }
          } else {
            const newRoleIds = currentRoleIds.filter(id => id !== roleId);
            console.log("Removing role ID:", roleId, "New array:", newRoleIds);
            return { ...prevUser, role_ids: newRoleIds };
          }
          return prevUser;
        });
      } else {
        console.log("Invalid roleId:", value);
      }
    } else {
      setNewUser(prevUser => ({
        ...prevUser,
        [name]: value
      }));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    const currentUserRoleIds = user.roles ? user.roles.map(role => role.role_id).filter(id => id !== null && id !== undefined && !isNaN(id)) : [];
    setNewUser({ 
      name: user.name, 
      email: user.email, 
      phone: user.phone, 
      password: "", 
      role_ids: currentUserRoleIds, 
      status: user.status?.toLowerCase() || 'active' 
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteAdminUser(id);
      await fetchUsers();
      fetchRecentUsers && fetchRecentUsers();
      toast.success("User deleted successfully ✅");
    } catch {
      toast.error("Failed to delete user ❌");
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUserForRole(user);
    // Initialize with current user roles
    const currentRoleIds = user.roles ? user.roles.map(role => role.role_id) : [];
    setSelectedRoles(currentRoleIds);
    setShowRoleModal(true);
  };

  const handleSaveRoles = async (roleIds) => {
    console.log("=== Frontend: handleSaveRoles called ===");
    console.log("Selected user:", selectedUserForRole);
    console.log("Role IDs to assign:", roleIds);
    
    if (!selectedUserForRole) {
      toast.error("Please select a user.");
      return;
    }
    setRoleUpdateLoading(true);
    try {
      // Call the new multiple role assignment API
      console.log("Calling assignMultipleRoles API...");
      const response = await assignMultipleRoles({
        user_id: selectedUserForRole.id,
        role_ids: roleIds
      });
      console.log("API response:", response);

      console.log("Fetching updated users...");
      await fetchUsers();
      toast.success("User roles updated successfully ✅");
      setShowRoleModal(false);
      setSelectedUserForRole(null);
      setSelectedRoles([]);
    } catch (err) {
      console.error('Role update error:', err);
      toast.error("Failed to update user roles ❌");
    } finally {
      setRoleUpdateLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleUpdateStatus = async (userId, currentStatus) => {
    
    const newStatusString = currentStatus ? 'inactive' : 'active';
    setLoadingUserId(userId);

    const originalUsers = [...users];

    // Optimistic UI update
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, status: newStatusString.charAt(0).toUpperCase() + newStatusString.slice(1) } : user
      )
    );

    try {
      await updateUserStatus(userId, newStatusString);
      toast.success(`User status updated to ${newStatusString}.`);
    } catch (err) {
      toast.error("Failed to update status. Reverting changes.");
      setUsers(originalUsers); // Revert on failure
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <Layout>
      <div className="px-2 md:px-4 py-4 relative">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          User Manager
        </h2>
        
        {/* Top Bar: Add User, Filters, Search */}
        <div className="p-4 bg-white shadow-md rounded-lg mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => {
              setEditingUser(null);
              setNewUser({ name: "", email: "", phone: "", password: "", role_ids: [], status: "active" });
              setShowModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start"
          >
            <PlusCircle size={18} /> Add User
          </button>

          {/* Status Filter Buttons */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all flex-shrink-0 ${statusFilter === 'all' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Users size={16} /> All
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all flex-shrink-0 ${statusFilter === 'active' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <UserCheck size={16} /> Active
            </button>
            <button
              onClick={() => handleFilterChange('inactive')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all flex-shrink-0 ${statusFilter === 'inactive' ? 'bg-red-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <UserX size={16} /> Inactive
            </button>
          </div>
          
          <div className="flex-grow flex items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="text-gray-600 font-semibold text-right whitespace-nowrap">
              Total: {filteredUsers.length}
            </div>
          </div>
        </div>

        <div className={`transition-all duration-300 ${showModal ? "md:mr-96" : ""}`}>
          {/* Desktop Table View */}
          <div className="bg-white shadow-md rounded-lg overflow-x-auto w-full hidden md:block relative">
            <table className="w-full border">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 border">S/N</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Phone</th>
                  <th className="px-4 py-2 border">Roles</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => {
                  const isActive = user.status?.toLowerCase() === 'active';
                  return (
                    <tr 
                      key={user.id} 
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 border text-center">{(currentPage - 1) * usersPerPage + index + 1}</td>
                      <td className="px-4 py-2 border text-center">{user.name}</td>
                      <td className="px-4 py-2 border text-center">{user.email}</td>
                      <td className="px-4 py-2 border text-center">{user.phone}</td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          className="w-full h-full text-left p-2 rounded-md hover:bg-purple-200 active:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                          title="Click to assign roles"
                        >
                          <div className="text-sm">
                            {user.roles && user.roles.length > 0 ? (
                              <span className="text-blue-600 font-medium">
                                {user.roles.map((role, idx) => (
                                  <span key={role.role_id}>
                                    {role.role_name}
                                    {idx < user.roles.length - 1 && ', '}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="text-gray-500">No roles</span>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <StatusToggle
                          isActive={isActive}
                          loading={loadingUserId === user.id}
                          onToggle={() => handleUpdateStatus(user.id, isActive)}
                        />
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <div className="relative z-10">
                          <ActionDropdown
                            user={user}
                            onEdit={handleEditUser}
                            onAssignRole={handleOpenRoleModal}
                            onDelete={handleDeleteUser}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {currentUsers.map((user, index) => {
              const isActive = user.status?.toLowerCase() === 'active';
              return (
                <div 
                  key={user.id} 
                  className="bg-white shadow-md rounded-lg p-4 space-y-3 relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="relative z-10">
                      <ActionDropdown
                        user={user}
                        onEdit={handleEditUser}
                        onAssignRole={handleOpenRoleModal}
                        onDelete={handleDeleteUser}
                      />
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong className="text-gray-600">Phone:</strong> {user.phone}</p>
                    <p><strong className="text-gray-600">Roles:</strong>
                      <button
                        onClick={() => handleOpenRoleModal(user)}
                        className="ml-1 text-left rounded-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors duration-200"
                        title="Click to assign roles"
                      >
                        <span className="text-blue-600 font-medium">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role, idx) => (
                              <span key={role.role_id}>
                                {role.role_name}
                                {idx < user.roles.length - 1 && ', '}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No roles</span>
                          )}
                        </span>
                      </button>
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <StatusToggle
                      isActive={isActive}
                      loading={loadingUserId === user.id}
                      onToggle={() => handleUpdateStatus(user.id, isActive)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-center items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm"
            >◀ Prev</button>
            <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm"
            >Next ▶</button>
          </div>
        </div>

        <AddUserForm
          showModal={showModal}
          editingUser={editingUser}
          newUser={newUser}
          handleInputChange={handleFormInputChange}
          handleAddUser={handleAddUser}
          handleUpdateUser={handleUpdateUser}
          setShowModal={setShowModal}
          roles={roles}
        />

        <AssignRoleModal
          show={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          user={selectedUserForRole}
          roles={roles}
          selectedRoles={selectedRoles}
          setSelectedRoles={setSelectedRoles}
          onSave={handleSaveRoles}
          loading={roleUpdateLoading}
        />
      </div>
    </Layout>
  );
};

export default User;
