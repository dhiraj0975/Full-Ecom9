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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-gradient-to-br from-blue-50 to-purple-50">
        <EmptyCartSVG />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-7xl mx-auto px-2 md:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <ShoppingCart className="h-9 w-8 text-blue-600" /> Your Cart
          </h2>
          <ul className="space-y-8">
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
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.9 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="group flex flex-col md:flex-row items-center bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 gap-8 border border-blue-100 hover:shadow-blue-300 hover:scale-[1.02] transition-all relative overflow-hidden"
                  >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 p-2 rounded-full transition z-10"
                    title="Remove from cart"
                    disabled={removingId === item.id}
                  >
                    {removingId === item.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                  </button>
                  {/* Product Image */}
                  <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow group-hover:scale-105 group-hover:shadow-lg transition-transform bg-white flex items-center justify-center">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  {/* Product Info */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
                      <div>
                        <div className="font-semibold text-lg md:text-xl mb-1 flex items-center gap-2">
                          {item.name}
                          {item.category_name && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-semibold flex items-center gap-1">
                              <Tag size={14} /> {item.category_name}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-sm mb-2">Brand: <span className="font-medium text-gray-800">BrandX</span></div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-bold text-blue-700">₹{item.price}</span>
                          <span className="text-gray-400 line-through">₹{item.mrp || (item.price * 1.2).toFixed(0)}</span>
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">{Math.round(100 - (item.price / (item.mrp || (item.price * 1.2)) * 100))}% off</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-semibold ${stockClass}`}>{stockStatus}</span>
                          <span className="text-gray-400 text-xs">|</span>
                          <span className="text-gray-500 text-xs">Free Returns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQty(item.id, 'dec')}
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            aria-label="Decrease quantity"
                            disabled={qtyUpdatingId === item.id || item.quantity <= 1}
                          >
                            <Minus size={18} />
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
                            className="w-16 px-2 py-1 border rounded text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={qtyUpdatingId === item.id}
                          />
                          <button
                            onClick={() => handleQty(item.id, 'inc')}
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            aria-label="Increase quantity"
                            disabled={qtyUpdatingId === item.id || item.quantity >= item.product_quantity}
                          >
                            <Plus size={18} />
                          </button>
                          {item.quantity >= item.product_quantity && (
                            <span className="text-xs text-red-500 ml-2">Max available stock</span>
                          )}
                          {qtyUpdatingId === item.id && <Loader2 className="animate-spin ml-2 text-blue-500" size={18} />}
                        </div>
                      </div>
                      <div className="flex flex-col items-end mt-4 md:mt-0">
                        <div className="text-lg font-bold text-blue-600">₹{(item.price * (item.quantity || 1)).toFixed(2)}</div>
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
        <div className="md:col-span-1 sticky top-24 self-start">
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-transparent bg-clip-padding"
            style={{ borderImage: 'linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%) 1' }}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2"><Gift size={20} className="text-pink-400" /> Order Summary</h3>
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-700">
              <span>MRP</span>
              <span className="line-through">₹{mrp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Discount</span>
              <span className="text-green-600">-₹{(mrp - total + discount).toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-2 text-green-700 font-semibold">
                <span>Coupon Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Delivery</span>
              <span>{deliveryFree ? <span className="text-green-600 font-bold">Free</span> : '₹49'}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-900 font-bold text-lg border-t pt-4">
              <span>Total</span>
              <span>₹{(total - discount + (deliveryFree ? 0 : 49)).toFixed(2)}</span>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <Truck size={18} className="text-blue-500" />
              <span className="text-sm text-gray-500">Estimated Delivery: <span className="font-semibold text-gray-700">{estDelivery}</span></span>
            </div>
            {deliveryFree && (
              <div className="mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Free Shipping</span>
              </div>
            )}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Coupon code"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={couponApplied}
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded font-semibold shadow hover:scale-105 transition disabled:opacity-50"
                disabled={couponApplied}
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
            <button
              onClick={() => navigate('/address')}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-600 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:from-pink-600 hover:to-blue-700 transition mt-2"
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