import React from 'react';
import { getStatusText, getStatusColor, getStatusIcon, formatPrice, getStockStatus } from '../utils/productUtils';
import { updateProduct } from '../api/productApi';
import { useState, useRef } from 'react';

const ProductCard = ({ product, onEdit, onDelete, isOwner = false, onStatusChange }) => {
  const { id, name, price, quantity, status, description, image_url, subcategory_name } = product;
  const stockStatus = getStockStatus(quantity);
  const [statusLoading, setStatusLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleEdit = () => {
    onEdit(product);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const handleStatusSelect = async (newStatus) => {
    setStatusLoading(true);
    try {
      const updatedProduct = {
        name,
        price,
        quantity,
        subcategory_id: product.subcategory_id,
        image_url,
        description,
        status: newStatus,
      };
      const res = await updateProduct(id, updatedProduct);
      if (onStatusChange) onStatusChange();
      setDropdownOpen(false);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className=" w-72  bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className=" h-[170px] object-cover w-[200px] bg-gray-200 flex items-center  justify-center">
        {image_url ? (
          <img 
            src={image_url} 
            alt={name} 
            className="w-full   h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="hidden items-center justify-center text-gray-500 text-4xl">
          📦
        </div>
      </div>

      {/* Product Info */}
      <div className="p-2">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-semibold text-gray-800 truncate">{name}</h3>
          {isOwner ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium focus:outline-none transition-colors duration-150 cursor-pointer border-0 ${getStatusColor(status)} ${statusLoading ? 'opacity-60 pointer-events-none' : 'hover:shadow-md hover:scale-105'}`}
                onClick={() => setDropdownOpen((v) => !v)}
                disabled={statusLoading}
                title="Change status"
                type="button"
              >
                {getStatusIcon(status)} {getStatusText(status)}
                {statusLoading && <span className="ml-1 animate-spin">⏳</span>}
              </button>
              {dropdownOpen && !statusLoading && (
                <div className="absolute right-0 z-20 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg animate-fade-in">
                  <button
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-green-50 rounded-t ${status === 'available' ? 'bg-green-100 text-green-800 font-semibold' : ''}`}
                    onClick={() => handleStatusSelect('available')}
                  >
                    ✔️ Available
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-50 rounded-b ${status === 'unavailable' ? 'bg-red-100 text-red-800 font-semibold' : ''}`}
                    onClick={() => handleStatusSelect('unavailable')}
                  >
                    ❌ Unavailable
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
              title="Product status">
              {getStatusIcon(status)} {getStatusText(status)}
            </span>
          )}
        </div>

        {/* Subcategory Badge */}
        {subcategory_name && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 shadow-sm">
              🏷️ {subcategory_name}
            </span>
          </div>
        )}

        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
          {description || 'No description available'}
        </p>

        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-bold text-blue-600">
            {formatPrice(price)}
          </span>
          <span className={`text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.icon} {stockStatus.text}
          </span>
        </div>

        <div className="text-xs text-gray-500 mb-2">
          Quantity: {quantity} units
        </div>

        {/* Action Buttons */}
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-2 rounded transition duration-200"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded transition duration-200"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 