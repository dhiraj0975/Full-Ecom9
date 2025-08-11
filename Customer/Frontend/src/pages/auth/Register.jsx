  import React, { useState } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
  import api from '../../api/axios';

  const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      setError('');
      setSuccess('');
    };

    const validateForm = () => {
      if (!formData.name.trim()) return setError('Name is required'), false;
      if (!formData.email.trim()) return setError('Email is required'), false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError('Please enter a valid email address'), false;
      if (!formData.phone.trim()) return setError('Phone number is required'), false;
      if (!/^\d{10}$/.test(formData.phone)) return setError('Please enter a valid 10-digit phone number'), false;
      if (!formData.password) return setError('Password is required'), false;
      if (formData.password.length < 6) return setError('Password must be at least 6 characters long'), false;
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match'), false;
      return true;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      if (!validateForm()) return setLoading(false);

      try {
        const { data } = await api.post('/api/customers/register', formData);
        if (data.success) {
          setSuccess('Registration successful! Redirecting to OTP verification...');
          setTimeout(() => navigate('/verify-mobile-otp', { state: { phone: formData.phone, email: formData.email } }), 2000);
        } else setError(data.message || 'Registration failed');
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.response?.data?.message || (err.name === 'TypeError' && err.message.includes('fetch') ? 'Cannot connect to server. Please check if backend is running.' : 'Network error. Please try again.'));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-400 to-pink-400 px-4">
        <div className="bg-white rounded-xl shadow-lg flex flex-col-reverse md:flex-row max-w-6xl overflow-hidden">
          <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8">
            <div className="w-full max-w-md md:max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">Register</h2>
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 text-base md:text-lg">
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="Type your full name" className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-pink-400 outline-none" /></div>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="Type your email" className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-pink-400 outline-none" /></div>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="Type your phone number" className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-pink-400 outline-none" maxLength={10} /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} placeholder="Type your password" className="w-full pl-10 pr-12 py-3 border-b-2 border-gray-200 focus:border-pink-400 outline-none" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className="w-full pl-10 pr-12 py-3 border-b-2 border-gray-200 focus:border-pink-400 outline-none" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
                {success && <div className="text-green-500 text-sm bg-green-50 p-2 rounded">{success}</div>}
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-full font-semibold hover:opacity-90 transition">{loading ? 'Creating Account...' : 'Register'}</button>
              </form>
              <div className="mt-4 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-pink-500 hover:underline">Login</Link></div>
              <div className="mt-5 text-center text-gray-500 text-sm">Or Sign Up Using</div>
              <div className="flex justify-center space-x-4 mt-3"><a href="#" className="text-blue-600"><i className="fab fa-facebook-f"></i></a><a href="#" className="text-sky-400"><i className="fab fa-twitter"></i></a><a href="#" className="text-red-500"><i className="fab fa-google"></i></a></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-60 md:h-auto flex items-center justify-center bg-gray-50">
  <img 
    src="/Girl-2.png" 
    alt="Register" 
    className="w-full h-full object-contain md:object-cover" 
  />
          </div>

        </div>
      </div>
    );
  };

  export default Register;