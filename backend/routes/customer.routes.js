const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  logoutCustomer,
  changePassword,
} = require("../controllers/customer.controller");
const { authenticateCustomer } = require("../middlewares/auth.middleware");

// Public routes
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Protected routes
router.get("/me", authenticateCustomer, getCustomerProfile);
router.post("/logout", authenticateCustomer, logoutCustomer);
router.patch("/change-password", authenticateCustomer, changePassword);

module.exports = router;
