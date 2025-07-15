import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../api/orderApi';
import { getProductById } from '../api/productApi';
import { formatPrice, getStatusText, getStatusColor, getStockStatus } from '../utils/productUtils';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch product by ID
        const res = await getProductById(id);
        if (res && res.data) {
          setProduct(res.data);
        } else if (res && res.product) {
          setProduct(res.product);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-lg font-semibold mb-4">{error}</div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go Back</button>
      </div>
    );
  }

  if (!product) return null;

  const stockStatus = getStockStatus(product.quantity);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">← Back</button>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 w-full md:w-80 h-80 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <div className="text-6xl text-gray-300">📦</div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>{getStatusText(product.status)}</span>
              <span className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.icon} {stockStatus.text}</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-4">{formatPrice(product.price)}</div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Description:</span>
              <p className="text-gray-700 mt-1 whitespace-pre-line">{product.description || 'No description available.'}</p>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Quantity:</span> <span className="text-gray-800">{product.quantity}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Subcategory:</span> <span className="text-gray-800">{product.subcategory_name || '-'}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Retailer ID:</span> <span className="text-gray-800">{product.retailer_id}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Created At:</span> <span className="text-gray-800">{product.created_at ? new Date(product.created_at).toLocaleString() : '-'}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Updated At:</span> <span className="text-gray-800">{product.updated_at ? new Date(product.updated_at).toLocaleString() : '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 