import React, { useEffect, useState, useContext } from "react";
import Layout from "../component/Layout";
import { getAllRetailersWithProductCount, createRetailer, updateRetailer, deleteRetailer } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, AppWindow, PlusCircle, Users, Building2, MapPin, Phone, Mail, Edit3, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DashboardContext } from "../context/DashboardContext";

const API = axios.create({
  baseURL: 'https://admin-backend-six-steel.vercel.app/api',
  withCredentials: true,
});

const itemsPerPage = 6;

const initialRetailerState = () => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  business_name: "",
  status: "active",
  password: "",
});

const Retailer = () => {
  const [retailers, setRetailers] = useState([]);
  const [filteredRetailers, setFilteredRetailers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newRetailer, setNewRetailer] = useState(initialRetailerState());
  const [statusDropdownOpenId, setStatusDropdownOpenId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { fetchRecentRetailers } = useContext(DashboardContext);

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      const res = await getAllRetailersWithProductCount();
      let data = Array.isArray(res.data.data) ? res.data.data : res.data?.data || [];
      setRetailers(data);
    } catch (err) {
      toast.error("❌ Failed to load retailers");
    }
  };

  useEffect(() => {
    filterAndSearchRetailers(searchQuery, statusFilter, true);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    filterAndSearchRetailers(searchQuery, statusFilter, false);
    // eslint-disable-next-line
  }, [retailers]);

  const filterAndSearchRetailers = (query, status = statusFilter, resetPage = true) => {
    let tempFiltered = [...retailers];
    if (status !== 'all') {
      tempFiltered = tempFiltered.filter(r => r.status === status);
    }
    if (query) {
      tempFiltered = tempFiltered.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.email.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFilteredRetailers(tempFiltered);
    if (resetPage) setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRetailer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async () => {
    try {
      if (editingId) {
        await updateRetailer(editingId, newRetailer);
        toast.success("✅ Retailer updated successfully!");
        fetchRecentRetailers && fetchRecentRetailers();
      } else {
        await createRetailer(newRetailer);
        toast.success("✅ Retailer added successfully!");
        fetchRecentRetailers && fetchRecentRetailers();
      }
      await fetchRetailers();
      setShowDrawer(false);
      setNewRetailer(initialRetailerState());
      setEditingId(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`❌ ${editingId ? 'Failed to update' : 'Failed to add'} retailer: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (retailer) => {
    setNewRetailer({
      name: retailer.name,
      email: retailer.email,
      phone: retailer.phone,
      address: retailer.address,
      business_name: retailer.business_name,
      status: retailer.status,
    });
    setEditingId(retailer.id);
    setShowDrawer(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this retailer?")) {
      try {
        await deleteRetailer(id);
        toast.success("✅ Retailer deleted successfully!");
        await fetchRetailers();
        fetchRecentRetailers && fetchRecentRetailers();
      } catch (error) {
        console.error("Error:", error);
        toast.error(`❌ Failed to delete retailer: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleStatusChange = async (retailer, newStatus) => {
    if (retailer.status === newStatus) return;
    try {
      await updateRetailer(retailer.id, { ...retailer, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      await fetchRetailers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const totalPages = Math.ceil(filteredRetailers.length / itemsPerPage);
  const paginatedRetailers = filteredRetailers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case 'inactive': return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
      case 'pending': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <Users className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Retailer Manager
                </h1>
                <p className="text-gray-600 mt-1">Manage all your retailers in one place</p>
              </div>
            </div>
            <button
              onClick={() => {
                setNewRetailer(initialRetailerState());
                setEditingId(null);
                setShowDrawer(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <PlusCircle size={20} />
              Add Retailer
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Retailers</p>
                  <p className="text-2xl font-bold">{retailers.length}</p>
                </div>
                <Users size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active</p>
                  <p className="text-2xl font-bold">{retailers.filter(r => r.status === 'active').length}</p>
                </div>
                <Building2 size={24} />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Pending</p>
                  <p className="text-2xl font-bold">{retailers.filter(r => r.status === 'pending').length}</p>
                </div>
                <Eye size={24} />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
              {[
                { label: 'All', value: 'all', color: 'blue' },
                { label: 'Active', value: 'active', color: 'green' },
                { label: 'Inactive', value: 'inactive', color: 'red' },
                { label: 'Pending', value: 'pending', color: 'yellow' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all flex-shrink-0 ${
                    statusFilter === tab.value
                      ? `bg-${tab.color}-500 text-white shadow`
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
              <input
                type="text"
                placeholder="Search retailers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                {filteredRetailers.length} results
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div
            className={`transition-all duration-300 ${
              showDrawer ? "w-2/3" : "w-full"
            }`}
          >
            {/* Retailers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedRetailers.length > 0 ? (
                  paginatedRetailers.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{r.name}</h3>
                          <p className="text-gray-600 text-sm">{r.business_name}</p>
                          {/* Product Count Badge (just below business name) */}
                          <span
                            className="inline-block mt-2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow cursor-pointer hover:bg-indigo-700 transition"
                            onClick={() => navigate(`/products?retailer_id=${r.id}`)}
                            title="View all products for this retailer"
                          >
                            Products: {r.product_count || 0}
                          </span>
                        </div>
                        {/* Status Badge */}
                        <span
                          className={`relative px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${getStatusColor(r.status)}`}
                          tabIndex={0}
                          onClick={e => {
                            e.stopPropagation();
                            setStatusDropdownOpenId(r.id === statusDropdownOpenId ? null : r.id);
                          }}>
                          {r.status}
                          {statusDropdownOpenId === r.id && (
                            <div className="absolute z-10 mt-2 left-0 bg-white border rounded shadow-lg text-gray-700 text-xs min-w-[100px]">
                              {['active', 'inactive', 'pending'].map(opt => (
                                <div
                                  key={opt}
                                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${opt === r.status ? 'font-bold text-indigo-600' : ''}`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setStatusDropdownOpenId(null);
                                    handleStatusChange(r, opt);
                                  }}
                                >
                                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </div>
                              ))}
                            </div>
                          )}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail size={16} className="text-indigo-500" />
                          <span className="text-sm">{r.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone size={16} className="text-green-500" />
                          <span className="text-sm">{r.phone}</span>
                        </div>
                        <div className="flex items-start gap-3 text-gray-600">
                          <MapPin size={16} className="text-red-500 mt-0.5" />
                          <span className="text-sm">{r.address || 'No address provided'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => navigate(`/retailer-bank?retailer_id=${r.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 text-sm font-medium"
                        >
                          Bank Details
                        </button>
                        <button
                          onClick={() => handleEdit(r)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <Users size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No retailers found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or add a new retailer.</p>
                  </div>
                </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • {filteredRetailers.length} retailers
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg disabled:opacity-50 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Form */}
          {showDrawer && (
            <div className="w-1/3 bg-white shadow-2xl rounded-2xl p-6 relative transition-all duration-300 border border-gray-100">
              <button
                onClick={() => setShowDrawer(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                <AppWindow size={24} />
              </button>
              
              <div className="text-center mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl w-fit mx-auto mb-3">
                  <Users className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {editingId ? "Edit Retailer" : "Add Retailer"}
              </h2>
              </div>

              <div className="space-y-4">
                {["name", "email", "phone", "address", "business_name"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.replace("_", " ").charAt(0).toUpperCase() + field.replace("_", " ").slice(1)}
                    </label>
                  <input
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-300"
                    name={field}
                    type="text"
                    value={newRetailer[field]}
                    onChange={handleInputChange}
                      placeholder={`Enter ${field.replace("_", " ")}`}
                    />
                  </div>
                ))}

                {/* Password field - only show when creating new retailer */}
                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-300"
                      name="password"
                      type="password"
                      value={newRetailer.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                <select
                  name="status"
                  value={newRetailer.status}
                  onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-300"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                </div>

                <button
                  onClick={handleAddOrUpdate}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {editingId ? "Update Retailer" : "Add Retailer"}
                </button>
              </div>
            </div>
          )}
        </div>

        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </Layout>
  );
};

export default Retailer; 