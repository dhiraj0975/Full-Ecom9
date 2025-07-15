import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductSubCategories,
  getProductCategories,
  getAllRetailers,
} from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, List, AppWindow, PlusCircle, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const itemsPerPage = 6;

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  const [newProduct, setNewProduct] = useState(initialProductState());
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDescDrawer, setShowDescDrawer] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDropdownOpenId, setStatusDropdownOpenId] = useState(null);
  const [image, setImage] = useState(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialRetailerId = params.get("retailer_id") || "";
  const [selectedRetailerId, setSelectedRetailerId] = useState(initialRetailerId);

  const navigate = useNavigate();

  function initialProductState() {
    return {
      name: "",
      price: "",
      quantity: "",
      subcategory_id: "",
      retailer_id: "",
      image_url: "",
      status: "available",
      description: "",
    };
  }

  useEffect(() => {
    fetchProducts();
    fetchSubcategories();
    fetchCategories();
    fetchRetailers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      let data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      data.sort((a, b) => a.id - b.id);
      setProducts(data);
    } catch (err) {
      toast.error("❌ Failed to load products");
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await getProductSubCategories();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSubcategories(data);
    } catch (err) {
      toast.error("❌ Failed to load subcategories");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getProductCategories();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(data);
    } catch (err) {
      toast.error("❌ Failed to load categories");
    }
  };

  const fetchRetailers = async () => {
    try {
      const res = await getAllRetailers();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRetailers(data);
    } catch (err) {
      toast.error("❌ Failed to load retailers");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async () => {
    const { name, price, quantity, subcategory_id, retailer_id, description, status } = newProduct;
    if (!name || !price || !quantity || !description || !subcategory_id || !retailer_id) {
      return toast.warn("⚠️ Please fill all required fields");
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('quantity', quantity);
      formData.append('subcategory_id', subcategory_id);
      formData.append('retailer_id', retailer_id);
      formData.append('description', description);
      formData.append('status', status);
      if (image) formData.append('image', image);
      if (editingId) {
        await updateProduct(editingId, formData);
        toast.success("✅ Product updated successfully!");
        fetchProducts();
      } else {
        await createProduct(formData);
        toast.success("✅ Product added successfully!");
        fetchProducts();
      }
      filterAndSearchProducts(searchQuery, selectedSubCategoryId, selectedRetailerId, false);
      setNewProduct(initialProductState());
      setImage(null);
      setEditingId(null);
      setShowDrawer(false);
    } catch (err) {
      toast.error("❌ Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setNewProduct({
      name: product.name || "",
      price: product.price || "",
      quantity: product.quantity || "",
      subcategory_id: product.subcategory_id || "",
      retailer_id: product.retailer_id || "",
      image_url: product.image_url || "",
      status: product.status || "available",
      description: product.description || "",
    });
    setEditingId(product.id);
    setShowDrawer(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        toast.success("🗑️ Product deleted");
        await fetchProducts();
        filterAndSearchProducts(searchQuery, selectedSubCategoryId, selectedRetailerId, false);
      } catch (err) {
        toast.error("❌ Failed to delete product");
      }
    }
  };

  const handleSubCategoryFilter = (e) => {
    const subCatId = e.target.value;
    setSelectedSubCategoryId(subCatId);
    filterAndSearchProducts(searchQuery, subCatId, selectedRetailerId, true);
    setCurrentPage(1);
  };

  useEffect(() => {
    filterAndSearchProducts(searchQuery, selectedSubCategoryId, selectedRetailerId, true);
  }, [searchQuery, selectedSubCategoryId, selectedRetailerId]);

  useEffect(() => {
    filterAndSearchProducts(searchQuery, selectedSubCategoryId, selectedRetailerId, false);
    // eslint-disable-next-line
  }, [products]);

  const filterAndSearchProducts = (query, subCatId, retailerId, resetPage = true) => {
    let tempFiltered = [...products];

    if (subCatId) {
      tempFiltered = tempFiltered.filter(
        (p) => p.subcategory_id?.toString() === subCatId
      );
    }

    if (retailerId) {
      tempFiltered = tempFiltered.filter(
        (p) => String(p.retailer_id) === String(retailerId)
      );
    }

    if (query) {
      tempFiltered = tempFiltered.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.retailer_name && p.retailer_name.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredProducts(tempFiltered);
    if (resetPage) setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (product, newStatus) => {
    if (product.status === newStatus) return;
    try {
      await updateProduct(product.id, { ...product, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-4 rounded-lg shadow-md ">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Product Manager</h1>
            <button
              onClick={() => {
                setNewProduct(initialProductState());
                setEditingId(null);
                setShowDrawer(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <PlusCircle size={20} />
              Add Product
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                <button className="p-2 text-gray-500">
                  <List size={20} />
                </button>
                <span className="px-4 py-2 border-l border-gray-300 text-sm font-medium text-gray-700">All</span>
              </div>
              
              <select
                value={selectedSubCategoryId}
                onChange={handleSubCategoryFilter}
                className="p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Subcategories</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                Total: {filteredProducts.length}
              </span>
            </div>
          </div>

          {selectedRetailerId && (
            <div className="flex items-center mb-4">
              <span className="text-indigo-700 font-semibold mr-2">
                Showing products for Retailer ID: {selectedRetailerId}
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
        </div>

        <div className="flex gap-6 mt-6">
          <div
            className={`transition-all duration-300 ${
              showDrawer ? "w-2/3" : "w-full"
            } bg-white p-4 rounded-lg shadow-md`}
          >
            <div className="relative">
              {selectedRetailerId && (
                <button
                  onClick={() => navigate("/retailers")}
                  className="absolute top-2 right-2 z-10 bg-white border border-gray-300 shadow-lg rounded-full w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-600 transition text-xl"
                  title="Back to Retailers"
                >
                  <X size={20} />
                </button>
              )}
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="p-3 text-center">Image</th>
                    <th className="p-3">Name</th>
                    <th className="p-3 text-center">Price</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-center">Description</th>
                    <th className="p-3">SubCategory</th>
                    <th className="p-3">Retailer Name</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-center">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="h-12 w-12 object-cover mx-auto rounded-md"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 mx-auto rounded-md flex items-center justify-center text-gray-400">
                              ?
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-center">₹{p.price}</td>
                        <td className="p-3 text-center">{p.quantity}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setCurrentDescription(p.description || "No description provided.");
                              setShowDescDrawer(true);
                            }}
                            className="text-indigo-600 hover:underline"
                          >
                            View
                          </button>
                        </td>
                        <td className="p-3">{p.subcategory_name || "N/A"}</td>
                        <td className="p-3">
                          {retailers.find(r => String(r.id) === String(p.retailer_id))?.name || "N/A"}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`relative px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                            p.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                            tabIndex={0}
                            onClick={e => {
                              e.stopPropagation();
                              setStatusDropdownOpenId(p.id === statusDropdownOpenId ? null : p.id);
                            }}>
                            {p.status}
                            {statusDropdownOpenId === p.id && (
                              <div className="absolute z-10 mt-2 left-0 bg-white border rounded shadow-lg text-gray-700 text-xs min-w-[100px]">
                                {['available', 'unavailable'].map(opt => (
                                  <div
                                    key={opt}
                                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${opt === p.status ? 'font-bold text-indigo-600' : ''}`}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setStatusDropdownOpenId(null);
                                      handleStatusChange(p, opt);
                                    }}
                                  >
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center p-4 text-gray-500">
                        No products found.
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
                <div className="space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Form */}
          {showDrawer && (
            <div className="w-1/3 bg-white shadow-xl rounded-lg p-6 relative transition-all duration-300">
              <button
                onClick={() => setShowDrawer(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <AppWindow size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>

              <div className="space-y-4">
                {["name", "price", "quantity"].map((field) => (
                  <input
                    key={field}
                    className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    name={field}
                    type={field === "price" || field === "quantity" ? "number" : "text"}
                    value={newProduct[field]}
                    onChange={handleInputChange}
                    placeholder={field.replace("_", " ").charAt(0).toUpperCase() + field.replace("_", " ").slice(1)}
                  />
                ))}
                <input
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {editingId && newProduct.image_url && (
                  <img src={newProduct.image_url} alt="Product" className="mt-2 w-24 h-24 object-cover rounded" />
                )}

                <select
                  name="retailer_id"
                  value={newProduct.retailer_id}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select Retailer --</option>
                  {retailers.map((ret) => (
                    <option key={ret.id} value={ret.id}>
                      {ret.name}
                    </option>
                  ))}
                </select>

                <select
                  name="subcategory_id"
                  value={newProduct.subcategory_id}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select Subcategory --</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>

                <select
                  name="status"
                  value={newProduct.status}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>

                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  maxLength={250}
                  placeholder="Enter product description (max 250 characters)"
                  className="p-3 border border-gray-300 rounded-lg w-full resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                />
                <div className="text-right text-sm text-gray-500">
                  {newProduct.description.length}/250
                </div>

                <button
                  onClick={handleAddOrUpdate}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-transform active:scale-95"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          )}

          {/* Description Drawer */}
          {showDescDrawer && (
            <div className="w-1/3 bg-white shadow-xl rounded-lg p-6 relative">
               <button
                onClick={() => setShowDescDrawer(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <AppWindow size={24} />
              </button>
              <h3 className="text-xl font-bold mb-4 text-center text-gray-800">📘 Product Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
                {currentDescription}
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </Layout>
  );
}

export default Products;
