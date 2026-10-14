const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

/**
 * Authentication middleware to protect routes
 * Reads JWT from HttpOnly cookie, verifies it, and attaches customer to req.user
 */
const authenticateCustomer = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const secret = process.env.JWT_SECRET || "shopkart_super_secret_jwt_key_2026";
    const decoded = jwt.verify(token, secret);

    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer account no longer exists",
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

module.exports = { authenticateCustomer };
