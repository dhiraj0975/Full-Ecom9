import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, ArrowRight, ChevronDown } from 'lucide-react';
import CustomImageSwiper from '../components/common/CustomImageSwiper';
import ProductGrid from '../components/products/ProductGrid';
import { getAllProducts } from '../services/productService';
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

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const data = await getAllProducts();
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
          {/* Image Swiper below Header/CategoryBar */}
          <CustomImageSwiper images={images} height="h-56" />
          <div className="flex justify-center">
            <ChevronDown className="h-8 w-8 text-blue-400 mt-1 mb-2 animate-bounce" />
          </div>
          {/* Products Grid Section */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <ProductGrid products={products.slice(0, 10)} />
            )}
            <div className="text-center mt-6">
              <Link to="/products" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">View All Products</Link>
            </div>
          </div>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Welcome to CustomerStore
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100">
                  Your one-stop destination for all your shopping needs
                </p>
              </div>
            </div>
          </div>
          {/* Features Section */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Choose CustomerStore?
                </h2>
                <p className="text-lg text-gray-600">
                  We provide the best shopping experience for our customers
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Wide Selection
                  </h3>
                  <p className="text-gray-600">
                    Browse through thousands of products from top brands
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Secure Shopping
                  </h3>
                  <p className="text-gray-600">
                    Your data is protected with industry-standard security
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Fast Delivery
                  </h3>
                  <p className="text-gray-600">
                    Get your orders delivered quickly and safely
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* CTA Section */}
          <div className="bg-gray-50 py-16">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Shopping?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Create your account today and enjoy exclusive benefits
              </p>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 inline-flex items-center space-x-2"
              >
                <span>Create Account</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;