const express = require("express");
const SubcategoriesRoutes = express.Router();
const auth = require("../middleware/auth");

const {
  createSubcategory,
  getAllSubcategories,
  getByCategoryId, // ✅ yeh line likhna zaroori hai
  updateSubcategory,
  deleteSubcategory,
} = require("../controllers/subcategoryController");
const isAdmin = require("../middleware/isAdmin");

// Authentication middleware
SubcategoriesRoutes.use(auth);

// Routes
SubcategoriesRoutes.post("/",isAdmin, createSubcategory);
SubcategoriesRoutes.get("/",isAdmin, getAllSubcategories);
SubcategoriesRoutes.get("/category/:categoryId",isAdmin, getByCategoryId); // ✅ ab yeh kaam karega
SubcategoriesRoutes.put("/:id",isAdmin, updateSubcategory);
SubcategoriesRoutes.delete("/:id",isAdmin, deleteSubcategory);

module.exports = SubcategoriesRoutes;
