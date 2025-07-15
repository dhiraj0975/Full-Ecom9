// src/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./src/pages/Dashbord";
import Sidebar from "./src/component/Sidebar";
import Header from "./src/component/Header";
import User from "./src/pages/User";
import Products from "./src/pages/Products";
import Category from "./src/pages/Category";
import Role from "./src/pages/Role";
import UserAssign from "./src/pages/UserAssignRole";
import SubCategory from "./src/pages/SubCategory";
import Profile from "./src/pages/Profile";
import Login from "./src/pages/Login";
import PrivateRoute from './src/Routs/PrivateRoutes';
import ForgotPassword from "./src/pages/ForgotPassword";
import ResetPassword from "./src/pages/ResetPassword";
import Retailer from "./src/pages/Retailer";
import RetailerBank from "./src/pages/RetailerBank";

function AppRoutes() {
  const location = useLocation();
  const isPublicPage = ["/login", "/forgot-password", "/reset-password"].includes(location.pathname);

  if (isPublicPage) {
    return (
      <div className="flex w-full min-h-screen bg-gray-50">
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Protected pages
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute><User /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Category /></PrivateRoute>} />
          <Route path="/retailer" element={<PrivateRoute><Retailer /></PrivateRoute>} />
          <Route path="/retailer/bank" element={<PrivateRoute><RetailerBank /></PrivateRoute>} />
          <Route path="/retailers" element={<PrivateRoute><Retailer /></PrivateRoute>} />
          <Route path="/retailer-bank" element={<PrivateRoute><RetailerBank /></PrivateRoute>} />
          <Route path="/roles" element={<PrivateRoute><Role /></PrivateRoute>} />
          <Route path="/admin/user-role-assign" element={<PrivateRoute><UserAssign /></PrivateRoute>} />
          <Route path="/subcategories" element={<PrivateRoute><SubCategory /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default AppRoutes;
