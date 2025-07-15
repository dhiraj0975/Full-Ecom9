import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import { addToCart as addToCartApi } from '../../api/cartApi';
import { ShoppingCart, Star, Truck, ShieldCheck, Plus, Minus, CheckCircle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imgZoom, setImgZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10 text-red-500">Product not found.</div>;

  // Support multiple images if image_url is comma separated
  const images = product.image_url
    ? product.image_url.includes(',')
      ? product.image_url.split(',').map(img => img.trim())
      : [product.image_url]
    : [];

  const isLoggedIn = !!(localStorage.getItem('token') || document.cookie.match(/(^| )token=([^;]+)/));

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      await addToCartApi(product.id, quantity, product.price);
      setShowSuccess(true);
      window.dispatchEvent(new Event('cart-updated'));
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/cart');
      }, 1500);
    } catch (err) {
      alert('Failed to add to cart!');
    }
  };

  // Stock Status
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
    <div className="max-w-8xl mx-auto px-2 py-8 grid md:grid-cols-2 gap-10 relative">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white border border-green-200 shadow-2xl rounded-xl px-4 py-6 flex flex-col items-center animate-fadeInUp">
            <CheckCircle className="text-green-500 mb-2" size={48} />
            <div className="text-lg font-bold text-green-700 mb-1">Product added to cart!</div>
            <div className="text-gray-500 text-sm">Redirecting to cart...</div>
          </div>
        </div>
      )}
      {/* Left: Images */}
      <div className="flex flex-col items-center md:items-start md:flex-row gap-6">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`thumb-${i}`}
              className={`w-14 h-14 object-cover rounded border cursor-pointer transition ring-2 ${selectedImg === i ? 'ring-blue-500' : 'ring-transparent'} hover:scale-110`}
              onClick={() => setSelectedImg(i)}
            />
          ))}
        </div>
        {/* Main Image with Zoom */}
        <div className="relative group">
          <img
            src={images[selectedImg]}
            alt={product.name}
            className={`w-full max-w-md md:max-w-xl h-80 rounded-xl shadow-lg border transition-transform duration-300`}
            style={{
              cursor: imgZoom ? 'zoom-out' : 'zoom-in',
              transform: imgZoom
                ? `scale(1.25) translate(${-((zoomPos.x - 50) / 2)}%, ${-((zoomPos.y - 50) / 2)}%)`
                : 'none',
            }}
            onMouseEnter={() => setImgZoom(true)}
            onMouseLeave={() => setImgZoom(false)}
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomPos({ x, y });
            }}
          />
          {imgZoom && (
            <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Zoom</span>
          )}
        </div>
      </div>
      {/* Right: Details */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-2xl font-bold mb-1">{product.name}</h1>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-600 font-semibold text-lg">4.2</span>
          <Star className="text-yellow-400 h-5 w-5" fill="#facc15" />
          <span className="text-gray-500 text-sm">51,965 Ratings & 3,198 Reviews</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-green-700 text-md font-bold">Extra ₹5919 off</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">36% off</span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl font-bold text-gray-800">₹{product.price}</span>
          <span className="text-gray-400 line-through text-lg">₹{(product.price * 1.2).toFixed(0)}</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">{Math.round(100 - (product.price / (product.price * 1.2) * 100))}% off</span>
        </div>
        <div className="text-gray-500 text-sm mb-2">+ ₹69 Secured Packaging Fee</div>
        {/* Stock Status */}
        <div className="mb-2">
          <span className={`font-medium ${stockClass}`}>{stockStatus}</span>
        </div>
        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-medium">Qty:</span>
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            disabled={quantity <= 1 || product.quantity === 0}
            aria-label="Decrease quantity"
          >
            <Minus size={18} />
          </button>
          <input
            id="quantity"
            type="number"
            min={1}
            max={product.quantity}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Math.min(product.quantity, Number(e.target.value))))}
            className="w-20 px-2 py-1 border rounded text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={product.quantity === 0}
          />
          <button
            onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            disabled={quantity >= product.quantity || product.quantity === 0}
            aria-label="Increase quantity"
          >
            <Plus size={18} />
          </button>
          {quantity >= product.quantity && product.quantity > 0 && (
            <span className="text-xs text-red-500 ml-2">Max available stock</span>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2 items-center">
          <button
            onClick={handleAddToCart}
            className="bg-blue-700 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded text-lg transition flex-1 disabled:opacity-50"
            disabled={product.quantity === 0}
          >
            <ShoppingCart className="inline-block mr-2" /> ADD TO CART
          </button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-3 rounded text-lg transition flex-1">BUY NOW</button>
        </div>
        {/* Delivery & Warranty Info */}
        <div className="mt-8 text-sm text-gray-600 space-y-2">
          <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-blue-500" /> Free delivery by <span className="font-semibold">2-4 days</span></div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600" /> 1 Year Manufacturer Warranty for Phone and 6 Months Warranty for In the Box Accessories</div>
        </div>
        {/* Description */}
        {product.description && (
          <div className="mt-6 text-gray-700 text-base">
            <div className="font-semibold mb-1">Product Details</div>
            <div className="bg-gray-50 rounded p-3 border text-sm">{product.description}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 