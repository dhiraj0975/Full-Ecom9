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
  <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-3">
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
    const result = await Swal.fire({
      title: 'Remove Item?',
      text: 'Remove this product from cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove',
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
      
      // Show success notification with SweetAlert instead of toast
      await Swal.fire({
        title: 'Removed!',
        text: 'Product has been removed from cart.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (err) {
      // Show error notification with SweetAlert
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to remove item from cart',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
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

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[35vh] text-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <EmptyCartSVG />
        <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-4 text-sm">Add some products to get started.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded font-medium shadow hover:scale-105 transition text-sm"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-6xl mx-auto px-2 py-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" /> Cart ({totalItems})
          </h2>
          <ul className="space-y-3">
            <AnimatePresence>
            {Array.isArray(cart) && cart.map(item => {
              let stockStatus = '';
              let stockClass = '';
              if (item.product_quantity === 0) {
                stockStatus = 'Out of Stock';
                stockClass = 'text-red-500';
              } else if (item.product_quantity <= 5) {
                stockStatus = `${item.product_quantity} left`;
                stockClass = 'text-orange-500';
              } else {
                stockStatus = 'In Stock';
                stockClass = 'text-green-600';
              }
              return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center bg-white rounded-lg shadow-sm p-3 gap-3 border hover:shadow-md transition-shadow relative"
                  >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 transition"
                    title="Remove"
                    disabled={removingId === item.id}
                  >
                    {removingId === item.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                  </button>
                  
                  {/* Product Image */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border bg-gray-50">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <h3 className="font-medium text-sm text-gray-900 truncate">{item.name}</h3>
                        {item.category_name && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                            {item.category_name}
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-semibold text-sm text-blue-700">₹{item.price}</span>
                          <span className="text-gray-400 line-through text-xs">₹{item.mrp || (item.price * 1.2).toFixed(0)}</span>
                          <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-xs">
                            {Math.round(100 - (item.price / (item.mrp || (item.price * 1.2)) * 100))}% off
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${stockClass}`}>{stockStatus}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 text-xs">Free Returns</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-sm text-gray-900">₹{(item.price * (item.quantity || 1)).toFixed(0)}</div>
                        <div className="text-xs text-gray-500">Subtotal</div>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQty(item.id, 'dec')}
                        className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                        disabled={qtyUpdatingId === item.id || item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {qtyUpdatingId === item.id ? '...' : (item.quantity || 1)}
                      </span>
                      <button
                        onClick={() => handleQty(item.id, 'inc')}
                        className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                        disabled={qtyUpdatingId === item.id || item.quantity >= item.product_quantity}
                      >
                        <Plus size={12} />
                      </button>
                      {item.quantity >= item.product_quantity && (
                        <span className="text-xs text-red-500 ml-1">Max</span>
                      )}
                    </div>
                  </div>
                  </motion.li>
              );
            })}
            </AnimatePresence>
          </ul>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1 sticky top-20 self-start">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-4 border"
          >
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <Gift size={16} className="text-pink-500" /> Order Summary
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items ({totalItems})</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>MRP</span>
                <span className="line-through text-gray-500">₹{mrp.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{(mrp - total + discount).toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryFree ? <span className="text-green-600 font-medium">Free</span> : '₹49'}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₹{(total - discount + (deliveryFree ? 0 : 49)).toFixed(0)}</span>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
              <Truck size={12} />
              <span>Delivery by {estDelivery}</span>
            </div>
            
            {deliveryFree && (
              <div className="mt-2">
                <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-medium">Free Shipping</span>
              </div>
            )}
            
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Coupon code"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                className="flex-1 px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={couponApplied}
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
                disabled={couponApplied}
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
            
            <button
              onClick={() => navigate('/address')}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-600 text-white py-2.5 rounded-lg font-medium text-sm shadow hover:from-pink-600 hover:to-blue-700 transition mt-3"
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
