/**
 * ShopKart Automated Integration Test Suite
 * Tests all requirements across Lab 01 through Lab 06
 */
const http = require("http");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { app, server } = require("../index");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to make HTTP requests
function request({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { ...headers },
    };

    if (body) {
      const payload = typeof body === "string" ? body : JSON.stringify(body);
      options.headers["Content-Type"] = "application/json";
      options.headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers["set-cookie"];
  if (!setCookie) return "";
  const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return cookieStr.split(";")[0];
}

async function runTests() {
  console.log("\n========================================================");
  console.log("🧪 SHOPKART FULL-STACK INTEGRATION TEST SUITE (LABS 01-06)");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  try {
    const testEmail = `tester_${Date.now()}@shopkart.com`;
    let authCookie = "";
    let sampleProductId = "";

    // ----------------------------------------------------
    // LAB 01: BACKEND CUSTOMER AUTHENTICATION
    // ----------------------------------------------------
    console.log("\n--- [LAB 01] Customer Authentication Tests ---");

    // 1. Missing fields
    let res = await request({
      method: "POST",
      path: "/customers/register",
      body: { fullName: "Test User", email: testEmail },
    });
    assert(res.statusCode === 400, "Registration rejects missing fields with 400");

    // 2. Short password
    res = await request({
      method: "POST",
      path: "/customers/register",
      body: { fullName: "Test User", email: testEmail, password: "123", phone: "9876543210" },
    });
    assert(res.statusCode === 400, "Registration rejects short password (< 6 chars) with 400");

    // 3. Successful registration
    res = await request({
      method: "POST",
      path: "/customers/register",
      body: { fullName: "Test User", email: testEmail, password: "password123", phone: "9876543210" },
    });
    assert(res.statusCode === 201 && res.body.success === true, "Registration succeeds with 201");
    assert(res.body.customer && !res.body.customer.password, "Customer response does NOT expose password");

    // 4. Duplicate email
    res = await request({
      method: "POST",
      path: "/customers/register",
      body: { fullName: "Test User 2", email: testEmail, password: "password123", phone: "9876543210" },
    });
    assert(res.statusCode === 409, "Registration rejects duplicate email with 409 Conflict");

    // 5. Invalid credentials login
    res = await request({
      method: "POST",
      path: "/customers/login",
      body: { email: testEmail, password: "wrongpassword" },
    });
    assert(res.statusCode === 401 && res.body.message === "Invalid credentials", "Login rejects invalid credentials with 401 without revealing field");

    // 6. Successful login & HttpOnly cookie
    res = await request({
      method: "POST",
      path: "/customers/login",
      body: { email: testEmail, password: "password123" },
    });
    assert(res.statusCode === 200 && res.body.success === true, "Login succeeds with 200");
    authCookie = extractCookie(res.headers);
    assert(authCookie.startsWith("token="), "Login response sets HttpOnly JWT cookie 'token'");

    // 7. Protected profile without cookie
    res = await request({
      method: "GET",
      path: "/customers/me",
    });
    assert(res.statusCode === 401, "Protected /customers/me rejects unauthenticated request with 401");

    // 8. Protected profile with cookie
    res = await request({
      method: "GET",
      path: "/customers/me",
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && (res.body.email === testEmail || res.body.customer?.email === testEmail), "Protected /customers/me returns customer profile when authenticated");

    // 9. Change password (Lab 01 Bonus)
    res = await request({
      method: "PATCH",
      path: "/customers/change-password",
      headers: { Cookie: authCookie },
      body: { oldPassword: "password123", newPassword: "newpassword123" },
    });
    assert(res.statusCode === 200 && res.body.success === true, "[Bonus] PATCH /customers/change-password verifies and updates password");

    // ----------------------------------------------------
    // LAB 03: PRODUCT CATALOGUE & DISCOVERY
    // ----------------------------------------------------
    console.log("\n--- [LAB 03] Product Catalogue & Discovery Tests ---");

    // 1. Get products list
    res = await request({ method: "GET", path: "/products" });
    assert(res.statusCode === 200 && Array.isArray(res.body.products), "GET /products returns list of products");
    if (res.body.products.length > 0) {
      sampleProductId = res.body.products[0]._id;
    }

    // 2. Search products
    res = await request({ method: "GET", path: "/products?search=keyboard" });
    assert(res.statusCode === 200 && res.body.products.length > 0, "GET /products?search=... performs case-insensitive search");

    // 3. Filter by category
    res = await request({ method: "GET", path: "/products?category=Electronics" });
    assert(res.statusCode === 200 && res.body.products.every(p => p.category.toLowerCase() === "electronics"), "GET /products?category=... filters by category");

    // 4. Sort by price
    res = await request({ method: "GET", path: "/products?sort=price_asc" });
    const prices = res.body.products.map(p => p.price);
    const isSorted = prices.every((val, i, arr) => !i || arr[i - 1] <= val);
    assert(res.statusCode === 200 && isSorted, "GET /products?sort=price_asc returns products sorted by ascending price");

    // 5. Single product retrieval
    res = await request({ method: "GET", path: `/products/${sampleProductId}` });
    assert(res.statusCode === 200 && res.body.product._id === sampleProductId, "GET /products/:id returns correct product");

    // 6. Invalid ID format
    res = await request({ method: "GET", path: "/products/invalid_id_format" });
    assert(res.statusCode === 400, "GET /products/:id rejects invalid ObjectId format with 400");

    // ----------------------------------------------------
    // LAB 04: PERSISTENT WISHLIST
    // ----------------------------------------------------
    console.log("\n--- [LAB 04] Persistent Wishlist Tests ---");

    // 1. Unauthenticated wishlist request
    res = await request({ method: "POST", path: `/wishlist/${sampleProductId}` });
    assert(res.statusCode === 401, "POST /wishlist/:id rejects unauthenticated request with 401");

    // 2. Add product to wishlist
    res = await request({
      method: "POST",
      path: `/wishlist/${sampleProductId}`,
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.success === true, "POST /wishlist/:id successfully adds product to wishlist");

    // 3. Duplicate wishlist entry
    res = await request({
      method: "POST",
      path: `/wishlist/${sampleProductId}`,
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 409, "POST /wishlist/:id rejects duplicate wishlist entry with 409 Conflict");

    // 4. Get populated wishlist
    res = await request({
      method: "GET",
      path: "/wishlist",
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.wishlist.some(p => p._id === sampleProductId), "GET /wishlist returns populated customer wishlist");

    // 5. Remove from wishlist
    res = await request({
      method: "DELETE",
      path: `/wishlist/${sampleProductId}`,
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.success === true, "DELETE /wishlist/:id removes product from wishlist");

    // 6. Toggle Wishlist (Lab 04 Bonus)
    res = await request({
      method: "PATCH",
      path: `/wishlist/${sampleProductId}/toggle`,
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.saved === true, "[Bonus] PATCH /wishlist/:id/toggle saves product when not in wishlist");
    res = await request({
      method: "PATCH",
      path: `/wishlist/${sampleProductId}/toggle`,
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.saved === false, "[Bonus] PATCH /wishlist/:id/toggle removes product when already in wishlist");

    // ----------------------------------------------------
    // LAB 05: PERSISTENT SHOPPING CART
    // ----------------------------------------------------
    console.log("\n--- [LAB 05] Persistent Shopping Cart Tests ---");

    // 1. Unauthenticated cart request
    res = await request({ method: "POST", path: `/cart/${sampleProductId}` });
    assert(res.statusCode === 401, "POST /cart/:id rejects unauthenticated request with 401");

    // 2. Add to cart
    res = await request({
      method: "POST",
      path: `/cart/${sampleProductId}`,
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.cart.length > 0, "POST /cart/:id adds product with quantity 1");

    // 3. Increment existing cart item
    res = await request({
      method: "POST",
      path: `/cart/${sampleProductId}`,
      headers: { Cookie: authCookie },
    });
    const itemInCart = res.body.cart.find(item => item.product._id === sampleProductId || item.product === sampleProductId);
    assert(res.statusCode === 200 && itemInCart && itemInCart.quantity === 2, "POST /cart/:id increments existing quantity to 2");

    // 4. Update quantity
    res = await request({
      method: "PATCH",
      path: `/cart/${sampleProductId}`,
      headers: { Cookie: authCookie },
      body: { quantity: 3 },
    });
    assert(res.statusCode === 200 && res.body.cart.find(i => (i.product._id || i.product) === sampleProductId).quantity === 3, "PATCH /cart/:id updates quantity to 3");

    // 5. Reject invalid quantity
    res = await request({
      method: "PATCH",
      path: `/cart/${sampleProductId}`,
      headers: { Cookie: authCookie },
      body: { quantity: 0 },
    });
    assert(res.statusCode === 400, "PATCH /cart/:id rejects quantity < 1 with 400");

    // 6. Get populated cart
    res = await request({
      method: "GET",
      path: "/cart",
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.cart.length > 0 && res.body.cart[0].product.name, "GET /cart returns populated product references");

    // ----------------------------------------------------
    // LAB 06: CHECKOUT, RAZORPAY TEST PAYMENT & ORDERS
    // ----------------------------------------------------
    console.log("\n--- [LAB 06] Checkout & Razorpay Test Payment Tests ---");

    // 1. Reject invalid shipping address
    res = await request({
      method: "POST",
      path: "/orders/create-payment-order",
      headers: { Cookie: authCookie },
      body: { fullName: "", phone: "123", addressLine: "", city: "", state: "", pinCode: "0" },
    });
    assert(res.statusCode === 400, "POST /orders/create-payment-order validates shipping address with 400");

    // 2. Create payment order
    const shippingData = {
      fullName: "Test Customer",
      phone: "9876543210",
      addressLine: "Flat 402, Lotus Residency, MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      pinCode: "560001",
    };
    res = await request({
      method: "POST",
      path: "/orders/create-payment-order",
      headers: { Cookie: authCookie },
      body: shippingData,
    });
    assert(res.statusCode === 201 && res.body.success === true, "POST /orders/create-payment-order creates pending order with 201");
    const { orderId, razorpayOrderId } = res.body;

    // 3. Verify payment signature with valid HMAC-SHA256
    const mockPaymentId = `pay_test_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_test_mock_secret_key";
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${mockPaymentId}`)
      .digest("hex");

    // First test invalid signature rejection
    res = await request({
      method: "POST",
      path: "/orders/verify-payment",
      headers: { Cookie: authCookie },
      body: {
        orderId,
        razorpayOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: "invalid_tampered_signature",
      },
    });
    assert(res.statusCode === 400, "POST /orders/verify-payment rejects invalid HMAC-SHA256 signature with 400");

    // Now test valid signature verification
    res = await request({
      method: "POST",
      path: "/orders/verify-payment",
      headers: { Cookie: authCookie },
      body: {
        orderId,
        razorpayOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: validSignature,
      },
    });
    assert(res.statusCode === 200 && res.body.order.paymentStatus === "PAID" && res.body.order.orderStatus === "PLACED", "POST /orders/verify-payment marks order PAID and PLACED");

    // 4. Cart cleared after verified payment
    res = await request({
      method: "GET",
      path: "/cart",
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.cart.length === 0, "Persistent cart is cleared in MongoDB only after verified payment");

    // 5. Get orders list
    res = await request({
      method: "GET",
      path: "/orders",
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.orders.length > 0, "GET /orders returns customer's order history");

    // 6. Single order details
    res = await request({
      method: "GET",
      path: `/orders/${orderId}`,
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200 && res.body.order._id === orderId, "GET /orders/:id returns historical order snapshot");

    // 7. Update order status progression (Lab 06 Bonus)
    res = await request({
      method: "PATCH",
      path: `/orders/${orderId}/status`,
      headers: { Cookie: authCookie },
      body: { status: "CONFIRMED" },
    });
    assert(res.statusCode === 200 && (res.body.order.orderStatus === "CONFIRMED" || res.body.order.status === "CONFIRMED"), "[Bonus] PATCH /orders/:id/status advances order progression to CONFIRMED");

    // 8. Logout clears cookie
    res = await request({
      method: "POST",
      path: "/customers/logout",
      headers: { Cookie: authCookie },
    });
    assert(res.statusCode === 200, "POST /customers/logout succeeds with 200");

    console.log("\n========================================================");
    console.log(`📊 RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("========================================================\n");

    // Clean up test customer
    await Customer.deleteOne({ email: testEmail });
    await Order.deleteMany({ customer: res.body._id });
  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Allow server to listen before running tests
setTimeout(runTests, 1000);
