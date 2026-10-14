# ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack, database-driven MERN e-commerce application integrating all six engineering labs (Labs 01 to 06) into one cohesive, production-ready system with a warm, minimalist **light cream and beige design theme**.

---

## 🎨 Design System: Light Cream & Beige

The visual theme strictly implements the requested design tokens:
- **Main page background:** `#F8F4EC`
- **Card background:** `#FFFDF8`
- **Primary beige:** `#E8DCC8`
- **Secondary beige:** `#D8C5AA`
- **Primary text:** `#342A22`
- **Secondary text:** `#76685A`
- **Primary button:** `#80664A` (hover `#695239`)
- **Border:** `#E5D9C8`
- **Status accents:** Muted Green (`#3D7A5A`), Brick Red (`#A94442`), Amber (`#8A6D3B`)

---

## 🚀 Lab Features & Breakdown

### Lab 01 — Customer Authentication Service (Backend)
- Customer Mongoose model with `fullName`, `email` (unique), `password` (bcrypt hash), `phone`, `wishlist` array, and `cart` array.
- Password hashing with **bcrypt** (salt rounds = 10); passwords are never stored or returned in plaintext.
- JWT token generation via `jsonwebtoken` with 7-day expiration.
- Secure session storage using **HttpOnly cookies** (`token`) with `sameSite: 'lax'` / `'none'` and path `/`.
- Protected profile API (`GET /customers/me`) using JWT verification middleware.
- Secure logout (`POST /customers/logout`) clearing the HttpOnly cookie.
- Bonus Challenge: Change Password endpoint (`PATCH /customers/change-password`).

### Lab 02 — React Authentication & Home Flow (Frontend)
- Customer-facing registration page (`/register`) with client-side field validation (name, email, password $\ge 6$ chars, 10-digit phone).
- Customer login page (`/login`) with `withCredentials: true` and clear "Invalid Credentials" feedback for HTTP 401.
- Protected customer dashboard (`/home`) fetching profile from `GET /customers/me` with session expiration handling.
- `ProtectedRoute` component guarding authenticated views and redirecting unauthenticated visitors.

### Lab 03 — Product Catalogue & Discovery
- Product collection schema with `name`, `description`, `price` ($>0$), `category`, `image`, and `stock` ($\ge 0$).
- Open product creation endpoint (`POST /products`).
- Query-driven discovery API (`GET /products`) supporting case-insensitive `search`, exact `category` filtering, and sorting (`price_asc`, `price_desc`).
- Single product retrieval API (`GET /products/:id`) with ObjectId format validation.
- Responsive catalogue UI (`/products`) and detailed view (`/products/:id`) with stock indicators and state handlers (loading, error with retry, empty state).

### Lab 04 — Persistent Customer Wishlist
- MongoDB-backed wishlist stored as Product ObjectId references on the Customer document.
- Protected APIs: `POST /wishlist/:productId`, `GET /wishlist`, and `DELETE /wishlist/:productId`.
- Duplicate prevention: rejects duplicate entries with HTTP 409 Conflict.
- Mongoose `.populate("wishlist")` to return current product prices, stock, and details.
- Wishlist page (`/wishlist`) utilizing component-level state and backend persistence (no Redux / Context per Lab 04 constraint).

### Lab 05 — Persistent Shopping Cart
- MongoDB cart items stored as `{ product: ObjectId, quantity: Number }` on the Customer document.
- Protected cart APIs: `POST /cart/:productId` (adds item or increments quantity), `GET /cart`, `PATCH /cart/:productId` (validates integer $\ge 1$ and stock limits), and `DELETE /cart/:productId`.
- Global state management via **React Context API** (`CartContext`) maintaining synchronized items, total units count, and cart subtotal.
- Real-time cart count badge in the Navbar updating instantly upon cart mutations.
- Interactive cart page (`/cart`) with stock-capped `+` / `-` quantity controls, per-item subtotals, and empty state.

