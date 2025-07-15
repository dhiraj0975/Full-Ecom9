import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VerifyMobileOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const { phone, email } = location.state || {};

  useEffect(() => {
    if (!phone || !email) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phone, email, navigate]);

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/customers/verify-mobile-otp', { phone, email, otp }, { withCredentials: true });
      const data = response.data;
      console.log('OTP verification response:', data);

      if (data.success) {
        setSuccess('Mobile verification successful! Logging you in...');
        
        // Save token to localStorage
        localStorage.setItem('token', data.data.token);
        
        // Auto-login successful
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response2 = await axios.post('/api/customers/generate-mobile-otp', { phone, email }, { withCredentials: true });
      const data2 = response2.data;
      setSuccess('OTP resent successfully!');
      setCountdown(30);
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        
        {/* Floating particles */}
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: Math.random() * window.innerWidth,
              top: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [Math.random() * 0.5 + 0.1, Math.random() * 0.25 + 0.05, Math.random() * 0.5 + 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-6 shadow-2xl"
            >
              <Phone className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Verify Your Mobile</h2>
            <p className="text-gray-300">Enter the 6-digit OTP sent to {phone}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
          >
            <form onSubmit={handleOTPVerification} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white/90">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2 text-red-400 bg-red-500/20 p-4 rounded-xl border border-red-500/30"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2 text-green-400 bg-green-500/20 p-4 rounded-xl border border-green-500/30"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Verify OTP</span>
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </motion.button>

              <div className="text-center space-y-4">
                {countdown > 0 ? (
                  <p className="text-gray-400 text-sm">
                    Resend OTP in {countdown} seconds
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={resendLoading}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-200 disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : "Didn't receive OTP? Resend"}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="flex items-center justify-center space-x-2 text-gray-400 hover:text-white text-sm font-medium transition duration-200 mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Register</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyMobileOtp; 