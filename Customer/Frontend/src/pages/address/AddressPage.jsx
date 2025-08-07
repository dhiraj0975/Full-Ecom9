import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import CheckoutStepper from '../../components/common/CheckoutStepper';
import { Gift, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const emptyForm = { name: '', phone: '', address_line: '', city: '', state: '', pincode: '' };

const AddressDrawer = ({ open, onClose, onSubmit, loading, initialData, mode }) => {
  const [form, setForm] = useState(initialData || { name: '', phone: '', address_line: '', city: '', state: '', pincode: '' });
  const [error, setError] = useState('');
  useEffect(() => { if (open) setForm(initialData || { name: '', phone: '', address_line: '', city: '', state: '', pincode: '' }); }, [open, initialData]);
  if (!open) return null;
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address_line || !form.city || !form.state || !form.pincode) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    onSubmit(form, () => setForm({ name: '', phone: '', address_line: '', city: '', state: '', pincode: '' }));
  };
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-full sm:w-[420px] max-w-full z-50 bg-white shadow-2xl animate-slideInDrawer flex flex-col" style={{ transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
          <h2 className="font-bold text-lg text-blue-700">{mode === 'edit' ? 'Edit Address' : 'Add New Address'}</h2>
        </div>
        <form className="flex-1 flex flex-col gap-4 px-6 py-6 overflow-y-auto" onSubmit={handleSubmit}>
          <div>
            <label className="block text-blue-700 font-medium mb-1">Name<span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Full Name" required />
          </div>
          <div>
            <label className="block text-blue-700 font-medium mb-1">Phone<span className="text-red-500">*</span></label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Mobile Number" required />
          </div>
          <div>
            <label className="block text-blue-700 font-medium mb-1">Address<span className="text-red-500">*</span></label>
            <input name="address_line" value={form.address_line} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Flat, House no., Building" required />
          </div>
          <div>
            <label className="block text-blue-700 font-medium mb-1">City<span className="text-red-500">*</span></label>
            <input name="city" value={form.city} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="City" required />
          </div>
          <div>
            <label className="block text-blue-700 font-medium mb-1">State<span className="text-red-500">*</span></label>
            <input name="state" value={form.state} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="State" required />
          </div>
          <div>
            <label className="block text-blue-700 font-medium mb-1">Pincode<span className="text-red-500">*</span></label>
            <input name="pincode" value={form.pincode} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Pincode" required />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 rounded-lg shadow hover:scale-105 transition flex items-center justify-center gap-2" disabled={loading}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            {mode === 'edit' ? 'Update Address' : 'Add Address'}
          </button>
        </form>
      </div>
      {/* Drawer animation */}
      <style>{`
        @keyframes slideInDrawer {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInDrawer { animation: slideInDrawer 0.35s cubic-bezier(.4,2,.6,1); }
      `}</style>
    </>
  );
};

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalInitial, setModalInitial] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  // Safe reduce function
  const safeReduce = (array, reducer, initialValue = 0) => {
    if (!Array.isArray(array) || array.length === 0) return initialValue;
    try {
      return array.reduce(reducer, initialValue);
    } catch (error) {
      console.error('Reduce error:', error);
      return initialValue;
    }
  };

  // Calculate totals safely
  const total = cartLoading ? 0 : safeReduce(cart, (sum, item) => {
    const price = parseFloat(item?.price) || 0;
    const quantity = parseInt(item?.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  const totalItems = cartLoading ? 0 : safeReduce(cart, (sum, item) => {
    const quantity = parseInt(item?.quantity) || 1;
    return sum + quantity;
  }, 0);

  const mrp = cartLoading ? 0 : safeReduce(cart, (sum, item) => {
    const price = parseFloat(item?.mrp || item?.price) || 0;
    const quantity = parseInt(item?.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  const deliveryFree = total > 999;
  const estDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/addresses');
      console.log('🏠 Address data:', res.data);
      
      let addressData = [];
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        addressData = res.data.data;
      } else if (Array.isArray(res.data)) {
        addressData = res.data;
      }
      
      setAddresses(addressData);
      setSelectedId(addressData.find(a => a.is_default)?.id || (addressData[0] && addressData[0].id));
    } catch (err) {
      console.error('❌ Error fetching addresses:', err);
      setAddresses([]);
    }
    setLoading(false);
  };

  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const res = await api.get('/api/cart');
      console.log('🛒 Cart data:', res.data);
      
      let cartData = [];
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        cartData = res.data.data;
      } else if (Array.isArray(res.data)) {
        cartData = res.data;
      }
      
      console.log('🛒 Final cart data:', cartData);
      setCart(cartData);
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setCart([]);
    }
    setCartLoading(false);
  };

  useEffect(() => { 
    fetchAddresses(); 
    fetchCart();
  }, []);

  const handleApplyCoupon = () => {
    if (coupon.trim().toLowerCase() === 'save10') {
      setDiscount(Math.round(total * 0.1));
      setCouponApplied(true);
    } else {
      setDiscount(0);
      setCouponApplied(false);
      toast.error('Invalid coupon! Try SAVE10');
    }
  };

  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = () => { setModalMode('add'); setModalInitial(null); setModalOpen(true); };
  const handleEdit = addr => { setModalMode('edit'); setModalInitial(addr); setModalOpen(true); };
  const handleModalClose = () => setModalOpen(false);
  const handleModalSubmit = async (form, resetForm) => {
    setModalLoading(true);
    try {
      if (modalMode === 'edit' && modalInitial) {
        await api.put(`/api/addresses/${modalInitial.id}`, form);
        toast.success('Address updated!', { position: 'top-center' });
      } else {
        await api.post('/api/addresses', form);
        toast.success('Address added!', { position: 'top-center' });
      }
      fetchAddresses();
      setModalOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to save address', { position: 'top-center' });
    }
    setModalLoading(false);
  };

  const handleDelete = async id => {
    const result = await Swal.fire({
      title: 'Delete Address?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/addresses/${id}`);
        await Swal.fire({
          title: 'Deleted!',
          text: 'Address has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        fetchAddresses();
      } catch {
        toast.error('Failed to delete address', { position: 'top-center' });
      }
    }
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editId) {
        await api.put(`/api/addresses/${editId}`, form);
        toast.success('Address updated!', { position: 'top-center' });
      } else {
        await api.post('/api/addresses', form);
        toast.success('Address added!', { position: 'top-center' });
      }
      setShowForm(false);
      fetchAddresses();
    } catch {
      toast.error('Failed to save address', { position: 'top-center' });
    }
    setFormLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading addresses...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen py-4 sm:py-6 lg:py-8">
      <ToastContainer position="top-center" autoClose={2000} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Address Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-4 py-2.5">
                <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                    🏠
                  </span>
                  Delivery Address
                </h1>
              </div>

              <div className="p-3 lg:p-4">
                <CheckoutStepper />
                
                {/* Login Status */}
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-lg font-bold">✓</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                          LOGIN VERIFIED
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem('user'));
                              return user?.name || 'Customer';
                            } catch {
                              return 'Customer';
                            }
                          })()}
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem('user'));
                              return user?.phone || user?.mobile || '+91XXXXXXXXXX';
                            } catch {
                              return '+91XXXXXXXXXX';
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    <button 
                      className="bg-white text-blue-600 font-bold border-2 border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm text-sm"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('customer_id');
                        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        navigate('/login');
                      }}
                    >
                      CHANGE
                    </button>
                  </div>
                </div>

                {/* Address Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                        2
                      </span>
                      Select Address
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {addresses.length} saved
                    </span>
                  </div>

                  {/* Address Cards */}
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div 
                        key={addr.id} 
                        className={`group relative transition-all duration-300 ${
                          selectedId === addr.id ? 'transform scale-[1.02] z-10' : 'hover:scale-[1.01]'
                        }`}
                      >
                        <div className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                          selectedId === addr.id 
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-lg shadow-blue-100' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}>
                          
                          {/* Selected Badge */}
                          {selectedId === addr.id && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          )}

                          <div className="flex flex-col lg:flex-row gap-2">
                            <div className="flex gap-2 flex-1">
                              {/* Radio Button */}
                              <div className="flex-shrink-0 pt-0.5">
                                <input
                                  type="radio"
                                  checked={selectedId === addr.id}
                                  onChange={() => {
                                    setSelectedId(addr.id);
                                    localStorage.setItem('selected_address_id', addr.id);
                                  }}
                                  className="w-3.5 h-3.5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                              </div>
                              
                              {/* Address Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="text-sm font-bold text-gray-900">{addr.name || 'Name'}</h3>
                                  <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider">
                                    🏠 HOME
                                  </span>
                                </div>
                                
                                <div className="text-gray-600 font-medium mb-1 flex items-center gap-1 text-xs">
                                  <span>📱</span>
                                  {addr.phone || ''}
                                </div>
                                
                                <div className="text-gray-700 mb-3 leading-relaxed">
                                  <p className="text-xs font-medium">
                                    📍 {addr.address_line}, {addr.city}, {addr.state} - 
                                    <span className="font-bold text-gray-900"> {addr.pincode}</span>
                                  </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-1.5">
                                  <button 
                                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1.5 text-xs"
                                    onClick={() => {
                                      localStorage.setItem('selected_address_id', addr.id);
                                      navigate('/payment');
                                    }}
                                  >
                                    <span className="text-sm">🚚</span>
                                    DELIVER HERE
                                  </button>
                                  
                                  {/* Mobile Edit/Delete */}
                                  <div className="flex gap-1.5 sm:hidden">
                                    <button 
                                      className="flex-1 bg-blue-50 text-blue-600 font-bold px-2 py-1.5 rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-all text-xs"
                                      onClick={() => handleEdit(addr)}
                                    >
                                      ✏️ EDIT
                                    </button>
                                    <button 
                                      className="flex-1 bg-red-50 text-red-600 font-bold px-2 py-1.5 rounded-lg border-2 border-red-200 hover:bg-red-100 transition-all text-xs"
                                      onClick={() => handleDelete(addr.id)}
                                    >
                                      🗑️ DELETE
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Desktop Edit/Delete */}
                            <div className="hidden sm:flex flex-col gap-1.5 ml-2">
                              <button 
                                className="bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center gap-1 text-xs"
                                onClick={() => handleEdit(addr)}
                              >
                                ✏️ EDIT
                              </button>
                              <button 
                                className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg border-2 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all flex items-center gap-1 text-xs"
                                onClick={() => handleDelete(addr.id)}
                              >
                                🗑️ DELETE
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer Actions */}
                  <div className="mt-6 pt-4 border-t-2 border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <button 
                        className="text-blue-700 font-bold hover:text-blue-800 transition-colors flex items-center gap-2 text-sm"
                        onClick={() => setShowForm(false)}
                      >
                        📋 View all {addresses.length} saved addresses
                      </button>
                      
                      <button 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md flex items-center gap-2 text-sm"
                        onClick={handleAdd}
                      >
                        <span className="text-base">➕</span>
                        Add New Address
                      </button>
                    </div>
                  </div>
                  
                  {/* Add Address Form */}
                  {showForm && (
                    <div className="mt-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 rounded-xl shadow-inner border-2 border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-base">➕</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Add New Address</h3>
                      </div>
                      
                      <form className="space-y-4" onSubmit={handleFormSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase tracking-wide">
                              Full Name *
                            </label>
                            <input 
                              name="name" 
                              value={form.name} 
                              onChange={handleFormChange} 
                              placeholder="Enter your full name" 
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-all font-medium text-sm shadow-sm" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase tracking-wide">
                              Phone Number *
                            </label>
                            <input 
                              name="phone" 
                              value={form.phone} 
                              onChange={handleFormChange} 
                              placeholder="Enter phone number" 
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-all font-medium text-sm shadow-sm" 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-bold mb-1 text-xs uppercase tracking-wide">
                            Address Line *
                          </label>
                          <input 
                            name="address_line" 
                            value={form.address_line} 
                            onChange={handleFormChange} 
                            placeholder="House No., Building, Street, Area" 
                            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-all font-medium text-sm shadow-sm" 
                            required 
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase tracking-wide">
                              City *
                            </label>
                            <input 
                              name="city" 
                              value={form.city} 
                              onChange={handleFormChange} 
                              placeholder="City" 
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-all font-medium text-sm shadow-sm" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase tracking-wide">
                              State *
                            </label>
                            <input 
                              name="state" 
                              value={form.state} 
                              onChange={handleFormChange} 
                              placeholder="State" 
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-all font-medium text-sm shadow-sm" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold mb-1 text-xs uppercase tracking-wide">
                              Pincode *
                            </label>
                            <input 
                              name="pincode" 
                              value={form.pincode} 
                              onChange={handleFormChange} 
                              placeholder="Pincode" 
                              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-all font-medium text-sm shadow-sm" 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <button 
                            type="submit" 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-sm flex items-center justify-center gap-2" 
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <span>💾</span>
                                {editId ? 'Update Address' : 'Save Address'}
                              </>
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold shadow-md hover:bg-gray-400 transition-all text-sm flex items-center justify-center gap-2" 
                            onClick={() => setShowForm(false)}
                          >
                            <span>❌</span>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <Gift size={20} className="text-pink-500" /> 
                  Order Summary
                </h3>
                
                {cartLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-3 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-700 font-semibold text-sm">
                      <span>Total Items</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold text-xs">
                        {totalItems}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-gray-700 font-semibold text-sm">
                      <span>MRP</span>
                      <span className="line-through text-gray-500">₹{mrp.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-gray-700 font-semibold text-sm">
                      <span>Discount</span>
                      <span className="text-green-600 font-bold">-₹{(mrp - total + discount).toFixed(2)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-center text-green-700 font-bold text-sm">
                          <span className="flex items-center gap-1">
                            🎉 Coupon Applied
                          </span>
                          <span>-₹{discount}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-gray-700 font-semibold text-sm">
                      <span>Delivery</span>
                      <span>
                        {deliveryFree ? (
                          <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full text-xs">
                            FREE
                          </span>
                        ) : (
                          '₹49'
                        )}
                      </span>
                    </div>
                    
                    <div className="border-t-2 border-gray-200 pt-3">
                      <div className="flex justify-between items-center text-gray-900 font-bold text-base">
                        <span>Total Amount</span>
                        <span className="text-lg">₹{(total - discount + (deliveryFree ? 0 : 49)).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Truck size={18} className="text-blue-500 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-gray-800 text-sm">Estimated Delivery</div>
                          <div className="text-xs text-gray-600">{estDelivery}</div>
                        </div>
                      </div>
                    </div>
                    
                    {deliveryFree && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          🚚 FREE SHIPPING UNLOCKED!
                        </span>
                      </div>
                    )}
                    
                    {/* Coupon Section */}
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={coupon}
                          onChange={e => setCoupon(e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all font-medium text-sm"
                          disabled={couponApplied}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-sm"
                          disabled={couponApplied}
                        >
                          {couponApplied ? '✅' : 'Apply'}
                        </button>
                      </div>
                      
                      <button
                        onClick={() => navigate('/payment')}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-base shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                        disabled={!Array.isArray(cart) || cart.length === 0}
                      >
                        <span className="text-lg">💳</span>
                        Continue to Payment
                        <span className="text-lg">→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AddressDrawer 
        open={modalOpen} 
        onClose={handleModalClose} 
        onSubmit={handleModalSubmit} 
        loading={modalLoading} 
        initialData={modalInitial} 
        mode={modalMode} 
      />
    </div>
  );
};

export default AddressPage;