### Lab 06 — Checkout, Razorpay Test Mode & Orders
- Order collection storing customer reference, item snapshots (name, historical price, quantity, image), validated shipping address, total amount, payment status, and order status.
- Server-side price calculation and stock verification (`POST /orders/create-payment-order`) rejecting client-supplied totals.
- **Razorpay Standard Checkout** integration in Test Mode with fallback test verification simulator.
- Cryptographic payment verification (`POST /orders/verify-payment`) using Node's built-in `crypto` HMAC-SHA256 signature verification.
- Stock decrement and customer cart clearing performed only after verified payment.
- Order confirmation view (`/order-success/:id`), order history list (`/orders`), and single order snapshot details (`/orders/:id`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router DOM v6, Axios, Lucide React Icons |
| **Backend** | Node.js, Express.js 4, Mongoose 8, bcrypt, jsonwebtoken, cookie-parser, cors, dotenv |
| **Database** | MongoDB (v8.3+) |
| **Payments** | Razorpay SDK (Test Mode) + Node.js `crypto` for HMAC-SHA256 verification |

---

## 📁 Project Structure

```text
shopkart app/
├── backend/
│   ├── config/
│   │   ├── db.js                         # Mongoose connection
│   │   └── razorpay.js                   # Razorpay SDK configuration
│   ├── controllers/
│   │   ├── customer.controller.js        # Lab 01: Auth, profile, logout, change password
│   │   ├── product.controller.js         # Lab 03: Product catalogue, filters, sorting
│   │   ├── wishlist.controller.js        # Lab 04: Persistent wishlist
│   │   ├── cart.controller.js            # Lab 05: Persistent shopping cart
│   │   └── order.controller.js           # Lab 06: Server-side pricing & HMAC signature
│   ├── middlewares/
│   │   ├── auth.middleware.js            # JWT cookie verification
│   │   └── error.middleware.js           # Centralized JSON error handling
│   ├── models/
│   │   ├── customer.model.js             # Customer schema with wishlist & cart refs
│   │   ├── product.model.js              # Product schema
│   │   └── order.model.js                # Order schema with snapshots & statuses
│   ├── routes/
│   │   ├── customer.routes.js            # /customers/*
│   │   ├── product.routes.js             # /products/*
│   │   ├── wishlist.routes.js            # /wishlist/*
│   │   ├── cart.routes.js                # /cart/*
│   │   └── order.routes.js               # /orders/*
│   ├── seed/
│   │   └── seedProducts.js               # Realistic seed data across 4 categories
│   ├── tests/
│   │   └── api.test.js                   # 35-test integration suite covering Labs 01-06
│   ├── utils/
│   │   └── generateToken.js              # JWT generator & cookie options
│   ├── .env.example
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Responsive navbar with cart badge
│   │   │   ├── ProductCard.jsx           # Card with wishlist & cart integration
│   │   │   ├── ProtectedRoute.jsx        # Route authentication guard
│   │   │   ├── QuantityControls.jsx      # Stock-aware quantity buttons
│   │   │   ├── PriceDisplay.jsx          # INR currency formatter
│   │   │   ├── LoadingSpinner.jsx        # Warm loading spinner
│   │   │   ├── EmptyState.jsx            # Reusable empty card
│   │   │   └── Toast.jsx                 # Notification toasts
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Customer session state
│   │   │   └── CartContext.jsx           # React Context API for cart state
│   │   ├── pages/
│   │   │   ├── RegisterPage.jsx          # /register
│   │   │   ├── LoginPage.jsx             # /login
│   │   │   ├── HomePage.jsx              # /home
│   │   │   ├── ProductsPage.jsx          # /products
│   │   │   ├── ProductDetailsPage.jsx    # /products/:id
│   │   │   ├── WishlistPage.jsx          # /wishlist
│   │   │   ├── CartPage.jsx              # /cart
│   │   │   ├── CheckoutPage.jsx          # /checkout
│   │   │   ├── OrderSuccessPage.jsx      # /order-success/:id
│   │   │   ├── OrdersPage.jsx            # /orders
│   │   │   └── OrderDetailsPage.jsx      # /orders/:id
│   │   ├── services/
│   │   │   └── api.js                    # Axios instance with withCredentials: true
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher; tested on v26)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### 2. Environment Configuration
The backend comes pre-configured with a `.env` file (`backend/.env`):
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=shopkart_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_shopkart_mock_id
RAZORPAY_KEY_SECRET=shopkart_test_mock_secret_key
NODE_ENV=development
```
*(Note: Port 5001 is used because macOS AirPlay Receiver reserves port 5000 by default).*

### 3. Seed Products Database
Populate 15 realistic products across Electronics, Fashion, Home, and Books:
```bash
cd backend
npm run seed
```

### 4. Run Automated Backend Test Suite
Run the comprehensive 35-test integration test suite covering Labs 01 through 06:
```bash
cd backend
npm test
```

### 5. Start the Development Servers
In terminal 1 (Backend):
```bash
cd backend
npm start
# Server starts on http://localhost:5001
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Comprehensive API Route Summary

| Module | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/customers/register` | Public | Register customer; returns 201 |
| **Auth** | `POST` | `/customers/login` | Public | Authenticate & set HttpOnly cookie |
| **Auth** | `GET` | `/customers/me` | Protected | Get authenticated customer profile |
| **Auth** | `POST` | `/customers/logout` | Protected | Clear HttpOnly JWT cookie |
| **Auth** | `PATCH` | `/customers/change-password` | Protected | Verify old password & hash new password |
| **Products** | `POST` | `/products` | Public | Create product with price & stock validation |
| **Products** | `GET` | `/products` | Public | Search, category filter & sort products |
| **Products** | `GET` | `/products/:id` | Public | Fetch product by MongoDB ObjectId |
| **Wishlist** | `POST` | `/wishlist/:productId` | Protected | Add product to customer wishlist |
| **Wishlist** | `GET` | `/wishlist` | Protected | Retrieve populated wishlist items |
| **Wishlist** | `DELETE` | `/wishlist/:productId` | Protected | Remove product from wishlist |
| **Cart** | `POST` | `/cart/:productId` | Protected | Add to cart or increment quantity (stock capped) |
| **Cart** | `GET` | `/cart` | Protected | Fetch populated customer cart |
| **Cart** | `PATCH` | `/cart/:productId` | Protected | Update quantity ($\ge 1$, $\le$ available stock) |
| **Cart** | `DELETE` | `/cart/:productId` | Protected | Remove item from customer cart |
| **Orders** | `POST` | `/orders/create-payment-order` | Protected | Verify stock, compute price & create order |
| **Orders** | `POST` | `/orders/verify-payment` | Protected | HMAC-SHA256 signature check & place order |
| **Orders** | `GET` | `/orders` | Protected | List customer orders (newest first) |
| **Orders** | `GET` | `/orders/:id` | Protected | Get historical order snapshot (ownership check) |

---

## 🎓 Viva Questions & Key Explanations (TA Evaluation)

### 1. Why do we use bcrypt instead of encrypting passwords?
Encryption is a **two-way** process (the encrypted ciphertext can be decrypted back to plaintext if the key is compromised). Passwords should never be reversible. **bcrypt** is a **one-way cryptographic hash function** with an adaptive salt and configurable cost factor (work factor). Even if the database is leaked, rainbow tables are ineffective due to salts, and brute-force attacks are computationally prohibitive.

### 2. What information is typically stored inside a JWT payload?
Non-sensitive identity claims such as the customer's database ID (`id`), issuance timestamp (`iat`), and expiration (`exp`). Passwords, credit card numbers, and sensitive secrets should **never** be placed inside a JWT payload because JWTs are simply base64url-encoded and can be read by anyone.

### 3. Why is the HttpOnly flag important for cookies?
The `HttpOnly` flag prevents client-side JavaScript (`document.cookie`) from accessing the cookie. This protects against **Cross-Site Scripting (XSS)** attacks, ensuring malicious third-party scripts cannot steal authentication tokens.

### 4. Why should passwords never be returned to the frontend?
Returning password hashes in API responses exposes sensitive cryptographic hashes to the network and browser logs, increasing vulnerability to offline hash cracking (e.g. Hashcat).

### 5. What is the purpose of authentication middleware?
Authentication middleware intercepts requests to protected endpoints, verifies the customer's session (e.g., verifying the JWT and ensuring the account still exists in MongoDB), attaches the safe customer entity to `req.user`, and rejects unauthenticated or expired requests with HTTP 401 before any business logic is executed.
