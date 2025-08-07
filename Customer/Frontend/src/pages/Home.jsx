import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, ArrowRight, ChevronDown } from 'lucide-react';
import CustomImageSwiper from '../components/common/CustomImageSwiper';
import ProductGrid from '../components/products/ProductGrid';
import { getProducts } from '../services/productService';
import { motion } from 'framer-motion';

const images = [
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/2ad9256d47bff7ca.jpg?q=60',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/5738158f6f0d7209.jpg?q=60',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/14eb0fb178248c58.jpg?q=60',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/74f0ad81e44e6e6f.jpg?q=60',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/85964c6ee5076f5d.jpg?q=60',
  'https://images.meesho.com/images/marketing/1746425994914.webp',
  'https://rukminim1.flixcart.com/fk-p-flap/3240/540/image/fb28e3e1d22e6da2.jpg?q=60',
];

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.3 } }
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
          {/* Welcome Banner for Logged-in Users */}
          {currentUser && (
            <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white py-3 px-4 mx-2 mt-2 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold">Welcome back, {currentUser.name}! 👋</h2>
                  <p className="text-xs sm:text-sm text-blue-100">Ready to discover amazing products?</p>
                </div>
                <div className="hidden sm:block text-2xl">🛍️</div>
              </div>
            </div>
          )}

          {/* Image Swiper */}
          <div className="mt-4">
            <CustomImageSwiper images={images} height="h-64" />
          </div>
          
          {/* Animated Scroll Indicator */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="h-8 w-8 text-blue-500 mt-2 mb-4" />
            </motion.div>
          </div>

          {/* Quick Stats */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center border border-blue-200">
                <div className="text-lg mb-1">🚚</div>
                <div className="text-xs font-bold text-blue-700">Free Delivery</div>
                <div className="text-xs text-blue-600">On orders above ₹500</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl text-center border border-green-200">
                <div className="text-lg mb-1">🔒</div>
                <div className="text-xs font-bold text-green-700">Secure Payment</div>
                <div className="text-xs text-green-600">100% Safe & Secure</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center border border-purple-200">
                <div className="text-lg mb-1">⚡</div>
                <div className="text-xs font-bold text-purple-700">Fast Delivery</div>
                <div className="text-xs text-purple-600">Same day delivery</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl text-center border border-orange-200">
                <div className="text-lg mb-1">🎁</div>
                <div className="text-xs font-bold text-orange-700">Best Offers</div>
                <div className="text-xs text-orange-600">Daily deals & discounts</div>
              </div>
            </div>
          </div>

          {/* Featured Products Section */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <motion.h2 
                className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                ✨ Featured Products ✨
              </motion.h2>
              <p className="text-gray-600">Discover our handpicked collection of amazing products</p>
            </div>
            
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading amazing products...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <ProductGrid products={products.slice(0, 8)} />
              </motion.div>
            )}
            
            <div className="text-center mt-8">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>View All Products</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Hero Section - Enhanced */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <motion.h1 
                  className="text-4xl md:text-7xl font-bold mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  Welcome to <span className="text-yellow-300">CustomerStore</span>
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl mb-8 text-blue-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Your one-stop destination for all your shopping needs 🛒
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl text-lg"
                  >
                    <ShoppingBag className="h-6 w-6" />
                    <span>Start Shopping Now</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Enhanced Features Section */}
          <div className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  Why Choose CustomerStore? 🌟
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  We provide the best shopping experience for our customers
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <ShoppingBag className="h-8 w-8 text-blue-600" />,
                    title: "Wide Selection",
                    desc: "Browse through thousands of products from top brands",
                    color: "from-blue-100 to-blue-200",
                    emoji: "🛍️"
                  },
                  {
                    icon: <User className="h-8 w-8 text-green-600" />,
                    title: "Secure Shopping",
                    desc: "Your data is protected with industry-standard security",
                    color: "from-green-100 to-green-200",
                    emoji: "🔐"
                  },
                  {
                    icon: <ArrowRight className="h-8 w-8 text-purple-600" />,
                    title: "Fast Delivery",
                    desc: "Get your orders delivered quickly and safely",
                    color: "from-purple-100 to-purple-200",
                    emoji: "⚡"
                  }
                ].map((feature, idx) => (
                  <motion.div
                    key={feature.title}
                    className={`text-center p-6 rounded-2xl bg-gradient-to-br ${feature.color} border border-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.2 }}
                  >
                    <div className="text-2xl mb-3">{feature.emoji}</div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {feature.icon}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 py-20">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Ready to Start Shopping?
                </h2>
                <p className="text-xl text-orange-100 mb-10">
                  Create your account today and enjoy exclusive benefits & amazing deals!
                </p>
                <Link
                  to="/register"
                  className="bg-white text-red-600 px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition duration-200 inline-flex items-center space-x-3 text-lg shadow-2xl transform hover:scale-105"
                >
                  <span>🚀 Create Account</span>
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
