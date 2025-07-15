// 📁 src/components/LogOutDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { IoMdArrowDropdown, IoIosArrowForward } from 'react-icons/io';
import { FaUserCircle, FaCog, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../api';

const LogOutDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  // Get email and name from localStorage
  const email = localStorage.getItem("adminEmail") || "No email";
  const name = localStorage.getItem("adminName") || "Admin";

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      // Remove token from cookie
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // Remove email from localStorage
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminName");
      // If using localStorage/sessionStorage, also clear those:
      // localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left font-[Inter]" ref={dropdownRef}>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded transition"
      >
        <img
          src="/src/pages/DHiraj.PNG"
          alt="Profile"
          className="w-9 h-9 rounded-full border border-gray-300"
        />
        <div>
          <p className="text-sm font-medium text-gray-800">{email.split('@')[0]}</p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
        <IoMdArrowDropdown className="text-xl text-gray-600" />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 font-[Inter]">
          <ul className="divide-y divide-gray-100">
            <li className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
              <div className="flex items-center space-x-3">
                <FaUserCircle className="text-purple-600 text-lg" />
                <span className="text-sm font-medium">Edit Profile</span>
              </div>
              <IoIosArrowForward className="text-gray-400" />
            </li>
            <li className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
              <div className="flex items-center space-x-3">
                <FaCog className="text-purple-600 text-lg" />
                <span className="text-sm font-medium">Settings & Privacy</span>
              </div>
              <IoIosArrowForward className="text-gray-400" />
            </li>
            <li className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition">
              <div className="flex items-center space-x-3">
                <FaQuestionCircle className="text-purple-600 text-lg" />
                <span className="text-sm font-medium">Help & Support</span>
              </div>
              <IoIosArrowForward className="text-gray-400" />
            </li>
            <li
              onClick={handleLogout}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition text-red-600"
            >
              <div className="flex items-center space-x-3">
                <FaSignOutAlt className="text-red-600 text-lg" />
                <span className="text-sm font-medium">Logout</span>
              </div>
              <IoIosArrowForward className="text-red-400" />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LogOutDropdown;
  