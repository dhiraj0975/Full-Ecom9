import React, { useState, useEffect } from 'react';
import { Gift, Lock, Info, CheckCircle, Circle } from 'lucide-react';
import { makePayment } from '../../services/paymentService';
import api from '../../api/axios'; // Use centralized API
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import RazorpayButton from "../../components/common/RazorpayButton";

const paymentMethods = [
  { label: 'Razorpay', value: 'upi', icon: <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-2" /> }, // Fixed typo
  { label: 'Credit / Debit / ATM Card', value: 'card', icon: <span className="inline-block w-3 h-3 rounded-full bg-blue-600 mr-2" /> },
  { label: 'Net Banking', value: 'netbanking', icon: <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2" /> },
  { label: 'Cash on Delivery', value: 'cod', icon: <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2" /> },
  { label: 'Gift Card', value: 'giftcard', icon: <span className="inline-block w-3 h-3 rounded-full bg-pink-400 mr-2" /> },
  { label: 'Wallet', value: 'wallet', icon: <span className="inline-block w-3 h-3 rounded-full bg-orange-400 mr-2" /> },
];


const PaymentPage = () => {
  const [selected, setSelected] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false); // Add processing state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setCartLoading(true);
      
      try {
        // Use centralized API instead of direct axios
        const cartRes = await api.get('/api/cart');
        console.log('🛒 Cart data received:', cartRes.data);
        
        let cartData = [];
        if (cartRes.data?.data && Array.isArray(cartRes.data.data)) {
          cartData = cartRes.data.data;
        } else if (Array.isArray(cartRes.data)) {
          cartData = cartRes.data;
        }
        
        setCart(cartData);
        
        // Ensure address is selected
        if (!localStorage.getItem('selected_address_id')) {
          try {
            const addressRes = await api.get('/api/addresses');
            const addresses = addressRes.data?.data || addressRes.data || [];
            
            if (addresses.length > 0) {
              localStorage.setItem('selected_address_id', addresses[0].id.toString());
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch addresses:', error);
          }
        }
        
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setCart([]);
      } finally {
        setCartLoading(false);
      }
    };

    fetchData();
  }, []);

  // Safe calculations
  const cartArray = Array.isArray(cart) ? cart : [];
  
  const safeReduce = (array, reducer, initialValue = 0) => {
    if (!Array.isArray(array) || array.length === 0) return initialValue;
    try {
      return array.reduce(reducer, initialValue);
    } catch (error) {
      console.error('Reduce error:', error);
      return initialValue;
    }
  };
  
  const total = cartLoading ? 0 : safeReduce(cartArray, (sum, item) => {
    const price = parseFloat(item?.price) || 0;
    const quantity = parseInt(item?.quantity) || 1;
    return sum + (price * quantity);
  }, 0);
  
  const totalItems = cartLoading ? 0 : safeReduce(cartArray, (sum, item) => {
    const quantity = parseInt(item?.quantity) || 1;
    return sum + quantity;
  }, 0);
  
  const deliveryFree = total > 999;
  const finalAmount = total - discount + (deliveryFree ? 0 : 49) + 4;

  const getCustomerId = () => {
    let customer_id = localStorage.getItem('customer_id');
    if (!customer_id) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          customer_id = user.id;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    return customer_id;
  };

  const handleApplyCoupon = () => {
    if (coupon.trim().toLowerCase() === 'save10') {
      setDiscount(Math.round(total * 0.1));
      setCouponApplied(true);
      setMessage('');
    } else {
      setDiscount(0);
      setCouponApplied(false);
      setMessage('Invalid coupon! Try SAVE10');
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    
    if (processing) return; // Prevent double submission
    
    if (!Array.isArray(cartArray) || cartArray.length === 0 || total <= 0) {
      setMessage('Cart is empty! Please add items to cart.');
      return;
    }

    const customer_id = getCustomerId();
    if (!customer_id) {
      setMessage('Please login first!');
      return;
    }

    setProcessing(true);
    setMessage('');

    try {
      console.log('🔄 Starting payment process...');

      // Step 1: Create Payment
      const paymentData = {
        customer_id: parseInt(customer_id),
        amount: finalAmount,
        payment_method: selected,
        payment_status: selected === 'cod' ? 'pending' : 'success',
        upi_id: selected === 'upi' ? upiId : undefined,
        card_last4: selected === 'card' ? card.number.slice(-4) : undefined,
        transaction_id: 'TXN' + Date.now(),
      };
      
      const paymentRes = await makePayment(paymentData);
      
      if (paymentRes.data.success) {
        // Step 2: Create Order
        const orderData = {
          customer_id: parseInt(customer_id),
          address_id: parseInt(localStorage.getItem('selected_address_id')) || 1,
          payment_id: paymentRes.data.payment_id,
          order_status: selected === 'cod' ? 'pending' : 'confirmed',
          total_amount: finalAmount,
          delivery_charge: deliveryFree ? 0 : 49,
          discount: discount,
          payment_method: selected,
          order_items: cartArray.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity || 1
          }))
        };
        
        const orderRes = await api.post('/api/orders', orderData); // Use centralized API
        
        if (orderRes.data.success) {
          // Step 3: Update Payment with order_id
          await api.put(`/api/payments/${paymentRes.data.payment_id}`, {
            order_id: orderRes.data.order_id
          });
          
          // Step 4: Create Order Items
          const orderItems = cartArray.map(item => ({
            order_id: orderRes.data.order_id,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            price: item.price
          }));

          const orderItemsRes = await api.post('/api/order-items', { items: orderItems });
          
          if (orderItemsRes.data.success) {
            // Step 5: Clear cart
            await api.delete('/api/cart/clear');
            window.dispatchEvent(new Event('cart-updated'));
            
            // Step 6: Show success and redirect
            await Swal.fire({
              title: '🎉 Order Placed Successfully!',
              text: `Your order #${orderRes.data.order_id} has been placed successfully. ${selected === 'cod' ? 'You will pay on delivery.' : 'Payment completed.'} You will receive updates via email.`,
              icon: 'success',
              confirmButtonColor: '#10B981',
              confirmButtonText: 'View My Orders',
              showCancelButton: true,
              cancelButtonText: 'Continue Shopping',
              cancelButtonColor: '#6B7280'
            }).then((result) => {
              window.dispatchEvent(new Event('order-placed'));
              
              if (result.isConfirmed) {
                navigate('/orders');
              } else {
                navigate('/products');
              }
            });
          } else {
            throw new Error('Order items creation failed');
          }
        } else {
          throw new Error('Order creation failed');
        }
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // Special handling for stock issues
        if (errorMessage.includes('Insufficient stock') || errorMessage.includes('failed to update product quantities')) {
          errorMessage = 'Some items in your cart are out of stock. Please update your cart and try again.';
        }
      }
      
      setMessage('Payment error: ' + errorMessage);
      
      Swal.fire({
        title: '❌ Payment Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Update Cart',
        showCancelButton: true,
        cancelButtonText: 'Try Again'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/cart'); // Redirect to cart to update quantities
        }
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRazorpaySuccess = async (response) => {
    if (processing) return; // Prevent double submission
    
    if (!Array.isArray(cartArray) || cartArray.length === 0 || total <= 0) {
      setMessage('Cart is empty! Please add items to cart.');
      return;
    }

    const customer_id = getCustomerId();
    if (!customer_id) {
      setMessage('Please login first!');
      return;
    }

    setProcessing(true);

    try {
      console.log('🔄 Starting Razorpay payment process...');

      // Create Payment record
      const paymentData = {
        customer_id: parseInt(customer_id),
        amount: finalAmount,
        payment_method: 'razorpay',
        payment_status: 'success',
        transaction_id: response.razorpay_payment_id,
        upi_id: selected === 'upi' ? upiId : undefined,
        card_last4: undefined,
      };
      
      const paymentRes = await makePayment(paymentData);

      if (paymentRes.data.success) {
        // Create Order
        const orderData = {
          customer_id: parseInt(customer_id),
          address_id: parseInt(localStorage.getItem('selected_address_id')) || 1,
          payment_id: paymentRes.data.payment_id,
          order_status: 'confirmed',
          total_amount: finalAmount,
          delivery_charge: deliveryFree ? 0 : 49,
          discount: discount,
          payment_method: 'razorpay',
          order_items: cartArray.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity || 1
          }))
        };
        
        const orderRes = await api.post('/api/orders', orderData);
        
        if (orderRes.data.success) {
          // Update Payment with order_id
          await api.put(`/api/payments/${paymentRes.data.payment_id}`, {
            order_id: orderRes.data.order_id
          });
          
          // Create Order Items
          const orderItems = cartArray.map(item => ({
            order_id: orderRes.data.order_id,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            price: item.price
          }));

          const orderItemsRes = await api.post('/api/order-items', { items: orderItems });
          
          if (orderItemsRes.data.success) {
            // Clear cart
            await api.delete('/api/cart/clear');
            window.dispatchEvent(new Event('cart-updated'));
            
            // Success notification
            await Swal.fire({
              title: '🎉 Payment Successful!',
              text: `Your order #${orderRes.data.order_id} has been placed and paid successfully! You will receive updates via email.`,
              icon: 'success',
              confirmButtonColor: '#10B981',
              confirmButtonText: 'View My Orders',
              showCancelButton: true,
              cancelButtonText: 'Continue Shopping',
              cancelButtonColor: '#6B7280'
            }).then((result) => {
              window.dispatchEvent(new Event('order-placed'));
              
              if (result.isConfirmed) {
                navigate('/orders');
              } else {
                navigate('/products');
              }
            });
          } else {
            throw new Error('Order items creation failed');
          }
        } else {
          throw new Error('Order creation failed');
        }
      } else {
        throw new Error('Payment record creation failed');
      }
    } catch (err) {
      console.error('❌ Razorpay order error:', err);
      setMessage('Order error: ' + (err.response?.data?.message || err.message));
      
      Swal.fire({
        title: '❌ Order Failed',
        text: err.response?.data?.message || err.message || 'Something went wrong after payment. Please contact support.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Contact Support'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen py-4 sm:py-6 lg:py-8 px-2">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-blue-100">
        {/* Left: Payment Methods */}
        <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 lg:mb-8">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 text-lg sm:text-xl font-bold transition-colors">&#8592;</button>
            <span className="font-bold text-sm sm:text-base lg:text-lg tracking-tight">Complete Payment</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-gray-500 font-semibold"><Lock size={14} />100% Secure</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
            {paymentMethods.map(method => (
              <button
                key={method.value}
                className={`flex items-center w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl border-2 transition font-semibold text-left group text-xs sm:text-sm ${selected === method.value ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-600 text-blue-700 shadow-lg' : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-400'}`}
                onClick={() => setSelected(method.value)}
                disabled={['netbanking', 'giftcard', 'wallet'].includes(method.value) || processing}
              >
                {selected === method.value ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-300 group-hover:text-blue-400" />}
                {method.icon}
                <span className="flex-1">{method.label}</span>
                {['netbanking', 'giftcard', 'wallet'].includes(method.value) && <span className="ml-auto text-xs text-gray-400">Unavailable</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Payment Form */}
        <div className="lg:w-1/3 p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[480px] border-b lg:border-b-0 lg:border-r bg-gradient-to-b from-white to-blue-50">
          {selected === 'upi' && (
            <div className="w-full max-w-xs animate-fadeIn">
              <div className="mb-4 sm:mb-6">
                <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base lg:text-lg">
                  Add new UPI ID <span className="ml-1 text-xs text-blue-500 cursor-pointer">How to find?</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full border-2 border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base lg:text-lg transition"
                    placeholder="Enter your UPI ID"
                    required
                    disabled={processing}
                  />
                  <button type="button" className="absolute right-2 top-2 bg-blue-600 text-white px-2 sm:px-3 py-1 rounded font-bold text-xs sm:text-sm disabled:opacity-50" disabled={processing}>Verify</button>
                </div>
              </div>
              <RazorpayButton
                amount={finalAmount}
                onSuccess={handleRazorpaySuccess}
                buttonText={`Pay ₹${finalAmount.toFixed(2)} with Razorpay`}
                disabled={processing}
              />
              <div className="flex items-center justify-center mt-2 text-xs text-gray-500 gap-1">
                <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Secured by <span className="font-semibold text-blue-600">Razorpay</span></span>
              </div>
            </div>
          )}

          {selected === 'card' && (
            <form className="w-full max-w-xs animate-fadeIn" onSubmit={handlePay}>
              <div className="mb-3 sm:mb-4">
                <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base lg:text-lg">Card Number</label>
                <input
                  type="text"
                  value={card.number}
                  onChange={e => setCard({ ...card, number: e.target.value })}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base lg:text-lg transition"
                  placeholder="1234 5678 9012 3456"
                  required
                  disabled={processing}
                />
              </div>
              <div className="mb-3 sm:mb-4">
                <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base lg:text-lg">Name on Card</label>
                <input
                  type="text"
                  value={card.name}
                  onChange={e => setCard({ ...card, name: e.target.value })}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base lg:text-lg transition"
                  placeholder="Full Name"
                  required
                  disabled={processing}
                />
              </div>
              <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base lg:text-lg">Expiry</label>
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={e => setCard({ ...card, expiry: e.target.value })}
                    className="w-full border-2 border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base lg:text-lg transition"
                    placeholder="MM/YY"
                    required
                    disabled={processing}
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base lg:text-lg">CVV</label>
                  <input
                    type="password"
                    value={card.cvv}
                    onChange={e => setCard({ ...card, cvv: e.target.value })}
                    className="w-full border-2 border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base lg:text-lg transition"
                    placeholder="123"
                    required
                    disabled={processing}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base lg:text-lg mt-2 shadow-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={processing}>
                {processing ? 'Processing...' : `Pay ₹${finalAmount.toFixed(2)}`}
              </button>
            </form>
          )}

          {selected === 'cod' && (
            <div className="w-full max-w-xs flex flex-col items-center justify-center animate-fadeIn">
              <div className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Cash on Delivery</div>
              <button onClick={handlePay} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base lg:text-lg mt-2 shadow-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={processing}>
                {processing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          )}

          {['netbanking', 'giftcard', 'wallet'].includes(selected) && (
            <div className="w-full max-w-xs text-center text-gray-400 text-sm sm:text-base lg:text-lg font-semibold mt-6 sm:mt-8 lg:mt-10 animate-fadeIn">
              This payment method is currently unavailable.
            </div>
          )}

          {message && <div className="mt-4 sm:mt-6 lg:mt-8 text-center text-blue-700 font-semibold animate-fadeIn text-xs sm:text-sm">{message}</div>}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-1/3 p-4 sm:p-6 lg:p-10 bg-gradient-to-b from-white to-blue-50 flex flex-col gap-3 sm:gap-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8 mb-2 border border-blue-100">
            {cartLoading ? (
              <div className="animate-pulse">
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 sm:h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-2 text-gray-700 text-xs sm:text-sm">
                  <span>Price <span className="text-xs text-gray-400">({totalItems} item{totalItems > 1 ? 's' : ''})</span></span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600 text-xs sm:text-sm">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2 text-gray-700 text-xs sm:text-sm">
                  <span>Delivery</span>
                  <span>{deliveryFree ? <span className="text-green-600 font-bold">FREE</span> : '₹49'}</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-700 text-xs sm:text-sm">
                  <span className="flex items-center gap-1">Platform fee <Info size={12} className="text-blue-400" /></span>
                  <span>₹4</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-900 font-bold text-sm sm:text-base lg:text-lg border-t pt-3 sm:pt-4">
                  <span>Total Amount</span>
                  <span>₹{finalAmount.toFixed(2)}</span>
                </div>
                <div className="mt-3 sm:mt-4 text-green-700 font-semibold text-xs sm:text-sm bg-green-50 rounded p-2 flex items-center gap-2">
                  <Gift size={14} /> 
                  <span>5% Cashback</span>
                  <span className="ml-2 text-green-600 font-normal">Claim now with payment offers</span>
                </div>
              </>
            )}
          </div>

          {/* Coupon Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-blue-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">Apply Coupon</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all font-medium text-xs sm:text-sm"
                disabled={couponApplied || processing}
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-xs sm:text-sm"
                disabled={couponApplied || processing}
              >
                {couponApplied ? '✅' : 'Apply'}
              </button>
            </div>
            {couponApplied && (
              <div className="text-green-600 text-xs sm:text-sm font-semibold bg-green-50 p-2 rounded">
                ✅ Coupon applied successfully!
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow">
            <CheckCircle className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-green-700 text-xs sm:text-sm">100% Buyer Protection</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(.4,2,.6,1); }
      `}</style>
    </div>
  );
};

export default PaymentPage; 
