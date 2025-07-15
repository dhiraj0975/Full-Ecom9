const cartModel = require('../models/cartModel');

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { product_id, quantity, price } = req.body;
    const [rows] = await cartModel.findCartItem(customer_id, product_id);
    if (rows.length > 0) {
      await cartModel.updateCartItemQty(quantity, rows[0].id);
      return res.json({ message: 'Cart updated' });
    } else {
      await cartModel.insertCartItem(customer_id, product_id, quantity, price);
      return res.json({ message: 'Added to cart' });
    }
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
};

// Get cart items for logged-in user
exports.getCart = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const [rows] = await cartModel.getCartItems(customer_id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { id } = req.params;
    // Optionally, check if the item belongs to the user
    await cartModel.removeCartItem(id);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;
    // Optionally, check if the item belongs to the user
    await cartModel.setCartItemQty(quantity, id);
    res.json({ message: 'Cart item quantity updated' });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const customer_id = req.user.id;
    await cartModel.clearCart(customer_id);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB error' });
  }
}; 