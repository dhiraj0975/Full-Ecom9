const categoryModel = require("../model/categoryModel");

// Create new category - sirf admin kar sakta hai
const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  let img_url = null;
  if (req.file) {
    img_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  try {
    const result = await categoryModel.createCategory(name, img_url);
    res.status(201).json({ success: true, message: "Category created", categoryId: result.insertId });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

// Get all categories - koi bhi user dekh sakta hai
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ success: false, message: "Failed to get categories" });
  }
};

// Get category by id
const getCategoryById = async (req, res) => {
  try {
    const category = await categoryModel.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    console.error("Get category error:", err);
    res.status(500).json({ success: false, message: "Failed to get category" });
  }
};

// Update category - sirf admin
const updateCategory = async (req, res) => {
  const { name } = req.body;
  const id = req.params.id;

  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  let img_url = null;
  if (req.file) {
    img_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  } else if (req.body.img_url) {
    img_url = req.body.img_url;
  }

  try {
    const result = await categoryModel.updateCategory(id, name, img_url);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category updated" });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

// Delete category - sirf admin
const deleteCategory = async (req, res) => {
  try {
    const result = await categoryModel.deleteCategory(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
