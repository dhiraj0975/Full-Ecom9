import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import { getAllRetailerBanks, getAllRetailers, createRetailerBank, updateRetailerBank, deleteRetailerBank } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PlusCircle, Edit3, AppWindow, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const itemsPerPage = 7;

const initialBankState = () => ({
  retailer_id: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  account_holder_name: "",
});

const bankOptions = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Axis Bank",
  "Canara Bank",
  "Union Bank of India",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "IDFC FIRST Bank",
  "Yes Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Bank",
  "IDBI Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",
  "Federal Bank",
  "South Indian Bank",
  "RBL Bank",
  "Karur Vysya Bank",
  "Bandhan Bank",
  "Dhanlaxmi Bank",
  "City Union Bank",
  "Jammu & Kashmir Bank",
  "Karnataka Bank",
  "Tamilnad Mercantile Bank",
  "Saraswat Bank"
];

const columns = [
  {
    key: "name",
    label: "Retailer Name",
    render: (row) => (
      <span className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-500 text-indigo-100 font-bold text-base">
          {row.name ? row.name.charAt(0).toUpperCase() : "?"}
        </span>
        <span className="font-semibold">{row.name || "N/A"}</span>
      </span>
    ),
  },
  { key: "bank_name", label: "Bank Name" },
  { key: "account_holder_name", label: "Account Holder" },
  { key: "account_number", label: "Account Number" },
  { key: "ifsc_code", label: "IFSC Code" },
  { key: "bank_created_at", label: "Bank Created" },
  { 
    key: "status", 
    label: "Status",
    render: (row) => getStatusBadge(row.status)
  },
  {
    key: "actions",
    label: "Actions",
    render: (row, onEdit, onDelete) => (
      <div className="flex gap-2 justify-center">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
          onClick={() => onEdit(row)}
        >
          <Edit3 size={14} /> Edit
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1"
          onClick={() => onDelete(row.bank_id)}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    ),
  },
];

const getStatusBadge = (status) => {
  const color = status === "active"
    ? "bg-green-100 text-green-800"
    : status === "inactive"
    ? "bg-red-100 text-red-800"
    : "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{status || "N/A"}</span>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
    case 'inactive': return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
    case 'pending': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
};

