import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../../services/productService';
import ProductGrid from '../../components/products/ProductGrid';
import { useParams } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { subcategoryId } = useParams();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const data = await getAllProducts();
      const filtered = subcategoryId ? data.filter(p => String(p.subcategory_id) === String(subcategoryId)) : data;
      setProducts(filtered);
      setLoading(false);
    }
    fetchProducts();
  }, [subcategoryId]);

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">All Products</h2>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};

export default ProductList; 