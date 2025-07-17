// src/routes/PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("https://admin-backend-six-steel.vercel.app/api/auth/me", {
          withCredentials: true,
        });
        if (res.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen text-xl text-gray-500">Checking authentication...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
