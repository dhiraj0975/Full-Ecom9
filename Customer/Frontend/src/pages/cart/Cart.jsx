import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart, updateCartQuantity } from '../../api/cartApi';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingCart, Trash2, Loader2, Tag, Truck, Gift } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import CheckoutStepper from '../../components/common/CheckoutStepper';
import { motion, AnimatePresence } from 'framer-motion';

const EmptyCartSVG = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
    <rect x="10" y="40" width="100" height="60" rx="12" fill="#f3f4f6" />
    <rect x="25" y="55" width="70" height="30" rx="6" fill="#e0e7ef" />
    <circle cx="40" cy="90" r="6" fill="#cbd5e1" />
    <circle cx="80" cy="90" r="6" fill="#cbd5e1" />
    <rect x="50" y="30" width="20" height="20" rx="4" fill="#e0e7ef" />
    <rect x="55" y="20" width="10" height="10" rx="2" fill="#fbbf24" />
  </svg>
);

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const isLoggedIn = !!(localStorage.getItem('token') || document.cookie.match(/(^| )token=([^;]+)/));
  const [removingId, setRemovingId] = useState(null);
  const [qtyUpdatingId, setQtyUpdatingId] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    getCart().then(res => setCart(res.data));
    const onCartUpdate = () => getCart().then(res => setCart(res.data));
    window.addEventListener('cart-updated', onCartUpdate);
    return () => window.removeEventListener('cart-updated', onCartUpdate);
  }, [isLoggedIn, navigate]);

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const mrp = cart.reduce((sum, item) => sum + ((item.mrp || item.price) * (item.quantity || 1)), 0);
  const deliveryFree = total > 999;
  const estDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const handleRemove = async (id) => {
    // SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to remove this product from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: { popup: 'swal2-center' }
    });
    if (!result.isConfirmed) return;
    setRemovingId(id);
    try {
      await removeFromCart(id);
      setCart(cart.filter(item => item.id !== id));
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Product removed from cart!', { position: 'top-center' });
    } catch (err) {
      alert('Failed to remove item from cart');
    } finally {
      setRemovingId(null);
    }
  };
  const handleQty = async (id, type) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, (item.quantity || 1) + (type === 'inc' ? 1 : -1));
    setQtyUpdatingId(id);
    try {
      await updateCartQuantity(id, newQty);
      setCart(cart => cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      alert('Failed to update quantity');
    } finally {
      setQtyUpdatingId(null);
    }
  };
  const handleApplyCoupon = () => {
    if (coupon.trim().toLowerCase() === 'save10') {
      setDiscount(Math.round(total * 0.1));
      setCouponApplied(true);
    } else {
      setDiscount(0);
      setCouponApplied(false);
      alert('Invalid coupon! Try SAVE10');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center bg-gradient-to-br from-blue-50 to-purple-50 px-2 sm:px-4">
        <EmptyCartSVG />
        <h2 className="text-xl sm:text-2xl font-bold mb-1">Your cart is empty</h2>
        <p className="text-gray-500 mb-4 text-sm sm:text-base">Looks like you haven't added anything yet.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded font-semibold shadow hover:scale-105 transition text-sm sm:text-base"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-7xl mx-auto px-1 sm:px-3 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 sm:h-9 sm:w-8 text-blue-600" /> Your Cart
          </h2>
          <ul className="space-y-4 sm:space-y-6">
            <AnimatePresence>
            {cart.map(item => {
              let stockStatus = '';
              let stockClass = '';
              if (item.product_quantity === 0) {
                stockStatus = 'Out of Stock';
                stockClass = 'text-red-500';
              } else if (item.product_quantity <= 5) {
                stockStatus = `Only ${item.product_quantity} left!`;
                stockClass = 'text-yellow-600';
              } else {
                stockStatus = 'In Stock';
                stockClass = 'text-green-600';
              }
              return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ type: 'spring', duration: 0.4 }}
                    className="group flex flex-col sm:flex-row items-center bg-white/60 backdrop-blur-lg rounded-xl shadow p-3 sm:p-4 gap-4 sm:gap-6 border border-blue-100 hover:shadow-blue-200 hover:scale-[1.01] transition-all relative overflow-hidden"
                  >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1 rounded-full transition z-10"
                    title="Remove from cart"
                    disabled={removingId === item.id}
                  >
                    {removingId === item.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  </button>
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow group-hover:scale-105 group-hover:shadow-md transition-transform bg-white flex items-center justify-center mb-2 sm:mb-0">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {/* Product Info */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1 sm:gap-2">
                      <div>
                        <div className="font-semibold text-base sm:text-lg mb-0 flex items-center gap-2 flex-wrap">
                          {item.name}
                          {item.category_name && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-semibold flex items-center gap-1">
                              <Tag size={12} /> {item.category_name}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs sm:text-sm mb-1">Brand: <span className="font-medium text-gray-800">BrandX</span></div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-base sm:text-lg font-bold text-blue-700">₹{item.price}</span>
                          <span className="text-gray-400 line-through text-xs sm:text-sm">₹{item.mrp || (item.price * 1.2).toFixed(0)}</span>
                          <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-semibold">{Math.round(100 - (item.price / (item.mrp || (item.price * 1.2)) * 100))}% off</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-semibold text-xs ${stockClass}`}>{stockStatus}</span>
                          <span className="text-gray-400 text-xs">|</span>
                          <span className="text-gray-500 text-xs">Free Returns</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={() => handleQty(item.id, 'dec')}
                            className="p-0.5 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            aria-label="Decrease quantity"
                            disabled={qtyUpdatingId === item.id || item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={item.product_quantity}
                            value={qtyUpdatingId === item.id ? '' : (item.quantity || 1)}
                            onChange={e => {
                              const val = Math.max(1, Math.min(item.product_quantity, Number(e.target.value)));
                              handleQty(item.id, null, val);
                            }}
                            className="w-12 px-1 py-0.5 border rounded text-base text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={qtyUpdatingId === item.id}
                          />
                          <button
                            onClick={() => handleQty(item.id, 'inc')}
                            className="p-0.5 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            aria-label="Increase quantity"
                            disabled={qtyUpdatingId === item.id || item.quantity >= item.product_quantity}
                          >
                            <Plus size={14} />
                          </button>
                          {item.quantity >= item.product_quantity && (
                            <span className="text-xs text-red-500 ml-1">Max stock</span>
                          )}
                          {qtyUpdatingId === item.id && <Loader2 className="animate-spin ml-1 text-blue-500" size={14} />}
                        </div>
                      </div>
                      <div className="flex flex-col items-end mt-2 sm:mt-0">
                        <div className="text-base sm:text-lg font-bold text-blue-600">₹{(item.price * (item.quantity || 1)).toFixed(2)}</div>
                        <span className="text-xs text-gray-400">Subtotal</span>
                      </div>
                    </div>
                  </div>
                  </motion.li>
              );
            })}
            </AnimatePresence>
          </ul>
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-1 w-full lg:w-auto sticky top-20 self-start mt-6 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white/70 backdrop-blur-lg rounded-xl shadow p-4 border-2 border-transparent bg-clip-padding w-full max-w-md mx-auto lg:mx-0"
            style={{ borderImage: 'linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%) 1' }}
          >
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 flex items-center gap-2"><Gift size={16} className="text-pink-400" /> Order Summary</h3>
            <div className="flex justify-between mb-1 text-gray-700 text-sm sm:text-base">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between mb-1 text-gray-700 text-sm sm:text-base">
              <span>MRP</span>
              <span className="line-through">₹{mrp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1 text-gray-700 text-sm sm:text-base">
              <span>Discount</span>
              <span className="text-green-600">-₹{(mrp - total + discount).toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-1 text-green-700 font-semibold text-sm sm:text-base">
                <span>Coupon Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between mb-1 text-gray-700 text-sm sm:text-base">
              <span>Delivery</span>
              <span>{deliveryFree ? <span className="text-green-600 font-bold">Free</span> : '₹49'}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-900 font-bold text-base sm:text-lg border-t pt-2">
              <span>Total</span>
              <span>₹{(total - discount + (deliveryFree ? 0 : 49)).toFixed(2)}</span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Truck size={14} className="text-blue-500" />
              <span className="text-xs sm:text-sm text-gray-500">Estimated Delivery: <span className="font-semibold text-gray-700">{estDelivery}</span></span>
            </div>
            {deliveryFree && (
              <div className="mb-2 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-semibold">Free Shipping</span>
              </div>
            )}
            <div className="flex gap-1 mb-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                disabled={couponApplied}
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded font-semibold shadow hover:scale-105 transition text-sm sm:text-base disabled:opacity-50"
                disabled={couponApplied}
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
            <button
              onClick={() => navigate('/address')}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-600 text-white py-2 rounded-lg font-bold text-base sm:text-lg shadow-md hover:from-pink-600 hover:to-blue-700 transition mt-1"
            >
              Proceed to Checkout
            </button>
          </motion.div>
        </div>
      </div>
      <CheckoutStepper />
    </>
  );
};

export default Cart; 