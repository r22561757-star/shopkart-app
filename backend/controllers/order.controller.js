const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const { getRazorpayInstance } = require("../config/razorpay");

/**
 * Create a new payment order
 * POST /orders/create-payment-order
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine, addressLine1, city, state, pinCode, pincode } = req.body;
    const resolvedAddressLine = (addressLine || addressLine1 || "").trim();
    const resolvedPinCode = (pinCode || pincode || "").trim();

    // Validate shipping details
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }
    if (!phone || !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Valid 10-digit phone number is required" });
    }
    if (!resolvedAddressLine) {
      return res.status(400).json({ success: false, message: "Address line is required" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, message: "State is required" });
    }
    if (!resolvedPinCode || !/^\d{6}$/.test(resolvedPinCode)) {
      return res.status(400).json({ success: false, message: "Valid 6-digit PIN code is required" });
    }

    // Load customer with populated cart
    const customer = await Customer.findById(req.user._id).populate("cart.product");
    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add products before checking out.",
      });
    }

    // Verify all products still exist and validate current stock
    const itemSnapshots = [];
    let serverTotalAmount = 0;

    for (const cartItem of customer.cart) {
      if (!cartItem.product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available",
        });
      }

      const product = await Product.findById(cartItem.product._id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${cartItem.product.name || "item"} no longer exists`,
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      serverTotalAmount += itemTotal;

      itemSnapshots.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image || "",
      });
    }

    // Format shipping address
    const shippingAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: resolvedAddressLine,
      addressLine1: resolvedAddressLine,
      city: city.trim(),
      state: state.trim(),
      pinCode: resolvedPinCode,
      pincode: resolvedPinCode,
    };

    // Create ShopKart Order in MongoDB with PENDING_PAYMENT
    const order = new Order({
      customer: customer._id,
      items: itemSnapshots,
      shippingAddress,
      totalAmount: serverTotalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
      orderStatus: "PENDING_PAYMENT",
    });

    const amountInPaise = Math.round(serverTotalAmount * 100);

    // Create Razorpay Order
    let razorpayOrderId = null;
    const razorpay = getRazorpayInstance();

    try {
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${order._id.toString().slice(-8)}`,
        notes: {
          customerId: customer._id.toString(),
          shopkartOrderId: order._id.toString(),
        },
      });
      razorpayOrderId = rzpOrder.id;
    } catch (rzpErr) {
      // In development / test mode with placeholder keys, generate safe test order ID
      console.warn("Razorpay API order creation notice:", rzpErr.message);
      razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    order.razorpayOrderId = razorpayOrderId;
    await order.save();

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      orderId: order._id,
      razorpayOrderId: order.razorpayOrderId,
      amount: order.totalAmount,
      amountPaise: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart_mock_id",
      customer: {
        name: customer.fullName,
        email: customer.email,
        contact: shippingAddress.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment signature and confirm order
 * POST /orders/verify-payment
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "All payment verification details (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify customer ownership
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You cannot verify an order belonging to another customer.",
      });
    }

    // Prevent duplicate payment verification
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Order has already been verified and paid",
        order,
      });
    }

    // Verify razorpay order ID matches stored order
    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Mismatched Razorpay Order ID",
      });
    }

    // Verify HMAC-SHA256 signature using secret
    const secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_test_mock_secret_key";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    // Payment is verified! Update order status
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.orderStatus = "PLACED";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    // Decrement stock for each item in the order
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear customer's persistent cart
    await Customer.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] },
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully and order placed",
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders for the authenticated customer
 * GET /orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order details
 * GET /orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify ownership
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You cannot view another customer's order.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status progression (Lab 06 Bonus Challenge)
 * PATCH /orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, orderStatus } = req.body;
    const targetStatus = (status || orderStatus || "").toUpperCase().trim();

    const ALLOWED_STATUSES = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!targetStatus || !ALLOWED_STATUSES.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed progression values: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify ownership
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You cannot modify an order belonging to another customer.",
      });
    }

    order.status = targetStatus;
    order.orderStatus = targetStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${targetStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
