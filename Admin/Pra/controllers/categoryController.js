const path = require('path');
const categoryModel = require("../model/categoryModel");
const BASE_URL = process.env.BASE_URL; // 👈 Set this in your .env file

// ✅ Create new category - Only admin
const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  let img_url = null;
  if (req.file) {
    const baseUrl = BASE_URL || `${req.protocol}://${req.get('host')}`;
    img_url = `${baseUrl}/uploads/${req.file.filename}`;
  }

  try {
    const result = await categoryModel.createCategory(name, img_url);
    res.status(201).json({
      success: true,
      message: "Category created",
      categoryId: result.insertId,
    });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

// ✅ Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ success: false, message: "Failed to get categories" });
  }
};

// ✅ Get single category by ID
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

// ✅ Update category
const updateCategory = async (req, res) => {
  const { name } = req.body;
  const id = req.params.id;

  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  let img_url = "";
  if (req.file) {
    const baseUrl = BASE_URL || `${req.protocol}://${req.get('host')}`;
    img_url = `${baseUrl}/uploads/${req.file.filename}`;
  } else if (req.body.img_url) {
    img_url = req.body.img_url;
  } else {
    const oldCategory = await categoryModel.getCategoryById(id);
    img_url = oldCategory ? oldCategory.img_url : "";
  }

  console.log("Updating category:", { id, name, img_url });

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

// ✅ Delete category
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

// ✅ Export all functions
module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
