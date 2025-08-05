const Product = require("../model/productModel");

exports.createProduct = async (req, res) => {
  try {
    let data = req.body;
    if (req.file) {
      data.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    if (!data.name || !data.price || !data.quantity || !data.subcategory_id || !data.description || !data.image_url || !data.status || !data.retailer_id) {
      throw new Error("All fields including subcategory_id and retailer_id are required");
    }
    const result = await Product.create(data);
    res.status(201).json({ message: "Product created", productId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let data = req.body;
    if (req.file) {
      data.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    console.log("Update Data:", data); // 👈 Debug log
    await Product.update(req.params.id, data);
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message, data: req.body });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
