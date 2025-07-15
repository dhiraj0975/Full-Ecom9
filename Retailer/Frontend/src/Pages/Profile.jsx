import React, { useState, useEffect } from 'react';
import Layout from '../Component/Layout';
import { 
  getRetailerProfile, 
  updateRetailerProfile, 
  updateBankDetails,
  getBankDetails,
  deleteRetailer,
  handleApiError 
} from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    business_name: ''
  });
  
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
    fetchBankDetails();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getRetailerProfile();
      
      if (response.success) {
        const profileData = response.data.retailer;
        setProfile(profileData);
      } else {
        const error = handleApiError(response);
        toast.error(error.message);
      }
    } catch (error) {
      const errorInfo = handleApiError({ error, status: 500 });
      toast.error(errorInfo.message);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await getBankDetails();
      
      if (response.success && response.data.bankAccount) {
        setBankForm(response.data.bankAccount);
      }
    } catch (error) {
      // Bank details might not exist yet, that's okay
      console.log('No bank details found yet');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    
    try {
      const response = await updateRetailerProfile({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        business_name: profile.business_name
      });
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...profile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        const error = handleApiError(response);
        toast.error(error.message);
      }
    } catch (error) {
      const errorInfo = handleApiError({ error, status: 500 });
      toast.error(errorInfo.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleBankUpdate = async (e) => {
    e.preventDefault();
    setBankLoading(true);
    
    try {
      const response = await updateBankDetails(bankForm);
      
      if (response.success) {
        toast.success('Bank details updated successfully!');
        setProfile({ ...profile, ...bankForm });
      } else {
        const error = handleApiError(response);
        toast.error(error.message);
      }
    } catch (error) {
      const errorInfo = handleApiError({ error, status: 500 });
      toast.error(errorInfo.message);
    } finally {
      setBankLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <ToastContainer position="top-right" />
        
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account information and bank details</p>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👤 Personal Information
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bank'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏦 Bank Account Details
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      name="name"
                      value={profile.name || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      name="email"
                      value={profile.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      name="business_name"
                      value={profile.business_name || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                  <textarea
                    name="address"
                    value={profile.address || ''}
                    onChange={handleProfileChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    {profileLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'bank' && (
              <form onSubmit={handleBankUpdate} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-blue-600 text-xl mr-2">ℹ️</span>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Bank Account Information</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        This information is used for payment settlements and refunds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <input
                      name="bank_name"
                      value={bankForm.bank_name || ''}
                      onChange={handleBankChange}
                      placeholder="e.g., State Bank of India"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                    <input
                      name="account_holder_name"
                      value={bankForm.account_holder_name || ''}
                      onChange={handleBankChange}
                      placeholder="Name as per bank records"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      name="account_number"
                      value={bankForm.account_number || ''}
                      onChange={handleBankChange}
                      placeholder="Enter account number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">9-18 digits</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                    <input
                      name="ifsc_code"
                      value={bankForm.ifsc_code || ''}
                      onChange={handleBankChange}
                      placeholder="e.g., SBIN0001234"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">11 characters (e.g., SBIN0001234)</p>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={bankLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    {bankLoading ? 'Updating...' : 'Update Bank Details'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 