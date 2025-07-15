const { getSubcategoriesByCategory } = require('../models/subcategoryModule');

exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await getSubcategoriesByCategory(categoryId);
    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subcategories', error });
  }
}; 