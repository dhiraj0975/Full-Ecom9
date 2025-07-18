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
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/addresses');
      const data = res.data;
      setAddresses(data);
      setSelectedId(data.find(a => a.is_default)?.id || (data[0] && data[0].id));
    } catch (err) {
      setAddresses([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []);

  useEffect(() => {
    api.get('/api/cart').then(res => setCart(res.data));
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

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="max-w-7xl mx-auto px-2 md:px-6 py-1 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Address Section */}
        <div className="md:col-span-2">
          <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
            <CheckoutStepper />
            {/* Step 1: Login Info */}
            <div className="mb-6 border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-700">LOGIN ✓</div>
                <div className="text-lg font-bold">Dhiraj Khobragade <span className="text-gray-500 text-base ml-2">+916262090975</span></div>
              </div>
              <button className="text-blue-600 font-semibold border px-4 py-1 rounded">CHANGE</button>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t font-semibold text-lg">DELIVERY ADDRESS</div>
              <div className="bg-white border-x border-b rounded-b p-4">
                {addresses.map(addr => (
                  <div key={addr.id} className={`flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 mb-4 rounded border ${selectedId === addr.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex flex-row items-start gap-3 w-full">
                      <input
                        type="radio"
                        checked={selectedId === addr.id}
                        onChange={() => {
                          setSelectedId(addr.id);
                          localStorage.setItem('selected_address_id', addr.id);
                        }}
                        className="mt-1 h-5 w-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-lg">{addr.name || 'Name'}</span>
                          <span className="bg-gray-100 text-xs px-2 py-0.5 rounded border font-semibold">HOME</span>
                          <span className="text-gray-700 font-semibold">{addr.phone || ''}</span>
                        </div>
                        <div className="text-gray-700 mt-1">
                          {addr.address_line}, {addr.city}, {addr.state} - <b>{addr.pincode}</b>
                        </div>
                        <div className="mt-3 flex flex-row items-center gap-2">
                          <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded font-bold shadow text-sm sm:px-6 sm:py-2 sm:text-base" onClick={() => {
                            localStorage.setItem('selected_address_id', addr.id);
                            navigate('/payment');
                          }}>
                            DELIVER HERE
                          </button>
                          {/* Responsive Edit/Delete Buttons for mobile: inline with DELIVER HERE */}
                          <div className="flex flex-row gap-2 sm:hidden">
                            <button className="text-blue-600 font-semibold text-sm" onClick={() => handleEdit(addr)}>EDIT</button>
                            <button className="text-red-500 font-semibold text-sm" onClick={() => handleDelete(addr.id)}>DELETE</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* On desktop/tablet, show buttons in column to the right */}
                    <div className="hidden sm:flex flex-col gap-2 ml-2">
                      <button className="text-blue-600 font-semibold text-sm" onClick={() => handleEdit(addr)}>EDIT</button>
                      <button className="text-red-500 font-semibold text-sm" onClick={() => handleDelete(addr.id)}>DELETE</button>
                    </div>
                  </div>
                ))}
                <button className="text-blue-700 font-semibold mt-2" onClick={() => setShowForm(false)}>View all {addresses.length} addresses</button>
                <div className="mt-4">
                  <button className="text-blue-600 font-semibold" onClick={handleAdd}>+ Add a new address</button>
                </div>
                {showForm && (
                  <form className="mt-6 bg-gray-50 p-4 rounded shadow flex flex-col gap-3" onSubmit={handleFormSubmit}>
                    <input name="name" value={form.name} onChange={handleFormChange} placeholder="Name" className="border p-2 rounded" required />
                    <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Phone" className="border p-2 rounded" required />
                    <input name="address_line" value={form.address_line} onChange={handleFormChange} placeholder="Address" className="border p-2 rounded" required />
                    <input name="city" value={form.city} onChange={handleFormChange} placeholder="City" className="border p-2 rounded" required />
                    <input name="state" value={form.state} onChange={handleFormChange} placeholder="State" className="border p-2 rounded" required />
                    <input name="pincode" value={form.pincode} onChange={handleFormChange} placeholder="Pincode" className="border p-2 rounded" required />
                    <div className="flex gap-4 mt-2">
                      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow" disabled={formLoading}>{editId ? 'Update' : 'Add'} Address</button>
                      <button type="button" className="bg-gray-300 text-gray-700 px-6 py-2 rounded font-bold shadow" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Order Summary Section */}
        <div className="md:col-span-1 sticky top-24 self-start">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
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
              onClick={() => navigate('/payment')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition mt-2"
              disabled={cart.length === 0}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
      <AddressDrawer open={modalOpen} onClose={handleModalClose} onSubmit={handleModalSubmit} loading={modalLoading} initialData={modalInitial} mode={modalMode} />
    </div>
  );
};

export default AddressPage; 