// src/components/AddUserForm.jsx
import React, { useContext } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DashboardContext } from '../context/DashboardContext';
import { useNavigate } from "react-router-dom";

const AddUserForm = ({
  showModal,
  editingUser,
  newUser,
  handleInputChange,
  handleAddUser,
  handleUpdateUser,
  setShowModal,
  roles,
}) => {
  // Debug logging
  // console.log("AddUserForm - Roles received:", roles);
  // console.log("AddUserForm - Current newUser:", newUser);
  // console.log("AddUserForm - Current role_ids:", newUser.role_ids);

  const { combinedStatusPie } = useContext(DashboardContext);
  const navigate = useNavigate();

  // Get status styles based on current selection
  const getStatusStyles = () => {
    const isActive = newUser.status?.toLowerCase() === 'active';
    if (isActive) {

      return {
        container: "border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500",
        icon: "text-green-500",
        text: "text-green-700"
      };
    } else {
      return {
        container: "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500",
        icon: "text-red-500",
        text: "text-red-700"
      };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        showModal ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gray-50 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-800">
          {editingUser ? "Edit User" : "Add New User"}
        </h2>
        <button
          onClick={() => setShowModal(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={newUser.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {roles &&
                  roles.filter(Boolean).map((role) => {
                    const isChecked = newUser.role_ids?.includes(role.role_id) || false;
                    
                    return (
                      <div key={role.role_id} className="flex items-center">
                        <input
                          id={`add-user-role-${role.role_id}`}
                          name="role_ids"
                          type="checkbox"
                          value={role.role_id}
                          checked={isChecked}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`add-user-role-${role.role_id}`}
                          className="ml-3 block text-sm text-gray-800 cursor-pointer"
                        >
                          {role.role_name}
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Dynamic Status Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="relative">
              <select
                name="status"
                value={newUser.status || 'active'}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg transition-all duration-300 focus:ring-2 ${statusStyles.container}`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              {/* Status Icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {newUser.status?.toLowerCase() === 'active' ? (
                  <CheckCircle className={`h-5 w-5 ${statusStyles.icon} animate-pulse`} />
                ) : (
                  <XCircle className={`h-5 w-5 ${statusStyles.icon} animate-pulse`} />
                )}
              </div>
            </div>
            
            {/* Status Label */}
            <div className="mt-2">
              <span className={`text-xs font-medium ${statusStyles.text}`}>
                {newUser.status?.toLowerCase() === 'active' 
                  ? '✅ User will be able to access the system'
                  : '❌ User will be disabled and cannot access the system'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            if (editingUser) {
              await handleUpdateUser();
            } else {
              await handleAddUser();
            }
          }}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all duration-200 font-medium"
        >
          {editingUser ? "Update User" : "Add User"}
        </button>
      </div>
    </div>
  );
};

export default AddUserForm;
