import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById } from '../api/orderApi';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getOrderById(id);
        if (res && res.data) {
          setOrder(res.data);
        } else if (res && res.order) {
          setOrder(res.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [id]);

  const handleClose = () => navigate(-1);

  // Centered modal style
  const modalWrapper = "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl mx-auto pointer-events-none";
  const modalCard = "relative bg-white rounded-xl shadow-2xl p-6 md:p-10 animate-fade-in-up overflow-y-auto max-h-[90vh] pointer-events-auto border border-gray-200";

  if (loading) {
    return (
      <div className={modalWrapper}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 bg-white p-4 pointer-events-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={modalWrapper}>
        <div className={modalCard}>
          <div className="text-red-500 text-lg font-semibold mb-4">{error}</div>
          <button onClick={handleClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go Back</button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className={modalWrapper} onClick={handleClose}>
      <div
        className={modalCard}
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Order ID:</span> #{order.id}</div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Customer:</span> 
              <Link
                to={`/customers?search=${encodeURIComponent(order.customer_email)}`}
                className="text-blue-600 hover:underline"
                onClick={e => { e.stopPropagation(); }}
              >
                {order.customer_name}
              </Link>
            </div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Email:</span> {order.customer_email}</div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Phone:</span> {order.customer_phone}</div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Amount:</span> ₹{order.total_amount}</div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Status:</span> <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">{order.order_status}</span></div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Payment Method:</span> {order.payment_method}</div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Date:</span> {order.placed_at ? new Date(order.placed_at).toLocaleString() : '-'}</div>
          </div>
          <div>
            <div className="mb-2"><span className="font-semibold text-gray-700">Tracking Info:</span></div>
            <div className="bg-gray-50 rounded p-3 text-gray-600 text-sm">Tracking details coming soon...</div>
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ordered Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <div key={item.id || idx} className="flex gap-4 bg-gray-50 rounded-lg p-4 items-center shadow-sm">
                <img
                  src={item.image_url || '/no-image.png'}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-800 mb-1">{item.product_name}</div>
                  <div className="text-gray-600 text-sm mb-1">Qty: {item.quantity} | Price: ₹{item.unit_price}</div>
                  <div className="text-gray-500 text-xs">Product ID: {item.product_id}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 col-span-2">No items found for this order.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

// Tailwind animation classes (add to your global CSS if not present):
// .animate-fade-in-up {
//   @apply opacity-0 translate-y-8;
//   animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
// }
// @keyframes fadeInUp {
//   to {
//     opacity: 1;
//     transform: none;
//   }
// } 