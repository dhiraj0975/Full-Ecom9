import React, { useState, useEffect } from 'react';
import { Gift, Lock, Info, CheckCircle, Circle } from 'lucide-react';
import { createPayment } from '../../services/paymentService';
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
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/cart', { withCredentials: true }).then(res => setCart(res.data));
    // Ensure selected_address_id is set
    if (!localStorage.getItem('selected_address_id')) {
      axios.get('/api/addresses', { withCredentials: true }).then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          localStorage.setItem('selected_address_id', res.data[0].id);
        }
      });
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const mrp = cart.reduce((sum, item) => sum + ((item.mrp || item.price) * (item.quantity || 1)), 0);
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
    if (cart.length === 0 || total <= 0) {
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

      // Step 1: Create Payment (initially without order_id)
      const paymentData = {
        customer_id: parseInt(customer_id),
        amount: total,
        payment_method: selected,
        payment_status: selected === 'cod' ? 'pending' : 'success',
        upi_id: selected === 'upi' ? upiId : undefined,
        card_last4: selected === 'card' ? card.number.slice(-4) : undefined,
        transaction_id: 'TXN' + Date.now(),
      };
      
      const paymentRes = await createPayment(paymentData);
      
      if (paymentRes.data.success) {
        // Step 2: Create Order with product details for quantity deduction
        const address_id = localStorage.getItem('selected_address_id');
        const orderData = {
          customer_id: parseInt(customer_id),
          address_id: address_id ? parseInt(address_id) : undefined,
          payment_id: paymentRes.data.payment_id,
          order_status: selected === 'cod' ? 'pending' : 'confirmed',
          total_amount: total,
          delivery_charge: deliveryFree ? 0 : 49,
          discount: discount,
          payment_method: selected,
          order_items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity || 1
          }))
        };
        console.log('OrderData:', orderData);
        const orderRes = await axios.post('/api/orders', orderData, { withCredentials: true });
        
        if (orderRes.data.success) {
          // Step 3: Update Payment with order_id
          await axios.put(`/api/payments/${paymentRes.data.payment_id}`, {
            order_id: orderRes.data.order_id
          }, { withCredentials: true });
          
          // Step 4: Create Order Items
          const orderItems = cart.map(item => ({
            order_id: orderRes.data.order_id,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            price: item.price
          }));

          const orderItemsRes = await axios.post('/api/order-items', { items: orderItems }, { withCredentials: true });
          
          if (orderItemsRes.data.success) {
            // Step 4: Clear cart
            await axios.delete('/api/cart/clear', { withCredentials: true });
            window.dispatchEvent(new Event('cart-updated'));
            
            // Step 5: Show success and redirect
            await Swal.fire({
              title: 'Order Placed Successfully!',
              text: `Your order #${orderRes.data.order_id} has been placed. You will receive updates via email.`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'View Orders',
            });
            
            // Navigate to order confirmation or orders page
            navigate('/orders');
          } else {
            setMessage('Order items creation failed!');
          }
        } else {
          setMessage('Order creation failed!');
        }
      } else {
        setMessage('Payment failed!');
      }
    } catch (err) {
      setMessage('Payment error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Example: 500 INR
  const amount = 500;

  const handleRazorpaySuccess = async (response) => {
    if (cart.length === 0 || total <= 0) {
      setMessage('Cart is empty! Please add items to cart.');
      return;
    }
    try {
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
        amount: total,
        payment_method: 'razorpay',
        payment_status: 'success',
        transaction_id: response.razorpay_payment_id,
        upi_id: selected === 'upi' ? upiId : undefined,
        card_last4: undefined,
      };
      const paymentRes = await createPayment(paymentData);
      console.log('PaymentRes:', paymentRes.data);

      if (paymentRes.data.success) {
        // 3. Create Order
        const orderData = {
          customer_id: parseInt(customer_id),
          address_id: localStorage.getItem('selected_address_id') || 1,
          payment_id: paymentRes.data.payment_id,
          order_status: 'confirmed',
          total_amount: total,
          delivery_charge: deliveryFree ? 0 : 49,
          discount: discount,
          payment_method: 'razorpay',
          order_items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity || 1
          }))
        };
        const orderRes = await axios.post('/api/orders', orderData, { withCredentials: true });
        console.log('OrderRes:', orderRes.data);
        if (orderRes.data.success) {
          // 4. Update Payment with order_id
          await axios.put(`/api/payments/${paymentRes.data.payment_id}`, {
            order_id: orderRes.data.order_id
          }, { withCredentials: true });
          // 5. Create Order Items
          const orderItems = cart.map(item => ({
            order_id: orderRes.data.order_id,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            price: item.price
          }));
          const orderItemsRes = await axios.post('/api/order-items', { items: orderItems }, { withCredentials: true });
          console.log('OrderItemsRes:', orderItemsRes.data);
          if (orderItemsRes.data.success) {
            // 6. Clear cart
            await axios.delete('/api/cart/clear', { withCredentials: true });
            window.dispatchEvent(new Event('cart-updated'));
            // 7. Show success and redirect
            await Swal.fire({
              title: 'Order Placed Successfully!',
              text: `Your order #${orderRes.data.order_id} has been placed. You will receive updates via email.`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'View Orders',
            });
            navigate('/orders');
          } else {
            setMessage('Order items creation failed!');
          }
        } else {
          setMessage('Order creation failed!');
        }
      } else {
        setMessage('Payment record creation failed!');
      }
    } catch (err) {
      setMessage('Order error: ' + (err.response?.data?.message || err.message));
      console.error('Order error:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen py-10 px-2">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-blue-100">
        {/* Left: Payment Methods */}
        <div className="md:w-1/3 border-r bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col min-w-[220px]">
          <div className="flex items-center gap-2 mb-8">
            <button onClick={() => window.history.back()} className="text-gray-500 hover:text-blue-600 text-xl font-bold">&#8592;</button>
            <span className="font-bold text-xl tracking-tight">Complete Payment</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-gray-500 font-semibold"><Lock size={16} />100% Secure</span>
          </div>
          {paymentMethods.map(method => (
            <button
              key={method.value}
              className={`flex items-center w-full px-5 py-3 mb-3 rounded-xl border-2 transition font-semibold text-left group ${selected === method.value ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-600 text-blue-700 shadow-lg' : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-400'}`}
              onClick={() => setSelected(method.value)}
              disabled={['netbanking', 'giftcard', 'wallet'].includes(method.value)}
            >
              {selected === method.value ? <CheckCircle className="w-5 h-5 mr-2 text-blue-600" /> : <Circle className="w-5 h-5 mr-2 text-gray-300 group-hover:text-blue-400" />}
              {method.icon}
              <span className="flex-1">{method.label}</span>
              {['netbanking', 'giftcard', 'wallet'].includes(method.value) && <span className="ml-auto text-xs text-gray-400">Unavailable</span>}
            </button>
          ))}
        </div>
        {/* Center: Payment Form */}
        <div className="md:w-1/3 p-10 flex flex-col items-center justify-center min-h-[480px] border-r bg-gradient-to-b from-white to-blue-50">
          {selected === 'upi' && (
            <div className="w-full max-w-xs animate-fadeIn">
              <div className="mb-6">
                <label className="block font-semibold mb-2 text-gray-700 text-lg">
                  Add new UPI ID <span className="ml-1 text-xs text-blue-500 cursor-pointer">How to find?</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none text-lg transition"
                    placeholder="Enter your UPI ID"
                    required
                  />
                  <button type="button" className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1 rounded font-bold text-sm">Verify</button>
                </div>
              </div>
              <RazorpayButton
                amount={total - discount + (deliveryFree ? 0 : 49) + 4}
                onSuccess={handleRazorpaySuccess}
                buttonText={`Pay ₹${(total - discount + (deliveryFree ? 0 : 49) + 4).toFixed(2)} with Razorpay`}
              />
              <div className="flex items-center justify-center mt-2 text-xs text-gray-500 gap-1">
                <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-4 h-4" />
                <span>Secured by <span className="font-semibold text-blue-600">Razorpay</span></span>
              </div>
            </div>
          )}
          {selected === 'card' && (
            <form className="w-full max-w-xs animate-fadeIn" onSubmit={handlePay}>
              <div className="mb-4">
                <label className="block font-semibold mb-2 text-gray-700 text-lg">Card Number</label>
                <input
                  type="text"
                  value={card.number}
                  onChange={e => setCard({ ...card, number: e.target.value })}
                  className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none text-lg transition"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-2 text-gray-700 text-lg">Name on Card</label>
                <input
                  type="text"
                  value={card.name}
                  onChange={e => setCard({ ...card, name: e.target.value })}
                  className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none text-lg transition"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-2 text-gray-700 text-lg">Expiry</label>
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={e => setCard({ ...card, expiry: e.target.value })}
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none text-lg transition"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-2 text-gray-700 text-lg">CVV</label>
                  <input
                    type="password"
                    value={card.cvv}
                    onChange={e => setCard({ ...card, cvv: e.target.value })}
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none text-lg transition"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg mt-2 shadow-lg hover:from-blue-700 hover:to-purple-700 transition">Pay ₹{(total - discount + (deliveryFree ? 0 : 49)).toFixed(2)}</button>
            </form>
          )}
          {selected === 'cod' && (
            <div className="w-full max-w-xs flex flex-col items-center justify-center animate-fadeIn">
              <div className="text-lg font-semibold mb-4">Cash on Delivery</div>
              <button onClick={handlePay} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg mt-2 shadow-lg hover:from-blue-700 hover:to-purple-700 transition">Place Order</button>
            </div>
          )}
          {['netbanking', 'giftcard', 'wallet'].includes(selected) && (
            <div className="w-full max-w-xs text-center text-gray-400 text-lg font-semibold mt-10 animate-fadeIn">This payment method is currently unavailable.</div>
          )}
          {message && <div className="mt-8 text-center text-blue-700 font-semibold animate-fadeIn">{message}</div>}
        </div>
        {/* Right: Order Summary */}
        <div className="md:w-1/3 p-10 bg-gradient-to-b from-white to-blue-50 flex flex-col gap-4 min-w-[260px]">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-2 border border-blue-100">
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Price <span className="text-xs text-gray-400">({totalItems} item{totalItems > 1 ? 's' : ''})</span></span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-700">
              <span className="flex items-center gap-1">Platform fee <Info size={14} className="text-blue-400" /></span>
              <span>₹4</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-900 font-bold text-lg border-t pt-4">
              <span>Total Amount</span>
              <span>₹{(total - discount + (deliveryFree ? 0 : 49) + 4).toFixed(2)}</span>
            </div>
            <div className="mt-4 text-green-700 font-semibold text-sm bg-green-50 rounded p-2 flex items-center gap-2">
              <Gift size={18} /> 5% Cashback <span className="ml-2 text-green-600 font-normal">Claim now with payment offers</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 flex items-center gap-3 shadow">
            <CheckCircle className="text-green-600" />
            <span className="font-semibold text-green-700">100% Buyer Protection</span>
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