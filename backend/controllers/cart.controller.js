const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Add a product to cart (or increment quantity if already present)
 * POST /cart/:productId
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is currently out of stock",
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Check if item already exists in cart
    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      const currentQty = customer.cart[existingIndex].quantity;
      if (currentQty + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more units. Only ${product.stock} available in stock`,
        });
      }
      customer.cart[existingIndex].quantity += 1;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await customer.save();

    // Populate and return updated cart
    const updatedCustomer = await Customer.findById(req.user._id).populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated customer's cart
 * GET /cart
 */
const getCart = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id).populate("cart.product");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Filter out any items where the product reference is null/deleted
    const validCart = customer.cart.filter((item) => item.product != null);
    if (validCart.length !== customer.cart.length) {
      customer.cart = validCart;
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update quantity of a cart item
 * PATCH /cart/:productId
 */
const updateCartQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const numQuantity = Number(quantity);
    if (!Number.isInteger(numQuantity) || numQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid integer greater than or equal to 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (numQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock} available)`,
      });
    }

    const customer = await Customer.findById(req.user._id);

    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    customer.cart[itemIndex].quantity = numQuantity;
    await customer.save();

    const updatedCustomer = await Customer.findById(req.user._id).populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an item from cart
 * DELETE /cart/:productId
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const customer = await Customer.findById(req.user._id);

    const initialLength = customer.cart.length;
    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    if (customer.cart.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    await customer.save();

    const updatedCustomer = await Customer.findById(req.user._id).populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
