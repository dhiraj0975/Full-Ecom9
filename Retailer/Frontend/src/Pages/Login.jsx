import React, { useState } from 'react';
import { loginRetailer, handleApiError } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    try {
      const response = await loginRetailer(form);
      console.log('Login response:', response); // Debug log
      
      if (response.success) {
        console.log('Login successful, token stored:', localStorage.getItem('token')); // Debug log
        console.log('User stored:', localStorage.getItem('user')); // Debug log
        setMsg('Login successful!');
        toast.success('Login successful! Redirecting to dashboard...', { position: 'top-center' });
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        const error = handleApiError(response);
        setMsg(error.message);
        toast.error(error.message, { position: 'top-center' });
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      const error = handleApiError({ error: err, status: 500 });
      setMsg(error.message);
      toast.error(error.message, { position: 'top-center' });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <ToastContainer position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Retailer Login</h2>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            autoComplete="username"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-2 top-2 text-gray-500 hover:text-blue-600"
              tabIndex={-1}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-200"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
        {msg && (
          <div
            className={`text-center text-sm font-medium ${
              msg === 'Login successful!' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {msg}
          </div>
        )}
        <div className="text-center text-gray-500 text-sm mt-2">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;