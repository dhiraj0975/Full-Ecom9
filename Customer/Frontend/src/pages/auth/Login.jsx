import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/customers/login", formData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.customer));
        navigate("/");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-400 to-pink-400 px-4">
      <div className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        {/* Left Side Video */}
        <div className="md:w-1/2 w-full">
          <img
            src="/../public/Entrepreneur.jpeg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-64 md:h-full object-cover"
          />
        </div>

        {/* Right Side Form */}
        <div className="md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Type your username"
                  className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-pink-400 outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Type your password"
                  className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-pink-400 outline-none"
                />
              </div>
              {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
              <div className="flex justify-between text-sm text-gray-500">
                <span></span>
                <Link to="/forgot-password" className="cursor-pointer hover:underline text-pink-500">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-full font-semibold hover:opacity-90 transition"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-500">
              Don't have an account? <Link to="/register" className="text-pink-500 hover:underline">Register</Link>
            </div>
            <div className="mt-6 text-center text-gray-500 text-sm">
              Or Sign Up Using
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#" className="text-blue-600"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-sky-400"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-red-500"><i className="fab fa-google"></i></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
