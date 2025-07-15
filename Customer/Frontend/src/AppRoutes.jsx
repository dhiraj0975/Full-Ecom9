// / src/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyMobileOtp from './pages/auth/VerifyMobileOtp';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart';
import AddressPage from './pages/address/AddressPage';
import PaymentPage from './pages/payment/PaymentPage';
import OrderHistory from './pages/orders/OrderHistory';
import Profile from './pages/Profile.jsx';

const getToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};

const PublicRoute = ({ children }) => (getToken() ? <Navigate to="/login" replace /> : children);
const ProtectedRoute = ({ children }) => (getToken() ? children : <Navigate to="/login" replace />);

// PrivateRoute component
function PrivateRoute({ element }) {
  const isLoggedIn = !!(localStorage.getItem('token') || document.cookie.match(/(^| )token=([^;]+)/));
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
    <Route path="/verify-mobile-otp" element={<PublicRoute><VerifyMobileOtp /></PublicRoute>} />
    <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
    <Route path="/products" element={<ProductList />} />
    <Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/products/subcategory/:subcategoryId" element={<ProductList />} />
    <Route path="/cart" element={<PrivateRoute element={<Cart />} />} />
    <Route path="/address" element={<PrivateRoute element={<AddressPage />} />} />
    <Route path="/payment" element={<PrivateRoute element={<PaymentPage />} />} />
    <Route path="/orders" element={<PrivateRoute element={<OrderHistory />} />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;