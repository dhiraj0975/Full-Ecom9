// import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Shield, Trash, UserCircle, X, CheckCircle, XCircle } from 'lucide-react';

export default function ActionDropdown({ user, onEdit, onAssignRole, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleAction = (action) => {
    setIsOpen(false);
    setTimeout(() => {
      action();
    }, 100);
  };

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      // Calculate position when opening
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = 400; // Approximate height
      const dropdownWidth = 320; // w-80 = 320px
      
      // Start with button position - LEFT SIDE
      let top = buttonRect.bottom + 8;
      let left = buttonRect.left - dropdownWidth; // Changed to left side
      
      // Adjust if would go below viewport
      if (top + dropdownHeight > viewportHeight) {
        top = buttonRect.top - dropdownHeight - 8;
      }
      
      // Adjust if would go outside left edge
      if (left < 8) {
        left = 8;
      }
      
      // Adjust if would go outside right edge
      if (left + dropdownWidth > viewportWidth - 8) {
        left = viewportWidth - dropdownWidth - 8;
      }
      
      // Ensure minimum top position
      if (top < 8) {
        top = 8;
      }
      
      setPosition({ top, left });
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('scroll', handleScroll);
      // Prevent body scroll when dropdown is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Check if user is active (case-insensitive)
  const isUserActive = user.status?.toLowerCase() === 'active';

  // Dynamic status styles
  const getStatusStyles = () => {
    if (isUserActive) {
      return {
        container: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50",
        text: "text-green-700",
        badge: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600",
        icon: "text-green-500"
      };
    } else {
      return {
        container: "bg-gradient-to-r from-red-50 to-pink-50 border-red-200/50",
        text: "text-red-700",
        badge: "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-600",
        icon: "text-red-500"
      };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-xl hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-200
        ${isOpen ? 'ring-2 ring-blue-500 scale-110 shadow-blue-200/80' : ''}`}
        style={{ boxShadow: isOpen ? '0 4px 24px 0 rgba(59,130,246,0.15)' : undefined }}
        aria-label="Actions"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-blue-600" aria-hidden="true" />
        ) : (
          <MoreHorizontal
            className="h-6 w-6 text-gray-600 group-hover:text-blue-500 transition-all duration-200"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown - NO ANIMATIONS */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed w-80 rounded-2xl bg-white shadow-2xl border border-gray-200/50 z-[9999]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
        >
          <div className="p-4">
            {/* User Info Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <UserCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleAction(() => onEdit(user))}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 transition-all duration-300 group"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Edit className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">Edit User</div>
                  <div className="text-xs text-gray-500">Update user information</div>
                </div>
              </button>

              <button
                onClick={() => handleAction(() => onAssignRole(user))}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/50 transition-all duration-300 group"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">Assign Role</div>
                  <div className="text-xs text-gray-500">Manage user permissions</div>
                </div>
              </button>

              <button
                onClick={() => handleAction(() => onDelete(user.id))}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200/50 transition-all duration-300 group"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Trash className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">Delete User</div>
                  <div className="text-xs text-gray-500">Remove user permanently</div>
                </div>
              </button>
            </div>

            {/* Dynamic Status Info */}
            <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${statusStyles.container}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isUserActive ? (
                    <CheckCircle className={`h-4 w-4 ${statusStyles.icon} animate-pulse`} />
                  ) : (
                    <XCircle className={`h-4 w-4 ${statusStyles.icon} animate-pulse`} />
                  )}
                  <span className={`text-sm font-medium ${statusStyles.text}`}>
                    {isUserActive ? 'User is Active' : 'User is Inactive'}
                  </span>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border transition-all duration-300 ${statusStyles.badge}`}>
                  {isUserActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              
              {/* Status Description */}
              <div className="mt-2">
                <p className={`text-xs ${statusStyles.text} opacity-80`}>
                  {isUserActive 
                    ? 'This user can access the system and perform actions.'
                    : 'This user is currently disabled and cannot access the system.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 