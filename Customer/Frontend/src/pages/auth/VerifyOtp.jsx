import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

// Confetti SVG animation
const Confetti = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 50}}>
    <g>
      {[...Array(24)].map((_, i) => (
        <motion.circle
          key={i}
          cx={Math.random() * 100 + '%'}
          cy={Math.random() * 100 + '%'}
          r={Math.random() * 2 + 2}
          fill={`hsl(${Math.random() * 360}, 80%, 60%)`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0.5] }}
          transition={{ delay: i * 0.04, duration: 1.1, repeat: Infinity, repeatDelay: 2 }}
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
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'blur(60px)', background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', borderRadius: '50%' }}
    />
    <motion.div
      className="absolute -bottom-32 -right-32 w-96 h-96 z-0"
      animate={{
        scale: [1.1, 0.9, 1.1],
        rotate: [0, -360],
        x: [0, -30, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'blur(60px)', background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', borderRadius: '50%' }}
    />
  </>
);

const OtpInput = ({ value, onChange, onBackspace, isError }) => {
  const inputs = Array(6).fill('');
  const refs = Array(6).fill().map(() => useRef());

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;
    const newValue = value.split('');
    newValue[idx] = val[val.length - 1];
    onChange(newValue.join('').slice(0, 6));
    if (idx < 5 && val) refs[idx + 1].current.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!value[idx] && idx > 0) refs[idx - 1].current.focus();
      onBackspace(idx);
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (paste.length === 6) {
      onChange(paste);
      // Focus last input
      refs[5].current && refs[5].current.focus();
      e.preventDefault();
    }
  };

  return (
    <motion.div className="flex gap-3 justify-center mb-8" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
      {inputs.map((_, idx) => (
        <motion.input
          key={idx}
          ref={refs[idx]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className={`w-14 h-16 text-3xl text-center rounded-xl border-2 transition-all duration-300 bg-white/80 shadow-md focus:shadow-xl outline-none font-mono tracking-widest ${isError ? 'border-red-400 animate-shake' : 'border-yellow-300 focus:border-yellow-500'}`}
          whileFocus={{ scale: 1.1, boxShadow: '0 0 0 4px #ffe06655' }}
          as={motion.input}
          animate={isError ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
        />
      ))}
    </motion.div>
  );
};

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [email] = useState(localStorage.getItem('reset_email') || '');
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const handleBackspace = (idx) => {
    if (otp.length > 0) {
      const arr = otp.split('');
      arr[idx] = '';
      setOtp(arr.join(''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setIsError(true);
      setTimeout(() => setIsError(false), 700);
      return;
    }
    // Frontend OTP check (for demo)
    const savedOtp = localStorage.getItem('reset_otp');
    if (otp !== savedOtp) {
      setIsError(true);
      Swal.fire({
        icon: 'error',
        title: 'Invalid OTP',
        text: 'The OTP you entered is incorrect.'
      });
      setTimeout(() => setIsError(false), 700);
      return;
    }
    setLoading(true);
    try {
      // Proceed with backend verification (optional)
      const response = await api.post('/api/customers/verify-otp-reset', { email, otp, newPassword: 'dummy123' });
      const data = response.data;
      if (data.success || data.message?.toLowerCase().includes('password')) {
        setShowConfetti(true);
        localStorage.removeItem('reset_otp');
        Swal.fire({
          icon: 'success',
          title: 'OTP Verified!',
          text: 'Please set your new password.',
          timer: 1500,
          showConfirmButton: false
        });
        setTimeout(() => {
          setShowConfetti(false);
          navigate('/reset-password', { state: { email, otp } });
        }, 1600);
      } else {
        setIsError(true);
        Swal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: data.message || 'Please try again.'
        });
        setTimeout(() => setIsError(false), 700);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100 p-4 overflow-hidden relative">
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
          className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-green-600 drop-shadow-lg"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ✨ Verify OTP
        </motion.h2>
        <motion.p className="mb-6 text-gray-600 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Enter the 6-digit OTP sent to your email
        </motion.p>
        <OtpInput value={otp} onChange={setOtp} onBackspace={handleBackspace} isError={isError} />
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-yellow-400 to-green-500 text-white shadow-xl hover:from-yellow-500 hover:to-green-600 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          whileHover={{ scale: 1.03, rotate: 1 }}
          whileTap={{ scale: 0.97, rotate: -1 }}
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
                className="inline-block w-6 h-6 border-4 border-yellow-200 border-t-green-500 rounded-full"
              />
            ) : (
              <>
                <span>Verify OTP</span>
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

export default VerifyOtp;
