import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

// Confetti SVG animation
const Confetti = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 50}}>
    <g>
      {[...Array(30)].map((_, i) => (
        <motion.circle
          key={i}
          cx={Math.random() * 100 + '%'}
          cy={Math.random() * 100 + '%'}
          r={Math.random() * 3 + 2}
          fill={`hsl(${Math.random() * 360}, 80%, 60%)`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0.5] }}
          transition={{ delay: i * 0.05, duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
        />
      ))}
    </g>
  </svg>
);

// Animated SVG Blobs
const AnimatedBlobs = () => (
  <>
    <motion.div
      className="absolute -top-32 -left-32 w-96 h-96 z-0"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 360],
        x: [0, 30, 0],
        y: [0, 20, 0],
      }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'blur(60px)', background: 'linear-gradient(135deg, #ff6fd8 0%, #3813c2 100%)', borderRadius: '50%' }}
    />
    <motion.div
      className="absolute -bottom-32 -right-32 w-96 h-96 z-0"
      animate={{
        scale: [1.1, 0.9, 1.1],
        rotate: [0, -360],
        x: [0, -30, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'blur(60px)', background: 'linear-gradient(135deg, #42e695 0%, #3bb2b8 100%)', borderRadius: '50%' }}
    />
  </>
);

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const email = location.state?.email || localStorage.getItem('reset_email') || '';
  const otp = location.state?.otp || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Passwords do not match!' });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/customers/verify-otp-reset', { email, otp, newPassword: password });
      const data = response.data;
      if (data.success) {
        // Auto-login after password reset
        const loginRes = await api.post('/api/customers/login', { email, password });
        const loginData = loginRes.data;
        if (loginData.success && loginData.data && loginData.data.token) {
          localStorage.setItem('token', loginData.data.token);
          document.cookie = `token=${loginData.data.token}; path=/;`;
        }
        setShowConfetti(true);
        Swal.fire({
          icon: 'success',
          title: 'Password Reset Successful!',
          text: 'Logging you in...',
          timer: 1800,
          showConfirmButton: false
        });
        setTimeout(() => {
          setShowConfetti(false);
          navigate('/');
        }, 1900);
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Try again.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Network Error', text: 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 overflow-hidden relative">
      <AnimatedBlobs />
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>
      <motion.form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center border border-white/40"
        initial={{ scale: 0.8, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 60, opacity: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
      >
        <motion.h2
          className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600 drop-shadow-lg"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          🔒 Set a New Password
        </motion.h2>
        <motion.div
          className="w-full mb-6"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.input
            type="password"
            required
            minLength={6}
            placeholder="New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-5 py-4 text-lg rounded-xl border-2 border-fuchsia-300 focus:border-fuchsia-600 focus:ring-2 focus:ring-fuchsia-200 transition-all duration-300 bg-white/70 shadow-md focus:shadow-xl outline-none"
            whileFocus={{ scale: 1.04, boxShadow: '0 0 0 4px #f0abfc55' }}
            as={motion.input}
          />
        </motion.div>
        <motion.div
          className="w-full mb-8"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.input
            type="password"
            required
            minLength={6}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-5 py-4 text-lg rounded-xl border-2 border-indigo-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/70 shadow-md focus:shadow-xl outline-none"
            whileFocus={{ scale: 1.04, boxShadow: '0 0 0 4px #818cf855' }}
            as={motion.input}
          />
        </motion.div>
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-xl hover:from-fuchsia-700 hover:to-indigo-700 focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          whileHover={{ scale: 1.03, rotate: -1 }}
          whileTap={{ scale: 0.97, rotate: 1 }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-6 h-6 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full"
              />
            ) : (
              <>
                <span>Set Password</span>
                <motion.svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.path d="M5 12h14M12 5l7 7-7 7" />
                </motion.svg>
              </>
            )}
          </motion.span>
        </motion.button>
      </motion.form>
    </div>
  );
};

export default ResetPassword; 