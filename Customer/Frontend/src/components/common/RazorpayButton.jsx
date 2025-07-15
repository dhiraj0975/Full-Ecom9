import React from "react";
import useRazorpayScript from "../../utils/useRazorpayScript";
import axios from "axios";

const RazorpayButton = ({ amount, onSuccess, buttonText }) => {
  useRazorpayScript();

  const handlePayment = async () => {
    try {
      console.log('Razorpay frontend key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
      const { data: order } = await axios.post("/api/payments/razorpay/order", {
        amount,
        currency: "INR",
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "E-Commerce",
        description: "Order Payment",
        order_id: order.orderId,
        handler: function (response) {
          onSuccess && onSuccess(response);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@email.com",
          contact: "9999999999",
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment initialization failed: " + (err.response?.data?.details || err.message));
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
    >
      <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-5 h-5" />
      {buttonText || `Pay with Razorpay`}
    </button>
  );
};

export default RazorpayButton; 