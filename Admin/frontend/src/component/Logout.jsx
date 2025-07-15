import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../api/allAPI"; // ✅ API
import { toast } from "react-toastify";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Show loading-style toast first
    const toastId = toast.loading("Logging out...");

    try {
      await logoutAdmin(); // ✅ Call logout API
      // Update the toast to success after logout
      toast.update(toastId, {
        render: "Logout successful!",
        type: "success",
        isLoading: false,
        autoClose: 2000, // Toast will auto close in 2s
        closeButton: true,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Logout failed", err);
      toast.update(toastId, {
        render: "Logout failed. Try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default Logout;
