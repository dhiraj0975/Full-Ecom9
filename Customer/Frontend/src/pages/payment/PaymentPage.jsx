import React, { useState, useEffect } from 'react';
import { Gift, Lock, Info, CheckCircle, Circle } from 'lucide-react';
import { makePayment } from '../../services/paymentService';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import RazorpayButton from "../../components/common/RazorpayButton";
// import { SiVisa, SiMastercard, SiPaytm, SiGooglepay, SiPhonepe } from 'react-icons/si';
// import { FaUniversity, FaMoneyBillWave, FaGift } from 'react-icons/fa';

const UPIIcon = () => (
  <span className="font-bold text-green-700 text-lg mr-2">UPI</span>
);

const paymentMethods = [
  { label: 'Rezorpaay', value: 'upi', icon: <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-2" /> },
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
  const navigate = useNavigate();

  useEffect(() => {
    // Use the configured API base URL
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    // Debug environment variable
    console.log('🔧 Environment check:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      apiUrl: apiUrl,
      hasApiUrl: !!apiUrl
    });
    
    if (!apiUrl) {
      console.error('❌ VITE_API_URL is not set!');
      setCart([]);
      setCartLoading(false);
      return;
    }
    
    // Fetch cart with proper error handling
    setCartLoading(true);
    
    const fetchCart = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/cart`, { 
          withCredentials: true 
        });
        
        console.log('🛒 Cart data received:', res.data);
        
        // Better error handling and data validation
        let cartData = [];
        
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          cartData = res.data.data; // New format
        } else if (Array.isArray(res.data)) {
          cartData = res.data; // Old format
        } else if (res.data && Array.isArray(res.data)) {
          cartData = res.data; // Direct array
        } else {
          console.log('⚠️ Invalid cart data format, setting empty array');
          cartData = [];
        }
        
        console.log('🛒 Final cart data:', cartData);
        setCart(cartData);
        setCartLoading(false);
      } catch (error) {
        console.error('❌ Error fetching cart:', error);
        setCart([]);
        setCartLoading(false);
      }
    };
    
    fetchCart();
    
    // Ensure selected_address_id is set
    const fetchAddresses = async () => {
      if (!localStorage.getItem('selected_address_id')) {
        try {
          const res = await axios.get(`${apiUrl}/api/addresses`, { 
            withCredentials: true 
          });
          
          console.log('🏠 Address data received:', res.data);
          
          // Handle different response formats
          let addressData = [];
          if (res.data && res.data.data && Array.isArray(res.data.data)) {
            addressData = res.data.data; // New format
          } else if (Array.isArray(res.data)) {
            addressData = res.data; // Old format
          }
          
          if (addressData.length > 0) {
            localStorage.setItem('selected_address_id', addressData[0].id);
            console.log('🏠 Selected address ID:', addressData[0].id);
          } else {
            console.log('⚠️ No addresses found');
          }
        } catch (error) {
          console.error('❌ Error fetching addresses:', error);
        }
      }
    };
    
    fetchAddresses();
  }, []);

  // Ensure cart is always an array with proper validation
  const cartArray = Array.isArray(cart) ? cart : [];
  
  // Safe reduce functions with multiple checks
  const safeReduce = (array, reducer, initialValue = 0) => {
    if (!Array.isArray(array) || array.length === 0) return initialValue;
    try {
      return array.reduce(reducer, initialValue);
    } catch (error) {
      console.error('Reduce error:', error);
      return initialValue;
    }
  };
  
  // Add safety checks for reduce operations with loading state
  const total = cartLoading ? 0 : safeReduce(cartArray, (sum, item) => {
    const price = parseFloat(item?.price) || 0;
    const quantity = parseInt(item?.quantity) || 1;
    return sum + (price * quantity);
  }, 0);
  
  const totalItems = cartLoading ? 0 : safeReduce(cartArray, (sum, item) => {
    const quantity = parseInt(item?.quantity) || 1;
    return sum + quantity;
  }, 0);
  
  const mrp = cartLoading ? 0 : safeReduce(cartArray, (sum, item) => {
    const price = parseFloat(item?.mrp || item?.price) || 0;
    const quantity = parseInt(item?.quantity) || 1;
    return sum + (price * quantity);
  }, 0);
  const deliveryFree = total > 999;
  const estDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const handleApplyCoupon = () => {
    if (coupon.trim().toLowerCase() === 'save10') {
      setDiscount(Math.round(total * 0.1));
      setCouponApplied(true);
    } else {
      setDiscount(0);
      setCouponApplied(false);
      setMessage('Invalid coupon! Try SAVE10');
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    
    // Extra safety checks
    if (!Array.isArray(cartArray) || cartArray.length === 0 || total <= 0) {
      setMessage('Cart is empty! Please add items to cart.');
      return;
    }

    try {
      // Get customer_id from localStorage or user object
      let customer_id = localStorage.getItem('customer_id');
      if (!customer_id) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          customer_id = user.id;
        }
      }
      
      if (!customer_id) {
        setMessage('Please login first!');
        return;
      }

      console.log('🔄 Starting payment process for COD...');

      // Step 1: Create Payment
      const paymentData = {
        customer_id: parseInt(customer_id),
        amount: total - discount + (deliveryFree ? 0 : 49) + 4,
        payment_method: selected,
        payment_status: selected === 'cod' ? 'pending' : 'success',
        upi_id: selected === 'upi' ? upiId : undefined,
        card_last4: selected === 'card' ? card.number.slice(-4) : undefined,
        transaction_id: 'TXN' + Date.now(),
      };
      
      console.log('💳 Creating payment record:', paymentData);
      const paymentRes = await makePayment(paymentData);
      console.log('✅ Payment created:', paymentRes.data);
      
      if (paymentRes.data.success) {
        // Step 2: Create Order
        const address_id = localStorage.getItem('selected_address_id');
        const orderData = {
          customer_id: parseInt(customer_id),
          address_id: address_id ? parseInt(address_id) : 1,
          payment_id: paymentRes.data.payment_id,
          order_status: selected === 'cod' ? 'pending' : 'confirmed',
          total_amount: total - discount + (deliveryFree ? 0 : 49) + 4,
          delivery_charge: deliveryFree ? 0 : 49,
          discount: discount,
          payment_method: selected,
          order_items: cartArray.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity || 1
          }))
        };
        
        console.log('📦 Creating order:', orderData);
        const orderRes = await axios.post('/api/orders', orderData, { withCredentials: true });
        console.log('✅ Order created:', orderRes.data);
        
        if (orderRes.data.success) {
          // Step 3: Update Payment with order_id
          console.log('🔗 Linking payment to order...');
          await axios.put(`/api/payments/${paymentRes.data.payment_id}`, {
            order_id: orderRes.data.order_id
          }, { withCredentials: true });
          
          // Step 4: Create Order Items
          const orderItems = cartArray.map(item => ({
            order_id: orderRes.data.order_id,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            price: item.price
          }));

          console.log('📋 Creating order items:', orderItems);
          const orderItemsRes = await axios.post('/api/order-items', { items: orderItems }, { withCredentials: true });
          console.log('✅ Order items created:', orderItemsRes.data);
          
          if (orderItemsRes.data.success) {
            // Step 5: Clear cart
            console.log('🛒 Clearing cart...');
            await axios.delete('/api/cart/clear', { withCredentials: true });
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
              // Trigger order update event
              window.dispatchEvent(new Event('order-placed'));
              
              if (result.isConfirmed) {
                navigate('/orders');
              } else {
                navigate('/products');
              }
            });
          } else {
            setMessage('❌ Order items creation failed! Please contact support.');
            console.error('Order items creation failed:', orderItemsRes.data);
          }
        } else {
          setMessage('❌ Order creation failed! Please try again.');
          console.error('Order creation failed:', orderRes.data);
        }
      } else {
        setMessage('❌ Payment processing failed! Please try again.');
        console.error('Payment creation failed:', paymentRes.data);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      setMessage('Payment error: ' + (err.response?.data?.message || err.message));
      
      // Show error alert
      Swal.fire({
        title: '❌ Payment Failed',
        text: err.response?.data?.message || err.message || 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Try Again'
      });
    }
  };

  // Example: 500 INR
  const amount = 500;

  const handleRazorpaySuccess = async (response) => {
    // Extra safety checks
    if (!Array.isArray(cartArray) || cartArray.length === 0 || total <= 0) {
      setMessage('Cart is empty! Please add items to cart.');
      return;
    }

    try {
      console.log('🔄 Starting Razorpay payment process...');
      console.log('💳 Razorpay response:', response);

      // 1. Get customer_id
      let customer_id = localStorage.getItem('customer_id');
      if (!customer_id) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          customer_id = user.id;
        }
      }
      if (!customer_id) {
        setMessage('Please login first!');
        return;
      }

      // 2. Create Payment record in DB
      const paymentData = {
        customer_id: parseInt(customer_id),
        amount: total - discount + (deliveryFree ? 0 : 49) + 4,
        payment_method: 'razorpay',
        payment_status: 'success',
        transaction_id: response.razorpay_payment_id,
        upi_id: selected === 'upi' ? upiId : undefined,
        card_last4: undefined,
      };
      
      console.log('💳 Creating Razorpay payment record:', paymentData);
      const paymentRes = await makePayment(paymentData);
      console.log('✅ Razorpay payment created:', paymentRes.data);

      if (paymentRes.data.success) {
        // 3. Create Order
        const orderData = {
          customer_id: parseInt(customer_id),
          address_id: localStorage.getItem('selected_address_id') || 1,
          payment_id: paymentRes.data.payment_id,
          order_status: 'confirmed',
          total_amount: total - discount + (deliveryFree ? 0 : 49) + 4,
          delivery_charge: deliveryFree ? 0 : 49,
          discount: discount,
          payment_method: 'razorpay',
          order_items: cartArray.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity || 1
          }))
        };
        
        console.log('📦 Creating Razorpay order:', orderData);
        const orderRes = await axios.post('/api/orders', orderData, { withCredentials: true });
        console.log('✅ Razorpay order created:', orderRes.data);
        
        if (orderRes.data.success) {
          // 4. Update Payment with order_id
          console.log('🔗 Linking Razorpay payment to order...');
          await axios.put(`/api/payments/${paymentRes.data.payment_id}`, {
            order_id: orderRes.data.order_id
          }, { withCredentials: true });
          
          // 5. Create Order Items
          const orderItems = cartArray.map(item => ({
            order_id: orderRes.data.order_id,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            price: item.price
          }));

          console.log('📋 Creating Razorpay order items:', orderItems);
          const orderItemsRes = await axios.post('/api/order-items', { items: orderItems }, { withCredentials: true });
          console.log('✅ Razorpay order items created:', orderItemsRes.data);
          
          if (orderItemsRes.data.success) {
            // 6. Clear cart
            console.log('🛒 Clearing cart after Razorpay payment...');
            await axios.delete('/api/cart/clear', { withCredentials: true });
            window.dispatchEvent(new Event('cart-updated'));
            
            // 7. Show success and redirect
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
              // Trigger order update event
              window.dispatchEvent(new Event('order-placed'));
              
              if (result.isConfirmed) {
                navigate('/orders');
              } else {
                navigate('/products');
              }
            });
          } else {
            setMessage('❌ Order items creation failed!');
            console.error('Razorpay order items creation failed:', orderItemsRes.data);
          }
        } else {
          setMessage('❌ Order creation failed!');
          console.error('Razorpay order creation failed:', orderRes.data);
        }
      } else {
        setMessage('❌ Payment record creation failed!');
        console.error('Razorpay payment record creation failed:', paymentRes.data);
      }
    } catch (err) {
      console.error('❌ Razorpay order error:', err);
      setMessage('Order error: ' + (err.response?.data?.message || err.message));
      
      // Show error alert
      Swal.fire({
        title: '❌ Order Failed',
        text: err.response?.data?.message || err.message || 'Something went wrong after payment. Please contact support.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Contact Support'
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen py-4 sm:py-6 lg:py-8 px-2">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-blue-100">
        {/* Left: Payment Methods */}
        <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 lg:mb-8">
            <button onClick={() => window.history.back()} className="text-gray-500 hover:text-blue-600 text-lg sm:text-xl font-bold">&#8592;</button>
            <span className="font-bold text-sm sm:text-base lg:text-lg tracking-tight">Complete Payment</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-gray-500 font-semibold"><Lock size={14} />100% Secure</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
            {paymentMethods.map(method => (
              <button
                key={method.value}
                className={`flex items-center w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl border-2 transition font-semibold text-left group text-xs sm:text-sm ${selected === method.value ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-600 text-blue-700 shadow-lg' : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-400'}`}
                onClick={() => setSelected(method.value)}
                disabled={['netbanking', 'giftcard', 'wallet'].includes(method.value)}
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
                  />
                  <button type="button" className="absolute right-2 top-2 bg-blue-600 text-white px-2 sm:px-3 py-1 rounded font-bold text-xs sm:text-sm">Verify</button>
                </div>
              </div>
              <RazorpayButton
                amount={total - discount + (deliveryFree ? 0 : 49) + 4}
                onSuccess={handleRazorpaySuccess}
                buttonText={`Pay ₹${(total - discount + (deliveryFree ? 0 : 49) + 4).toFixed(2)} with Razorpay`}
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
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base lg:text-lg mt-2 shadow-lg hover:from-blue-700 hover:to-purple-700 transition">
                Pay ₹{(total - discount + (deliveryFree ? 0 : 49)).toFixed(2)}
              </button>
            </form>
          )}
          {selected === 'cod' && (
            <div className="w-full max-w-xs flex flex-col items-center justify-center animate-fadeIn">
              <div className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4">Cash on Delivery</div>
              <button onClick={handlePay} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base lg:text-lg mt-2 shadow-lg hover:from-blue-700 hover:to-purple-700 transition">
                Place Order
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
                  <span>₹{(total - discount + (deliveryFree ? 0 : 49) + 4).toFixed(2)}</span>
                </div>
                <div className="mt-3 sm:mt-4 text-green-700 font-semibold text-xs sm:text-sm bg-green-50 rounded p-2 flex items-center gap-2">
                  <Gift size={14} sm:size={16} lg:size={18} /> 
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
                disabled={couponApplied}
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-xs sm:text-sm"
                disabled={couponApplied}
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
