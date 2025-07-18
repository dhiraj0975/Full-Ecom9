import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { User, Mail, Phone, Calendar, Edit2, Save, X, KeyRound, MapPin, Home, Hash, Landmark, ShoppingBag, CreditCard, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    pincode: '',
    state: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Calculate profile completion
    let filled = 0;
    const total = 7;
    if (form.name) filled++;
    if (form.email) filled++;
    if (form.phone) filled++;
    if (form.altPhone) filled++;
    if (form.address) filled++;
    if (form.pincode) filled++;
    if (form.state) filled++;
    setProgress(Math.round((filled / total) * 100));
  }, [form]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/customers/profile');
      setProfile(res.data.data);
      setForm({
        name: res.data.data.name,
        email: res.data.data.email,
        phone: res.data.data.phone || '',
        altPhone: res.data.data.altPhone || '',
        address: res.data.data.address || '',
        pincode: res.data.data.pincode || '',
        state: res.data.data.state || '',
        password: '',
      });
    } catch (err) {
      Swal.fire('Error', 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      altPhone: profile.altPhone || '',
      address: profile.address || '',
      pincode: profile.pincode || '',
      state: profile.state || '',
      password: '',
    });
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/customers/profile', form);
      Swal.fire('Success', 'Profile updated', 'success');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setAvatarUrl(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfile = async () => {
    const result = await Swal.fire({
      title: 'Delete Profile?',
      text: "Are you sure? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await api.delete('/api/customers/profile');
        Swal.fire('Deleted!', 'Your profile has been deleted.', 'success');
        window.location.href = '/login';
      } catch {
        Swal.fire('Error', 'Failed to delete profile', 'error');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]">Loading...</div>;
  if (!profile) return <div className="text-red-500 text-center py-10">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center py-10">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', duration: 0.7 }}
          className="flex-1 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-10 flex flex-col items-center border-2 border-gradient-to-tr from-blue-300 to-pink-300"
        >
          <div className="relative group mb-4">
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg animate-pulse">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-white drop-shadow-lg">{getInitials(form.name)}</span>
              )}
            </div>
            {/* Online badge */}
            <span className="absolute bottom-3 right-3 w-6 h-6 bg-green-400 border-2 border-white rounded-full shadow-lg"></span>
            <button onClick={handleAvatarClick} className="absolute bottom-3 left-3 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-blue-100 transition group-hover:scale-110">
              <Edit2 className="h-5 w-5 text-blue-500" />
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{form.name || 'Your Name'}</div>
          <div className="text-gray-500 mb-6">Customer</div>
          {/* Stats */}
          <div className="flex gap-8 mt-2">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
              <ShoppingBag className="h-7 w-7 text-blue-400 mb-1" />
              <div className="font-bold text-xl"><CountUp end={8} duration={1.2} /></div>
              <div className="text-xs text-gray-400">Orders</div>
            </motion.div>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
              <CreditCard className="h-7 w-7 text-purple-400 mb-1" />
              <div className="font-bold text-xl"><CountUp end={12500} duration={1.2} prefix="₹" /></div>
              <div className="text-xs text-gray-400">Total Spent</div>
            </motion.div>
          </div>
          {/* Profile Completion Bar */}
          <div className="w-full mt-8">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Profile Completion</span>
              <span className="text-xs font-bold text-blue-500">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-pink-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </motion.div>
        {/* Details Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', duration: 0.7, delay: 0.1 }}
          className="flex-[2] bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-10 border-2 border-gradient-to-tr from-pink-200 to-blue-200"
        >
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-base">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} disabled={!editMode} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
              {/* Change Password */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-base">Change Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} disabled={!editMode} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
              {/* Email */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-base">Email</label>
                <input name="email" value={form.email} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800" disabled />
              </div>
              {/* Phone No. */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-base">Phone No.</label>
                <input name="phone" value={form.phone} onChange={handleChange} disabled={!editMode} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
              {/* Alternate No. */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-base">Alternate No.</label>
                <input name="altPhone" value={form.altPhone} onChange={handleChange} disabled={!editMode} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
              {/* Address */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-base">Address</label>
                <input name="address" value={form.address} onChange={handleChange} disabled={!editMode} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
              {/* Pincode */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-base">Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} disabled={!editMode} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
              {/* State */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-base">State</label>
                <input name="state" value={form.state} onChange={handleChange} disabled={!editMode} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
            </div>
            {/* Divider with lock icon */}
            <div className="flex items-center gap-3 my-10">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-full" />
              <Lock className="h-6 w-6 text-blue-400" />
              <div className="flex-1 h-0.5 bg-gradient-to-l from-blue-300 via-purple-300 to-pink-300 rounded-full" />
            </div>
            {/* Save/Cancel Buttons */}
            {editMode && (
              <div className="flex gap-4 mt-8 justify-end">
                <button className="btn bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition" onClick={handleSave} disabled={saving}>
                  <Save className="h-5 w-5" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn bg-white border border-gray-300 text-gray-700 font-bold px-6 py-2 rounded-xl shadow flex items-center gap-2 hover:bg-gray-100 transition" onClick={handleCancel}>
                  <X className="h-5 w-5" /> Cancel
                </button>
              </div>
            )}
            {!editMode && (
              <div className="flex justify-end mt-8 gap-4">
                <button
                  className="btn btn-outline-primary font-semibold px-6 py-2 rounded-xl shadow hover:bg-blue-50 transition"
                  onClick={handleEdit}
                >
                  Edit Profile
                </button>
                <button
                  className="btn bg-red-500 text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-red-600 transition"
                  onClick={handleDeleteProfile}
                >
                  Delete Profile
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 