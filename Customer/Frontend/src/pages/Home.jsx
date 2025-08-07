import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, ArrowRight, ChevronDown, Star, Zap, Shield, Truck, Gift, Heart, TrendingUp } from 'lucide-react';
import CustomImageSwiper from '../components/common/CustomImageSwiper';
import ProductGrid from '../components/products/ProductGrid';
import { getProducts } from '../services/productService';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/2ad9256d47bff7ca.jpg?q=60',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/5738158f6f0d7209.jpg?q=60',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/14eb0fb178248c58.jpg?q=60',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/74f0ad81e44e6e6f.jpg?q=60',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/85964c6ee5076f5d.jpg?q=60',
  'https://images.meesho.com/images/marketing/1746425994914.webp',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/fb28e3e1d22e6da2.jpg?q=60',
];

// Enhanced Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.2
    } 
  },
  exit: { opacity: 0, y: -30, transition: { duration: 0.5 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get user info
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
    } catch (e) {
      setCurrentUser(null);
    }

    async function fetchProducts() {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className='mx-2'>
        <div className="min-h-screen">
          {/* Enhanced Welcome Banner for Logged-in Users */}
          <AnimatePresence>
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white py-4 px-6 mx-2 mt-2 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <motion.h2 
                      className="text-sm sm:text-base font-bold flex items-center gap-2"
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.span
                        animate={{ rotate: [0, 20, 0] }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        👋
                      </motion.span>
                      Welcome back, {currentUser.name}!
                    </motion.h2>
                    <motion.p 
                      className="text-xs sm:text-sm text-blue-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Ready to discover amazing products?
                    </motion.p>
                  </div>
                  <motion.div 
                    className="hidden sm:block text-3xl"
                    variants={floatingVariants}
                    animate="animate"
                  >
                    🛍️
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Image Swiper */}
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <CustomImageSwiper images={images} height="h-64" />
          </motion.div>
          
          {/* Enhanced Animated Scroll Indicator */}
          <div className="flex justify-center">
            <motion.div
              animate={{ 
                y: [0, 15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-30"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <ChevronDown className="h-8 w-8 text-blue-500 mt-2 mb-4 relative z-10" />
            </motion.div>
          </div>

          {/* Enhanced Quick Stats */}
          <motion.div 
            className="max-w-7xl mx-auto px-4 py-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  icon: "🚚",
                  title: "Free Delivery",
                  desc: "On orders above ₹500",
                  color: "from-blue-50 to-blue-100",
                  borderColor: "border-blue-200",
                  textColor: "text-blue-700"
                },
                {
                  icon: "🔒",
                  title: "Secure Payment",
                  desc: "100% Safe & Secure",
                  color: "from-green-50 to-green-100",
                  borderColor: "border-green-200",
                  textColor: "text-green-700"
                },
                {
                  icon: "⚡",
                  title: "Fast Delivery",
                  desc: "Same day delivery",
                  color: "from-purple-50 to-purple-100",
                  borderColor: "border-purple-200",
                  textColor: "text-purple-700"
                },
                {
                  icon: "🎁",
                  title: "Best Offers",
                  desc: "Daily deals & discounts",
                  color: "from-orange-50 to-orange-100",
                  borderColor: "border-orange-200",
                  textColor: "text-orange-700"
                }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.title}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl text-center border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                >
                  <motion.div 
                    className="text-2xl mb-2"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, delay: idx * 0.2, repeat: Infinity }}
                  >
                    {stat.icon}
                  </motion.div>
                  <div className={`text-sm font-bold ${stat.textColor}`}>{stat.title}</div>
                  <div className={`text-xs ${stat.textColor.replace('700', '600')}`}>{stat.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Featured Products Section */}
          <motion.div 
            className="max-w-7xl mx-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <motion.h2 
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mr-2"
                >
                  ✨
                </motion.span>
                Featured Products
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="inline-block ml-2"
                >
                  ✨
                </motion.span>
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Discover our handpicked collection of amazing products
              </motion.p>
            </div>
            
            {loading ? (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="inline-block rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.p 
                  className="mt-4 text-gray-600 text-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading amazing products...
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <ProductGrid products={products.slice(0, 8)} />
              </motion.div>
            )}
            
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/products" 
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-bold hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 shadow-lg hover:shadow-2xl text-lg"
                >
                  <span>View All Products</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Hero Section */}
          <motion.div 
            className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/10 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <motion.h1 
                  className="text-5xl md:text-8xl font-bold mb-6"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    duration: 1
                  }}
                >
                  Welcome to{" "}
                  <motion.span 
                    className="text-yellow-300"
                    animate={{ 
                      textShadow: [
                        "0 0 20px rgba(255,255,0,0.5)",
                        "0 0 40px rgba(255,255,0,0.8)",
                        "0 0 20px rgba(255,255,0,0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    CustomerStore
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-3xl mb-8 text-blue-100"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Your one-stop destination for all your shopping needs{" "}
                  <motion.span
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 1, delay: 0.5, repeat: Infinity }}
                    className="inline-block"
                  >
                    🛒
                  </motion.span>
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-full font-bold hover:bg-gray-100 transform transition-all duration-300 shadow-2xl text-xl"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <ShoppingBag className="h-7 w-7" />
                      </motion.div>
                      <span>Start Shopping Now</span>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Features Section */}
          <motion.div 
            className="py-16 bg-gradient-to-br from-gray-50 to-blue-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Why Choose CustomerStore?{" "}
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="inline-block"
                  >
                    🌟
                  </motion.span>
                </h2>
                <p className="text-lg text-gray-600">
                  We provide the best shopping experience for our customers
                </p>
              </motion.div>
              
              <motion.div 
                className="grid md:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  {
                    icon: <ShoppingBag className="h-10 w-10 text-blue-600" />,
                    title: "Wide Selection",
                    desc: "Browse through thousands of products from top brands",
                    color: "from-blue-100 to-blue-200",
                    emoji: "🛍️"
                  },
                  {
                    icon: <Shield className="h-10 w-10 text-green-600" />,
                    title: "Secure Shopping",
                    desc: "Your data is protected with industry-standard security",
                    color: "from-green-100 to-green-200",
                    emoji: "🔐"
                  },
                  {
                    icon: <Truck className="h-10 w-10 text-purple-600" />,
                    title: "Fast Delivery",
                    desc: "Get your orders delivered quickly and safely",
                    color: "from-purple-100 to-purple-200",
                    emoji: "⚡"
                  }
                ].map((feature, idx) => (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      y: -10,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    className={`text-center p-8 rounded-3xl bg-gradient-to-br ${feature.color} border border-white shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer`}
                  >
                    <motion.div 
                      className="text-4xl mb-4"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        delay: idx * 0.5,
                        repeat: Infinity 
                      }}
                    >
                      {feature.emoji}
                    </motion.div>
                    
                    <motion.div 
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced CTA Section */}
          <motion.div 
            className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 py-24 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* Animated Background */}
            <div className="absolute inset-0">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 bg-white/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: Math.random() * 4,
                  }}
                />
              ))}
            </div>
            
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  duration: 1
                }}
              >
                <motion.div 
                  className="text-8xl mb-8"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎉
                </motion.div>
                
                <motion.h2 
                  className="text-5xl font-bold text-white mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Ready to Start Shopping?
                </motion.h2>
                
                <motion.p 
                  className="text-2xl text-orange-100 mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Create your account today and enjoy exclusive benefits & amazing deals!
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="bg-white text-red-600 px-12 py-5 rounded-full font-bold hover:bg-gray-100 transition duration-300 inline-flex items-center space-x-4 text-xl shadow-2xl"
                    >
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        🚀
                      </motion.span>
                      <span>Create Account</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="h-6 w-6" />
                      </motion.div>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
