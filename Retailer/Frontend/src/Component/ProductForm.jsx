import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getAllSubcategories } from '../api/subcategoryApi';

const ProductForm = ({ product, onSubmit, onCancel, loading = false }) => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    image_url: '',
    status: 'available',
    subcategory_id: '',
    subcategory_name: ''
  });

  const [errors, setErrors] = useState({});
  const [subcategories, setSubcategories] = useState([]);

  // Populate form if editing existing product
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        price: product.price || '',
        quantity: product.quantity || '',
        description: product.description || '',
        image_url: product.image_url || '',
        status: product.status || 'available',
        subcategory_id: product.subcategory_id || '',
        subcategory_name: product.subcategory_name || ''
      });
    }
  }, [product]);

  // If editing and subcategory_name is missing but subcategory_id is present, set subcategory_name from subcategories
  useEffect(() => {
    if (product && !product.subcategory_name && product.subcategory_id && subcategories.length > 0) {
      const subcat = subcategories.find(sc => sc.id === product.subcategory_id);
      if (subcat) {
        setForm(prev => ({ 
          ...prev, 
          subcategory_name: subcat.name,
          subcategory_id: subcat.id
        }));
      }
    }
  }, [product, subcategories]);

  // Fetch subcategories on mount
  useEffect(() => {
    async function fetchSubcategories() {
      try {
        const response = await getAllSubcategories();
        if (response.success) {
          setSubcategories(response.data || []);
        } else {
          console.log('Could not load subcategories');
        }
      } catch (error) {
        console.log('Could not load subcategories');
        console.error('Error fetching subcategories:', error);
      }
    }
    fetchSubcategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'subcategory_name') {
      // Find the subcategory ID based on the selected name
      const selectedSubcategory = subcategories.find(sc => sc.name === value);
      setForm(prev => ({ 
        ...prev, 
        subcategory_name: value,
        subcategory_id: selectedSubcategory ? selectedSubcategory.id : ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!form.price || form.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!form.quantity || form.quantity < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!form.subcategory_id) {
      newErrors.subcategory_name = 'Subcategory is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare data for backend - send subcategory_id instead of subcategory_name
      const submitData = {
        name: form.name,
        price: form.price,
        quantity: form.quantity,
        description: form.description,
        image_url: form.image_url,
        status: form.status,
        subcategory_id: form.subcategory_id // Send ID to backend
      };
      
      onSubmit(submitData);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Subcategory Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory *
              </label>
              <select
                name="subcategory_name"
                value={form.subcategory_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subcategory_name ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sc) => (
                  <option key={sc.id} value={sc.name}>{sc.name}</option>
                ))}
              </select>
              {errors.subcategory_name && (
                <p className="text-red-500 text-sm mt-1">{errors.subcategory_name}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProductForm; 