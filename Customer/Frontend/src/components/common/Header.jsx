import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, Home as HomeIcon, UserPlus, User, ChevronDown, Search, Settings, Menu, ShoppingBag, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryBar from './CategoryBar';
import { getCart as getCartApi } from '../../api/cartApi';
import axios from 'axios';
import Logo from '../../assets/E_Commerce_Transparent_LOGO.png';

function getToken() {
  let token = localStorage.getItem('token');
  if (token) return token;
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

function getUserName() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.name || 'Customer';
  } catch {
    return 'Customer';
  }
}

const navBtnVariants = {
  initial: { scale: 1, y: 0, boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
  hover: { scale: 1.08, y: -2, boxShadow: '0 4px 16px 0 rgba(59,130,246,0.08)', transition: { type: 'spring', stiffness: 400 } },
};

const dropdownVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

const mobileMenuVariants = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.18 } },
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!getToken();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userName = getUserName();
  const [searchFocus, setSearchFocus] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const hideSearchRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-otp',
    '/reset-password',
  ];
  const hideSearch = hideSearchRoutes.includes(location.pathname);

  // Routes jahan CategoryBar nahi dikhani
  const hideCategoryBarRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-otp',
    '/reset-password'
  ];
  const hideCategoryBar = hideCategoryBarRoutes.includes(location.pathname);

  // CategoryBar should only show on Home page
  const showCategoryBar = location.pathname === '/';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const res = await getCartApi();
        setCartCount(res.data.length);
      } catch {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    return () => window.removeEventListener('cart-updated', updateCartCount);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/customers/logout', {}, { withCredentials: true });
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; Max-Age=0; path=/;';
    document.cookie = 'jwt_token=; Max-Age=0; path=/;';
    window.dispatchEvent(new Event('cart-updated'));
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/profile');
  };

  // Nav/auth buttons for reuse (desktop)
  const navAuthButtons = (
    <>
      <motion.button
        variants={navBtnVariants}
        initial="initial"
        whileHover="hover"
        onClick={() => navigate('/products')}
        className={`flex items-center gap-1 px-3 py-1 rounded transition text-sm font-medium ${location.pathname === '/products' ? 'text-blue-600' : 'text-gray-700'}`}
      >
        <ShoppingBag className="h-5 w-5" /> Products
      </motion.button>
      <motion.button
        variants={navBtnVariants}
        initial="initial"
        whileHover="hover"
        onClick={() => navigate('/cart')}
        className={`relative flex items-center gap-1 px-3 py-1 rounded transition text-sm font-medium ${location.pathname === '/cart' ? 'text-blue-600' : 'text-gray-700'}`}
      >
        <span className="relative">
          <ShoppingCart className="h-5 w-5" />
          {isLoggedIn && cartCount > 0 && (
            <span
              key={cartCount}
              className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white animate-bounce z-10"
              style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
            >
              {cartCount}
            </span>
          )}
        </span>
        Cart
      </motion.button>
      {!isLoggedIn ? (
        <>
          <motion.button
            variants={navBtnVariants}
            initial="initial"
            whileHover="hover"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 shadow-lg transition border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ backgroundSize: '200% 100%', backgroundPosition: '0 0' }}
          >
            <LogIn className="h-5 w-5" /> Login
          </motion.button>
          <motion.button
            variants={navBtnVariants}
            initial="initial"
            whileHover="hover"
            onClick={() => navigate('/register')}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 shadow-lg transition border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
            style={{ backgroundSize: '200% 100%', backgroundPosition: '0 0' }}
          >
            <UserPlus className="h-5 w-5" /> Register
          </motion.button>
        </>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <motion.button
            variants={navBtnVariants}
            initial="initial"
            whileHover="hover"
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex items-center gap-2 px-3 py-1 rounded transition text-sm font-medium text-gray-700 focus:outline-none"
          >
            <User className="h-5 w-5" />
            <span className="flex items-center  ">{userName}</span>
            <ChevronDown className="h-4 w-4" />
          </motion.button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                key="dropdown"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={dropdownVariants}
                className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
              >
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/orders'); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <Package className="h-4 w-4" /> My Orders
                </button>
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <Settings className="h-4 w-4" /> Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="sticky top-0 z-50 w-full bg-white shadow-md"
      >
        <div className="mx-auto px-4 sm:px-8 flex items-center h-16 justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}> 
            <motion.img
              src={Logo}
              alt="Ecommerce Logo"
              className="h-14 w-auto object-contain drop-shadow-md"
              initial={{ scale: 0.8 }}
              animate={{
                scale: [1, 1.06, 1],
                transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
              }}
              transition={{ type: 'spring', duration: 0.7 }}
              whileHover={{ scale: 1.08, boxShadow: '0 4px 24px 0 rgba(59,130,246,0.18)' }}
              whileTap={{ scale: 0.92, rotate: -10 }}
            />
          </div>

          {/* Center: Search Bar (all devices) */}
          {!hideSearch && (
            <motion.form
              className="flex w-full max-w-xl items-center justify-center mx-2 md:mx-4"
              animate={searchFocus ? { scale: 1.04, boxShadow: '0 2px 16px 0 rgba(59,130,246,0.10)' } : { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }}
              transition={{ type: 'spring', stiffness: 300 }}
              onSubmit={e => {
                e.preventDefault();
              }}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-base shadow-sm"
                />
              </div>
            </motion.form>
          )}

          {/* Right: All nav/auth buttons + Become a Seller */}
          <div className="hidden md:flex items-center gap-4">
            {navAuthButtons}
            <motion.button
              variants={navBtnVariants}
              initial="initial"
              whileHover="hover"
              onClick={() => navigate('/become-seller')}
              className="px-6 py-2.5 border border-orange-500 text-orange-600 font-semibold rounded-full bg-white hover:bg-orange-50 transition ml-2"
              style={{ minWidth: '180px' }}
            >
              Become a Seller
            </motion.button>
          </div>

          {/* Mobile Right Side: Cart + Hamburger */}
          <div className="md:hidden flex items-center gap-2 relative">
            <motion.button
              variants={navBtnVariants}
              initial="initial"
              whileHover="hover"
              onClick={() => navigate('/cart')}
              className="relative flex items-center gap-1 px-3 py-1 rounded transition text-sm font-medium text-gray-700"
            >
              <span className="relative">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white animate-bounce z-10"
                    style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                  >
                    {cartCount}
                  </span>
                )}
              </span>
            </motion.button>
            <button
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <Menu className="h-7 w-7 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Mobile Nav/Auth Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, type: 'spring' }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg py-2 px-2 flex flex-col gap-1 border border-gray-100 z-[999] md:hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* Mobile Logo */}
              <motion.div
                className="text-xl font-bold cursor-pointer select-none bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent text-center py-2"
                whileHover={{
                  backgroundPosition: '200% 0',
                  transition: { duration: 0.7, repeat: Infinity, repeatType: 'reverse' },
                }}
                style={{
                  backgroundSize: '200% 100%',
                  backgroundPosition: '0 0',
                }}
                onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
              >
                CustomerStore
              </motion.div>
              {/* Nav Options */}
              <button onClick={() => { setMobileMenuOpen(false); navigate('/products'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 transition">
                <ShoppingBag className="h-5 w-5" /> Products
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/cart'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 transition">
                <ShoppingCart className="h-5 w-5" /> Cart
                {cartCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow border-2 border-white animate-bounce">{cartCount}</span>
                )}
              </button>
              {!isLoggedIn ? (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 transition">
                    <LogIn className="h-5 w-5" /> Login
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/register'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 transition">
                    <UserPlus className="h-5 w-5" /> Register
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/orders'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 transition">
                    <Package className="h-5 w-5" /> My Orders
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 transition">
                    <User className="h-5 w-5" /> Profile
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 transition">
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </>
              )}
              <button onClick={() => { setMobileMenuOpen(false); navigate('/become-seller'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold text-orange-600 border border-orange-400 bg-white hover:bg-orange-50 transition mt-2">
                <UserPlus className="h-5 w-5" /> Become a Seller
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      {/* CategoryBar should show on all pages except auth routes */}
      {!hideCategoryBar && <CategoryBar showIcons={showCategoryBar} />}
    </>
  );
};

export default Header; 