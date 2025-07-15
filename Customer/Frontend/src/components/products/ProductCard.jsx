import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Stock status logic
  let stockStatus = '';
  let stockClass = '';
  if (product.quantity === 0) {
    stockStatus = 'Out of Stock';
    stockClass = 'text-red-500';
  } else if (product.quantity <= 5) {
    stockStatus = `Only ${product.quantity} left!`;
    stockClass = 'text-yellow-600';
  } else {
    stockStatus = 'In Stock';
    stockClass = 'text-green-600';
  }

  return (
    <Link to={product.quantity === 0 ? '#' : `/products/${product.id}`} className={`block group ${product.quantity === 0 ? 'pointer-events-none opacity-60' : ''} `} tabIndex={product.quantity === 0 ? -1 : 0}>
      <div className="bg-white rounded-2xl w-full max-w-[300px] sm:max-w-[340px] md:max-w-[360px] shadow-lg hover:shadow-2xl hover:shadow-black/20 transition p-4 flex flex-col mx-auto">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-28 xs:h-32 sm:h-40 md:h-44 object-cover rounded-xl mb-1 sm:mb-2 transition-transform duration-300 group-hover:scale-105 border"
          onError={e => { e.target.src = '/images/placeholder-product.png'; }}
        />
        <div className="font-semibold ]  xs:text-sm md:text-xl truncate mb-1 text-gray-900">{product.name}</div>
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`h-4 w-4 xs:h-5 xs:w-5 ${i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
          ))}
          <span className="text-gray-600 text-xs xs:text-sm ml-2">({product.ratingCount || 24})</span>
        </div>
        {/* Price */}
        <div className="text-black font-extrabold text-[16px] xs:text-[17px] mb-1">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        {/* Stock Status */}
        <div className={`text-xs xs:text-sm sm:text-base font-medium ${stockClass} mt-auto`}>{stockStatus}</div>
      </div>
    </Link>
  );
};

export default ProductCard; 