const RetailerBank = () => {
  const [data, setData] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newBank, setNewBank] = useState(initialBankState());
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialRetailerId = params.get("retailer_id") || "";
  const [selectedRetailerId, setSelectedRetailerId] = useState(initialRetailerId);

  useEffect(() => {
    fetchData();
    fetchRetailers();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAllRetailerBanks();
      setData(res.data.data || []);
    } catch (err) {
      toast.error("❌ Failed to load retailer bank data");
    }
  };

  const fetchRetailers = async () => {
    try {
      const res = await getAllRetailers();
      setRetailers(res.data.data || res.data || []);
    } catch (err) {
      toast.error("❌ Failed to load retailers");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBank((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async () => {
    console.log('editingId:', editingId, 'newBank:', newBank);
    const { retailer_id, bank_name, account_number, ifsc_code, account_holder_name } = newBank;
    if (!retailer_id || !bank_name || !account_number || !ifsc_code || !account_holder_name) {
      return toast.warn("⚠️ Please fill all required fields");
    }
    try {
      if (editingId) {
        await updateRetailerBank(editingId, newBank);
        toast.success("✅ Bank account updated!");
      } else {
        await createRetailerBank(newBank);
        toast.success("✅ Bank account added!");
      }
      fetchData();
      setShowDrawer(false);
      setNewBank(initialBankState());
      setEditingId(null);
    } catch (err) {
      toast.error("❌ Failed to save bank account");
    }
  };

  const handleEdit = (row) => {
    setNewBank({
      retailer_id: row.retailer_id || "",
      bank_name: row.bank_name || "",
      account_number: row.account_number || "",
      ifsc_code: row.ifsc_code || "",
      account_holder_name: row.account_holder_name || "",
    });
    setEditingId(row.bank_id);
    setShowDrawer(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      try {
        await deleteRetailerBank(id);
        toast.success("✅ Bank account deleted!");
        fetchData();
      } catch (err) {
        toast.error("❌ Failed to delete bank account");
      }
    }
  };

  const filteredData = selectedRetailerId
    ? data.filter((item) => String(item.retailer_id) === String(selectedRetailerId))
    : data;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <h2 className="text-2xl font-bold text-indigo-700 flex-1">Retailer Bank Account Management</h2>
            <input
              type="text"
              placeholder="Search by Retailer Name, Bank Name, Account Holder, Account Number, IFSC Code, Bank Created, Status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full sm:w-1/3 mx-4"
            />
            <button
              onClick={() => {
                setNewBank(initialBankState());
                setEditingId(null);
                setShowDrawer(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <PlusCircle size={20} /> Add Bank Account
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <span className="text-sm text-gray-600">
              Total: {filteredData.length}
            </span>
          </div>

          {selectedRetailerId && (
            <div className="flex items-center mb-4">
              <span className="text-indigo-700 font-semibold mr-2">
                Showing bank accounts for Retailer ID: {selectedRetailerId}
              </span>
              <button
                onClick={() => navigate("/retailers")}
                className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-lg font-bold"
                title="Back to Retailers"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex gap-6">
            <div className={`transition-all duration-300 ${showDrawer ? "w-2/3" : "w-full"}`}>
              <div className="relative">
                {selectedRetailerId && (
                  <button
                    onClick={() => navigate("/retailers")}
                    className="absolute top-2 right-2 z-10 bg-white border border-gray-300 shadow-lg rounded-full w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-600 transition text-xl"
                    title="Back to Retailers"
                  >
                    ×
                  </button>
                )}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-indigo-50">
                      <tr>
                        {columns.map((col) => (
                          <th key={col.key} className="p-3 text-center font-bold text-black whitespace-nowrap">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, idx) => (
                          <tr key={row.retailer_id + '-' + row.account_number} className="border-b border-black hover:bg-indigo-50 transition-all">
                            {columns.map((col) => (
                              <td
                                key={col.key}
                                className="p-3  text-center max-w-[180px] truncate whitespace-nowrap"
                                title={row[col.key] || "N/A"}
                              >
                                {col.render
                                  ? col.key === "actions"
                                    ? col.render(row, handleEdit, handleDelete)
                                    : col.render(row)
                                  : col.key === "status"
                                  ? getStatusBadge(row[col.key])
                                  : row[col.key] !== null && row[col.key] !== undefined && row[col.key] !== ""
                                  ? row[col.key]
                                  : <span className="text-gray-400">N/A</span>}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                            No data found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx + 1}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`px-3 py-1 rounded ${
                            currentPage === idx + 1
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showDrawer && (
              <div className="w-1/3 bg-white shadow-2xl rounded-2xl p-6 relative transition-all duration-300 border border-gray-100">
                <button
                  onClick={() => setShowDrawer(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <AppWindow size={24} />
                </button>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-indigo-700">
                    {editingId ? "Edit Bank Account" : "Add Bank Account"}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retailer</label>
                    <select
                      name="retailer_id"
                      value={newBank.retailer_id}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-300"
                    >
                      <option value="">-- Select Retailer --</option>
                      {retailers.map((ret) => (
                        <option key={ret.id} value={ret.id}>
                          {ret.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <select
                      name="bank_name"
                      value={newBank.bank_name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-300"
                    >
                      <option value="">-- Select Bank --</option>
                      {bankOptions.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  {["account_holder_name", "account_number", "ifsc_code"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <input
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-300"
                        name={field}
                        type="text"
                        value={newBank[field]}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field.replace("_", " ")}`}
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleAddOrUpdate}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-transform active:scale-95"
                  >
                    {editingId ? "Update Bank Account" : "Add Bank Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </Layout>
  );
};

export default RetailerBank; 