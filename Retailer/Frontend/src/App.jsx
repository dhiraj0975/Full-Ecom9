import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import './toast.css'; // Temporarily commented out to debug toast visibility
import Register from './Pages/Register';
import Login from './Pages/Login';
import Profile from './Pages/Profile';
import Home from './Pages/Home';
import Products from './Pages/Products';
import ApiTest from './Component/ApiTest';
import { isAuthenticated } from './api';

// Authentication check component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Redirect logged-in users to home
const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/home" replace /> : children;
};

import Orders from './Pages/Orders';
import Customers from './Pages/Customers';
import Analytics from './Pages/Analytics';
import ProductDetails from './Pages/ProductDetails';
import OrderDetails from './Pages/OrderDetails';
import CustomerAddresses from './Pages/CustomerAddresses';


const Settings = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p className="text-gray-600">This page is under development.</p>
  </div>
);

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          } />
          <Route path="/customers/:customerId/addresses" element={
            <ProtectedRoute>
              <CustomerAddresses />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          } />
          <Route path="/order/:id" element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
      
      {/* Toast Container with proper configuration */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
      />
    </>
  );
}

export default App;