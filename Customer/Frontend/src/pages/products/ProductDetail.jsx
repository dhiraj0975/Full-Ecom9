import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import { addToCart as addToCartApi } from '../../api/cartApi';
import { ShoppingCart, Star, Truck, ShieldCheck, Plus, Minus, CheckCircle, Heart, Share2, ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imgZoom, setImgZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // Support multiple images if image_url is comma separated
  const images = product.image_url
    ? product.image_url.includes(',')
      ? product.image_url.split(',').map(img => img.trim())
      : [product.image_url]
    : ['/images/placeholder-product.png'];

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

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Stock Status
  let stockStatus = '';
  let stockClass = '';
  let stockBadge = '';
  if (product.quantity === 0) {
    stockStatus = 'Out of Stock';
    stockClass = 'text-red-600';
    stockBadge = 'bg-red-100 text-red-800';
  } else if (product.quantity <= 5) {
    stockStatus = `Only ${product.quantity} left!`;
    stockClass = 'text-orange-600';
    stockBadge = 'bg-orange-100 text-orange-800';
  } else {
    stockStatus = 'In Stock';
    stockClass = 'text-green-600';
    stockBadge = 'bg-green-100 text-green-800';
  }

  const originalPrice = (product.price * 1.36).toFixed(0);
  const discount = Math.round(100 - (product.price / originalPrice * 100));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white border border-green-200 shadow-2xl rounded-xl px-6 py-8 flex flex-col items-center animate-bounce max-w-sm mx-4">
            <CheckCircle className="text-green-500 mb-3" size={56} />
            <div className="text-xl font-bold text-green-700 mb-2">Added to Cart!</div>
            <div className="text-gray-600 text-center">Redirecting to cart...</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-full transition ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-gray-400 hover:text-blue-500 transition"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden group">
              <img
                src={images[selectedImg]}
                alt={product.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-300"
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
                <span className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                  Zoom
                </span>
              )}
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${stockBadge}`}>
                {stockStatus}
              </span>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`thumb-${i}`}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg cursor-pointer transition-all border-2 ${
                      selectedImg === i ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImg(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(4.2)</span>
                </div>
                <span className="text-sm text-gray-500">2,847 reviews</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">₹{product.price}</span>
                <span className="text-lg text-gray-500 line-through">₹{originalPrice}</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {discount}% off
                </span>
              </div>
              <div className="text-sm text-gray-600">
                + ₹69 Secured Packaging Fee | Free delivery above ₹999
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition"
                    disabled={quantity <= 1 || product.quantity === 0}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.quantity}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Math.min(product.quantity, Number(e.target.value))))}
                    className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    disabled={product.quantity === 0}
                  />
                  <button
                    onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition"
                    disabled={quantity >= product.quantity || product.quantity === 0}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {quantity >= product.quantity && product.quantity > 0 && (
                  <span className="text-xs text-red-500">Max stock reached</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                  disabled={product.quantity === 0}
                >
                  <ShoppingCart size={20} />
                  ADD TO CART
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105">
                  BUY NOW
                </button>
              </div>
            </div>

            {/* Delivery & Warranty */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery & Services</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="text-blue-500 flex-shrink-0" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Free Delivery</div>
                    <div className="text-sm text-gray-600">Expected delivery in 2-4 business days</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-green-500 flex-shrink-0" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Warranty</div>
                    <div className="text-sm text-gray-600">1 Year Manufacturer Warranty</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 
