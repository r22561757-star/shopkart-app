const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Add a product to customer's wishlist
 * POST /wishlist/:productId
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Prevent duplicate entries
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated customer's wishlist
 * GET /wishlist
 */
const getWishlist = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id).populate("wishlist");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a product from customer's wishlist
 * DELETE /wishlist/:productId
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const customer = await Customer.findById(req.user._id);

    const initialLength = customer.wishlist.length;
    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );

    if (customer.wishlist.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your wishlist",
      });
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle a product in customer's wishlist (Lab 04 Bonus Challenge)
 * PATCH /wishlist/:productId/toggle
 */
const toggleWishlist = async (req, res, next) => {
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

    const customer = await Customer.findById(req.user._id);

    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      customer.wishlist = customer.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: "Product removed from wishlist",
        count: customer.wishlist.length,
      });
    } else {
      customer.wishlist.push(productId);
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: "Product added to wishlist",
        count: customer.wishlist.length,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
