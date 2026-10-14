const jwt = require("jsonwebtoken");

/**
 * Generate JWT token for customer
 * @param {string} customerId 
 * @returns {string} token
 */
const generateToken = (customerId) => {
  const secret = process.env.JWT_SECRET || "shopkart_super_secret_jwt_key_2026";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign({ id: customerId }, secret, {
    expiresIn,
  });
};

/**
 * Common cookie options for setting HttpOnly JWT
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};

module.exports = { generateToken, getCookieOptions };
