import React, { useEffect, useState } from 'react';
import { X, UserCheck, Shield, Save, Loader2, CheckSquare, Square } from 'lucide-react';

const AssignRoleModal = ({
  show,
  onClose,
  user,
  roles,
  selectedRoles,
  setSelectedRoles,
  onSave,
  loading
}) => {
  const [localSelectedRoles, setLocalSelectedRoles] = useState([]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
      // Initialize local state with current selected roles
      setLocalSelectedRoles(selectedRoles || []);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose, selectedRoles]);

  const handleRoleToggle = (roleId) => {
    setLocalSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSave = () => {
    setSelectedRoles(localSelectedRoles);
    onSave(localSelectedRoles);
  };

  const getCurrentRoleNames = () => {
    if (!user?.roles || user.roles.length === 0) return 'No roles assigned';
    return user.roles.map(role => role.role_name).join(', ');
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with smooth animation */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal with smooth entrance animation */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assign Multiple Roles</h3>
              <p className="text-sm text-gray-500">Update user permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-500 rounded-full">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Current Roles Display */}
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Roles:</h4>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-900">{getCurrentRoleNames()}</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Select Roles:</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {roles.map((role) => (
              <label
                key={role.role_id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  {localSelectedRoles.includes(role.role_id) ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={localSelectedRoles.includes(role.role_id)}
                  onChange={() => handleRoleToggle(role.role_id)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{role.role_name}</p>
                  {role.description && (
                    <p className="text-sm text-gray-500">{role.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
          
          {roles.length === 0 && (
            <p className="text-center text-gray-500 py-4">No roles available</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Roles ({localSelectedRoles.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignRoleModal; 