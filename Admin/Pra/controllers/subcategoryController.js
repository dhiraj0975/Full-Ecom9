const Subcategory = require("../model/subcategoryModel");

const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.getAll();
    res.status(200).json({ success: true, data: subcategories });
  } catch (error) {
    console.error("❌ getAllSubcategories error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getByCategoryId = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const subcategories = await Subcategory.getByCategoryId(categoryId);
    res.status(200).json({ success: true, data: subcategories });
  } catch (error) {
    console.error("❌ getByCategoryId error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const createSubcategory = async (req, res) => {
  const { name, category_id } = req.body; // 🛠 Fixed
  try {
    const id = await Subcategory.create(name, category_id); // 🛠 Fixed
    res.status(201).json({ success: true, id, name, category_id });
  } catch (error) {
    console.error("❌ createSubcategory error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateSubcategory = async (req, res) => {
  const { id } = req.params;
  const { name, category_id } = req.body; // 🛠 Fixed
  try {
    await Subcategory.update(id, name, category_id); // 🛠 Fixed
    res.json({ success: true, message: "Subcategory updated" });
  } catch (error) {
    console.error("❌ updateSubcategory error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteSubcategory = async (req, res) => {
  const { id } = req.params;
  try {
    await Subcategory.delete(id);
    res.json({ success: true, message: "Subcategory deleted" });
  } catch (error) {
    console.error("❌ deleteSubcategory error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllSubcategories,
  getByCategoryId,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
