const mongoose = require("mongoose");
const Product = require("../models/product.model");

/**
 * Create a new product (Lab 03 initial open implementation)
 * POST /products
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, price, category, image, stock) are required",
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number greater than zero",
      });
    }

    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a number greater than or equal to zero",
      });
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products with search, category filtering, and sorting
 * GET /products
 */
const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    // Search by product name case-insensitively
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Filter by category
    if (category && category.trim()) {
      query.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    // Build query
    let productQuery = Product.find(query);

    // Sorting
    if (sort === "price_asc") {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sort === "price_desc") {
      productQuery = productQuery.sort({ price: -1 });
    } else {
      productQuery = productQuery.sort({ createdAt: -1 });
    }

    const products = await productQuery;

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 * GET /products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};
