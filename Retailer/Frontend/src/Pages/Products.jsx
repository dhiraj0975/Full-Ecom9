import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../Component/Layout';
import ProductCard from '../Component/ProductCard';
import ProductForm from '../Component/ProductForm';
import { 
  getMyProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getMyProductStats,
  handleApiError,
  isAuthenticated,
  getCurrentUser,
  getAllSubcategories
} from '../api';
import { getStockStatus } from '../utils/productUtils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  // Check if we should auto-open the add form (from dashboard)
  useEffect(() => {
    if (location.state?.openAddForm) {
      setShowForm(true);
      setEditingProduct(null);
    }
  }, [location.state]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchStats();
    fetchSubcategories();
  }, []);

  // Filter products when selectedSubcategory changes
  useEffect(() => {
    if (selectedSubcategory === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.subcategory_name === selectedSubcategory
      );
      setFilteredProducts(filtered);
    }
  }, [selectedSubcategory, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getMyProducts();
      
      if (response.success) {
        const productsList = response.data.products || [];
        setProducts(productsList);
        setFilteredProducts(productsList);
      } else {
        const error = handleApiError(response);
        console.log('Failed to load products:', error.message);
      }
    } catch (error) {
      const errorInfo = handleApiError({ error, status: 500 });
      console.log('Error loading products:', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getMyProductStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      // Stats are optional, don't show error for this
      console.log('Stats not available yet');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await getAllSubcategories();
      if (response.success) {
        setSubcategories(response.data || []);
      }
    } catch (error) {
      console.log('Subcategories not available yet');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    const productName = product ? product.name : 'Product';
    
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const response = await deleteProduct(productId);
        
        if (response.success) {
          console.log('Delete success, showing toast');
          toast.success('Product deleted successfully');
          fetchProducts(); // Refresh the list
        } else {
          const error = handleApiError(response);
          console.log(`Failed to delete "${productName}":`, error.message);
        }
      } catch (error) {
        const errorInfo = handleApiError({ error, status: 500 });
        console.log(`Error deleting "${productName}":`, errorInfo.message);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      
      if (editingProduct) {
        // Update existing product
        const response = await updateProduct(editingProduct.id, formData);
        
        if (response.success) {
          console.log('Update success, showing toast');
          toast.success('Product updated successfully');
        } else {
          const error = handleApiError(response);
          console.log(`Failed to update "${formData.name}":`, error.message);
          return; // Don't close form on error
        }
      } else {
        // Create new product
        const response = await createProduct(formData);
        
        if (response.success) {
          console.log('Add success, showing toast');
          toast.success('Product created successfully');
        } else {
          const error = handleApiError(response);
          console.log(`Failed to create "${formData.name}":`, error.message);
          return; // Don't close form on error
        }
      }
      
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts(); // Refresh the list
    } catch (error) {
      const errorInfo = handleApiError({ error, status: 500 });
      console.log('Unexpected error:', errorInfo.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubcategoryFilter = (e) => {
    const selectedValue = e.target.value;
    setSelectedSubcategory(selectedValue);
  };

  const clearFilter = () => {
    setSelectedSubcategory('');
  };

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={formLoading}
      />
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog</p>
          </div>
          <div className="flex gap-4">
           
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 rounded-lg shadow-lg p-6 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Products</p>
                <p className="text-2xl font-bold text-blue-900">{products.length}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-green-100 via-green-200 to-green-50 rounded-lg shadow-lg p-6 border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Available Products</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'available').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-50 rounded-lg shadow-lg p-6 border border-yellow-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-900">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.quantity < 10 && p.quantity > 0).length}
                </p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-100 via-purple-200 to-purple-50 rounded-lg shadow-lg p-6 border border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.quantity === 0).length}
                </p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </motion.div>
        </div>

        {/* Filter Section */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Subcategory:</label>
              <select
                value={selectedSubcategory}
                onChange={handleSubcategoryFilter}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subcategories</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.name}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
              {selectedSubcategory && (
                <button
                  onClick={clearFilter}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Filter
                </button>
              )}
              <span className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
            
            {/* Subcategory Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Products by Subcategory:</h4>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const subcategoryCounts = {};
                  products.forEach(product => {
                    const subcat = product.subcategory_name || 'Uncategorized';
                    subcategoryCounts[subcat] = (subcategoryCounts[subcat] || 0) + 1;
                  });
                  
                  return Object.entries(subcategoryCounts).map(([subcat, count]) => (
                    <span
                      key={subcat}
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        selectedSubcategory === subcat
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedSubcategory(selectedSubcategory === subcat ? '' : subcat)}
                    >
                      {subcat} ({count})
                    </span>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <AnimatePresence>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first product to your catalog</p>
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Add Your First Product
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">No products match the selected subcategory filter</p>
            <button
              onClick={clearFilter}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3, delay: 0.05 * idx }}
              >
                <ProductCard
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  isOwner={true}
                  onStatusChange={fetchProducts}
                />
              </motion.div>
            ))}
          </div>
        )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Products; 