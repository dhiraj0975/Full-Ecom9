import React, { useState } from 'react';
import { 
  getMyProducts, 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  isAuthenticated,
  getCurrentUser
} from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAuth = () => {
    const authenticated = isAuthenticated();
    const user = getCurrentUser();
    setResults(prev => ({
      ...prev,
      auth: {
        isAuthenticated: authenticated,
        currentUser: user,
        token: localStorage.getItem('token'),
        userData: localStorage.getItem('user')
      }
    }));
  };

  const testGetMyProducts = async () => {
    setLoading(true);
    try {
      const response = await getMyProducts();
      
      setResults(prev => ({
        ...prev,
        getMyProducts: response
      }));
      
      if (response.success) {
        toast.success(`Found ${response.data.products?.length || 0} products`);
      } else {
        toast.error(`Error: ${response.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        getMyProducts: { error: error.message, stack: error.stack }
      }));
      toast.error(`Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetAllProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts();
      
      setResults(prev => ({
        ...prev,
        getAllProducts: response
      }));
      
      if (response.success) {
        toast.success(`Found ${response.data.products?.length || 0} products`);
      } else {
        toast.error(`Error: ${response.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        getAllProducts: { error: error.message, stack: error.stack }
      }));
      toast.error(`Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateProduct = async () => {
    setLoading(true);
    try {
      const testProduct = {
        name: 'Test Product',
        price: 99.99,
        quantity: 10,
        description: 'This is a test product',
        status: 'available'
      };
      
      const response = await createProduct(testProduct);
      
      setResults(prev => ({
        ...prev,
        createProduct: response
      }));
      
      if (response.success) {
        toast.success('Product created successfully!');
      } else {
        toast.error(`Error: ${response.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        createProduct: { error: error.message, stack: error.stack }
      }));
      toast.error(`Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer position="top-right" />
      
      <h1 className="text-3xl font-bold mb-6">API Test Panel</h1>
      
      {/* Auth Status */}
      <div className="mb-6">
        <button
          onClick={testAuth}
          className="bg-gray-600 text-white px-4 py-2 rounded mr-2"
        >
          Check Auth Status
        </button>
        {results.auth && (
          <div className="mt-2 p-4 bg-gray-100 rounded">
            <h3 className="font-bold">Authentication Status:</h3>
            <pre className="text-sm mt-2">{JSON.stringify(results.auth, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Product Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testGetMyProducts}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Get My Products'}
        </button>
        
        <button
          onClick={testGetAllProducts}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Get All Products'}
        </button>
        
        <button
          onClick={testCreateProduct}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Create Product'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {Object.entries(results).map(([key, result]) => (
          <div key={key} className="border rounded p-4">
            <h3 className="font-bold text-lg mb-2">{key}</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest; 