const { 
  addProduct, 
  getAllProducts: getAllProductsModel, 
  getProductById: getProductByIdModel, 
  updateProduct: updateProductModel, 
  deleteProduct: deleteProductModel, 
  getProductsByRetailer 
} = require('../models/productModel');

// Create Product - Only for logged-in retailer
const createProduct = async (req, res) => {
  try {
    const retailer_id = req.user.id; // JWT token se automatically
    const { name, price, quantity, subcategory_id, image_url, status, description } = req.body;
    
    if (!name || !price || !quantity) {
      return res.status(400).json({ message: 'Name, price, and quantity are required' });
    }
    
    // Validate subcategory_id if provided
    if (subcategory_id !== undefined && subcategory_id !== null && subcategory_id !== '') {
      // You can add additional validation here to check if subcategory_id exists in database
      if (isNaN(subcategory_id) || subcategory_id <= 0) {
        return res.status(400).json({ message: 'Invalid subcategory ID' });
      }
    }
    
    const productId = await addProduct({ 
      name, 
      price, 
      quantity, 
      subcategory_id: subcategory_id || null, // Handle null/undefined properly
      image_url, 
      status: status || 'available', 
      description, 
      retailer_id 
    });
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      productId,
      retailer_id: retailer_id,
      note: `Product assigned to retailer ID: ${retailer_id}`
    });
  } catch (err) {
    res.status(500).json({ message: 'Product creation failed', error: err.message });
  }
};

// Get All Products - Public access
const getAllProducts = async (req, res) => {
  try {
    const products = await getAllProductsModel();
    res.status(200).json({ 
      message: 'All products retrieved successfully',
      count: products.length,
      products 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// Get Product By ID - Public access
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductByIdModel(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ 
      message: 'Product retrieved successfully',
      product 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

// Update Product - Only owner can update
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const retailer_id = req.user.id;
    const { name, price, quantity, subcategory_id, image_url, status, description } = req.body;
    
    // Check if product exists
    const existingProduct = await getProductByIdModel(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Security: Only owner can update
    if (existingProduct.retailer_id !== retailer_id) {
      return res.status(403).json({ 
        message: 'You can only update your own products',
        product_owner: existingProduct.retailer_id,
        your_id: retailer_id
      });
    }
    
    // Validate subcategory_id if provided
    if (subcategory_id !== undefined && subcategory_id !== null && subcategory_id !== '') {
      if (isNaN(subcategory_id) || subcategory_id <= 0) {
        return res.status(400).json({ message: 'Invalid subcategory ID' });
      }
    }
    
    const success = await updateProductModel(id, { 
      name, 
      price, 
      quantity, 
      subcategory_id: subcategory_id || null, // Handle null/undefined properly
      image_url, 
      status, 
      description 
    });
    
    if (success) {
      res.status(200).json({ 
        message: 'Product updated successfully',
        product_id: id,
        retailer_id: retailer_id
      });
    } else {
      res.status(400).json({ message: 'Failed to update product' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Product update failed', error: err.message });
  }
};

// Delete Product - Only owner can delete
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const retailer_id = req.user.id;
    
    // Check if product exists
    const existingProduct = await getProductByIdModel(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Security: Only owner can delete
    if (existingProduct.retailer_id !== retailer_id) {
      return res.status(403).json({ 
        message: 'You can only delete your own products',
        product_owner: existingProduct.retailer_id,
        your_id: retailer_id
      });
    }
    
    const success = await deleteProductModel(id);
    
    if (success) {
      res.status(200).json({ 
        message: 'Product deleted successfully',
        product_id: id,
        retailer_id: retailer_id
      });
    } else {
      res.status(400).json({ message: 'Failed to delete product' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Product delete failed', error: err.message });
  }
};

// Get My Products - Only logged-in retailer's products
const getMyProducts = async (req, res) => {
  try {
    const retailer_id = req.user.id;
    
    const products = await getProductsByRetailer(retailer_id);
    
    res.status(200).json({ 
      message: 'Your products retrieved successfully',
      retailer_id: retailer_id,
      count: products.length,
      products 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your products', error: err.message });
  }
};

// Get Product Count - Only logged-in retailer
const getMyProductCount = async (req, res) => {
  try {
    const retailer_id = req.user.id;
    const products = await getProductsByRetailer(retailer_id);
    
    const stats = {
      total_products: products.length,
      available_products: products.filter(p => p.status === 'available').length,
      unavailable_products: products.filter(p => p.status === 'unavailable').length,
      low_stock: products.filter(p => p.quantity < 10).length,
      out_of_stock: products.filter(p => p.quantity === 0).length
    };
    
    res.status(200).json({ 
      message: 'Product statistics retrieved successfully',
      retailer_id: retailer_id,
      stats 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product statistics', error: err.message });
  }
};

module.exports = { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  getMyProducts,
  getMyProductCount
};