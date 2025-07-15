const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../models/productModule');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const id = await createProduct(req.body);
    res.status(201).json({ message: 'Product created', id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const affectedRows = await updateProduct(req.params.id, req.body);
    if (!affectedRows) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const affectedRows = await deleteProduct(req.params.id);
    if (!affectedRows) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
}; 