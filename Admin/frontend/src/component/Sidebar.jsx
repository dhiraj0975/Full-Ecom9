// 📁 src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Framer Motion import

import {
  FaTachometerAlt,
  FaUsers,
  FaUserShield,
  FaUserTag,
  FaUserCheck,
  FaStore,
  FaStoreAlt,
  FaBoxOpen,
  FaThList,
  FaThLarge,
  FaCogs,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";

import logo from "../assets/E_Commerce_Transparent_LOGO.png"
import { logoutAdmin } from "../api";

function Sidebar() {
  const [openSection, setOpenSection] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Ultra Enhanced Animation variants
  const sidebarVariants = {
    hidden: { x: -400, opacity: 0, scale: 0.8 },
    visible: { 
      x: 0, 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 25,
        staggerChildren: 0.05,
        delayChildren: 0.1,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0, scale: 0.7, rotateY: -15 },
    visible: { 
      x: 0, 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 40,
        duration: 0.6
      }
    }
  };

  const subItemVariants = {
    hidden: { x: -30, opacity: 0, height: 0, scale: 0.6, rotateX: -10 },
    visible: { 
      x: 0, 
      opacity: 1, 
      height: "auto", 
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 40,
        staggerChildren: 0.03,
        duration: 0.5
      }
    },
    exit: { 
      x: -30, 
      opacity: 0, 
      height: 0,
      scale: 0.6,
      rotateX: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    rotate: { rotate: 90, scale: 1.2, filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))" },
    normal: { rotate: 0, scale: 1, filter: "drop-shadow(0 0 0px rgba(59, 130, 246, 0))" }
  };

  const logoVariants = {
    hidden: { scale: 0.6, opacity: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        duration: 0.8
      }
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
      transition: {
        type: "spring",
        stiffness: 800,
        damping: 15,
        duration: 0.6
      }
    },
    tap: { 
      scale: 0.9,
      rotate: [0, 5, -5, 0],
      transition: {
        type: "spring",
        stiffness: 800,
        damping: 15,
        duration: 0.3
      }
    }
  };

  const buttonVariants = {
    hover: { 
      x: 12, 
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
      transition: {
        type: "spring",
        stiffness: 700,
        damping: 15,
        duration: 0.4
      }
    },
    tap: { 
      scale: 0.95,
      boxShadow: "0 5px 15px rgba(59, 130, 246, 0.2)",
      transition: {
        type: "spring",
        stiffness: 700,
        damping: 15,
        duration: 0.2
      }
    }
  };

  const iconSpinVariants = {
    hover: { 
      rotate: [0, 360],
      scale: [1, 1.4, 1.2],
      filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))",
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        scale: {
          duration: 0.4,
          ease: "easeInOut"
        }
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    hover: {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="w-64 bg-white text-black h-screen p-6 space-y-4 relative shadow-2xl overflow-hidden"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
      }}
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-5"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, #3b82f6 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Logo with enhanced animation */}
      <motion.div 
        className="mb-4 relative z-10"
        variants={logoVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Link to="/">
          <motion.img 
            src={logo} 
            alt="Admin Panel Logo" 
            className="w-56 h-auto"
            variants={floatingVariants}
            animate="animate"
          />
        </Link>
      </motion.div>

      <nav className="space-y-2 relative z-10">
        {/* Dashboard */}
        <motion.div variants={itemVariants}>
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoveredItem('dashboard')}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <motion.div
              variants={iconSpinVariants}
              whileHover="hover"
            >
              <FaTachometerAlt />
            </motion.div>
            <span>Dashboard</span>
            {hoveredItem === 'dashboard' && (
              <motion.div
                className="absolute inset-0 bg-blue-600 opacity-20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </Link>
        </motion.div>

        {/* Admin Management */}
        <motion.div variants={itemVariants}>
          <motion.button 
            onClick={() => toggleSection("admin")} 
            className="flex w-full items-center justify-between hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoveredItem('admin')}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <span className="flex items-center space-x-2">
              <motion.div
                variants={iconSpinVariants}
                whileHover="hover"
              >
                <FaUsers />
              </motion.div>
              <span>Admin Management</span>
            </span>
            <motion.div
              animate={openSection === "admin" ? "rotate" : "normal"}
              variants={iconVariants}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {openSection === "admin" ? <FaChevronDown /> : <FaChevronRight />}
            </motion.div>
            {hoveredItem === 'admin' && (
              <motion.div
                className="absolute inset-0 bg-blue-600 opacity-20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </motion.button>
          
          <AnimatePresence mode="wait">
            {openSection === "admin" && (
              <motion.div 
                className="ml-6 space-y-1 overflow-hidden"
                variants={subItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div variants={subItemVariants}>
                  <Link 
                    to="/admin/users" 
                    className="block hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredItem('users')}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    🙍‍♂️ Users
                    {hoveredItem === 'users' && (
                      <motion.div
                        className="absolute inset-0 bg-blue-600 opacity-20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                  </Link>
                </motion.div>
                <motion.div variants={subItemVariants}>
                  <Link 
                    to="/roles" 
                    className="block hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredItem('roles')}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    🛡️ Roles
                    {hoveredItem === 'roles' && (
                      <motion.div
                        className="absolute inset-0 bg-blue-600 opacity-20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Retailer Management */}
        <motion.div variants={itemVariants}>
          <motion.button 
            onClick={() => toggleSection("retailers")} 
            className="flex w-full items-center justify-between hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoveredItem('retailers')}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <span className="flex items-center space-x-2">
              <motion.div
                variants={iconSpinVariants}
                whileHover="hover"
              >
                <FaStoreAlt />
              </motion.div>
              <span>Retailer Management</span>
            </span>
            <motion.div
              animate={openSection === "retailers" ? "rotate" : "normal"}
              variants={iconVariants}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {openSection === "retailers" ? <FaChevronDown /> : <FaChevronRight />}
            </motion.div>
            {hoveredItem === 'retailers' && (
              <motion.div
                className="absolute inset-0 bg-blue-600 opacity-20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </motion.button>
          
          <AnimatePresence mode="wait">
            {openSection === "retailers" && (
              <motion.div 
                className="ml-6 space-y-1 overflow-hidden"
                variants={subItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div variants={subItemVariants}>
                  <Link 
                    to="/retailers" 
                    className="block hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredItem('retailer')}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    🏪 Retailer
                    {hoveredItem === 'retailer' && (
                      <motion.div
                        className="absolute inset-0 bg-blue-600 opacity-20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                  </Link>
                </motion.div>
                <motion.div variants={subItemVariants}>
                  <Link 
                    to="/retailer-bank" 
                    className="block hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredItem('bank')}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    🏦 Bank Account
                    {hoveredItem === 'bank' && (
                      <motion.div
                        className="absolute inset-0 bg-blue-600 opacity-20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Product Management */}
        <motion.div className="flex flex-col gap-3" variants={itemVariants}>
          <motion.button 
            onClick={() => toggleSection("products")} 
            className="flex w-full items-center justify-between hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoveredItem('products')}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <span className="flex items-center space-x-2">
              <motion.div
                variants={iconSpinVariants}
                whileHover="hover"
              >
                <FaBoxOpen />
              </motion.div>
              <span>Product Management</span>
            </span>
            <motion.div
              animate={openSection === "products" ? "rotate" : "normal"}
              variants={iconVariants}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {openSection === "products" ? <FaChevronDown /> : <FaChevronRight />}
            </motion.div>
            {hoveredItem === 'products' && (
              <motion.div
                className="absolute inset-0 bg-blue-600 opacity-20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </motion.button>
          
          <AnimatePresence mode="wait">
            {openSection === "products" && (
              <motion.div 
                className="ml-6 space-y-1 overflow-hidden"
                variants={subItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div variants={subItemVariants}>
                  <Link 
                    to="/categories" 
                    className="block hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredItem('categories')}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    🧩 Categories
                    {hoveredItem === 'categories' && (
                      <motion.div
                        className="absolute inset-0 bg-blue-600 opacity-20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                  </Link>
                </motion.div>
                <motion.div variants={subItemVariants}>
                  <Link 
                    to="/subcategories" 
                    className="block hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredItem('subcategories')}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    🗃️ Sub-Categories
                    {hoveredItem === 'subcategories' && (
                      <motion.div
                        className="absolute inset-0 bg-blue-600 opacity-20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                  </Link>
                </motion.div>
                <motion.div variants={subItemVariants}>
                  <Link 
                    to="/products" 
                    className="block hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredItem('product-list')}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    🛍️ Products
                    {hoveredItem === 'product-list' && (
                      <motion.div
                        className="absolute inset-0 bg-blue-600 opacity-20"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Settings & Logout */}
        <motion.div variants={itemVariants}>
          <Link 
            to="/settings" 
            className="flex items-center space-x-2 hover:text-white hover:bg-blue-600 p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoveredItem('settings')}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <motion.div
              variants={iconSpinVariants}
              whileHover="hover"
            >
              <FaCogs />
            </motion.div>
            <span>Settings</span>
            {hoveredItem === 'settings' && (
              <motion.div
                className="absolute inset-0 bg-blue-600 opacity-20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.button 
            onClick={handleLogout} 
            className="flex w-full items-center space-x-2 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoveredItem('logout')}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <motion.div
              variants={iconSpinVariants}
              whileHover="hover"
            >
              <FaSignOutAlt />
            </motion.div>
            <span>Logout</span>
            {hoveredItem === 'logout' && (
              <motion.div
                className="absolute inset-0 bg-red-600 opacity-20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </motion.button>
        </motion.div>
      </nav>

      <motion.div 
        className="absolute bottom-4 text-sm text-gray-400 left-4 right-4"
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: 1.2,
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.8
        }}
      >
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200"
          variants={glowVariants}
          whileHover="hover"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
            <span className="font-medium text-blue-700">Logged in as: Admin</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Sidebar;
