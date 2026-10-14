import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

// Root redirect handler
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/home" : "/products"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-[#F8F4EC] text-[#342A22]">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
              <Routes>
                {/* Root Redirection */}
                <Route path="/" element={<RootRedirect />} />

                {/* Authentication Routes (Lab 02) */}
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Home Route (Lab 02) */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />

                {/* Product Discovery Routes (Lab 03) */}
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />

                {/* Persistent Wishlist Route (Lab 04) */}
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />

                {/* Shopping Cart Route (Lab 05) */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />

                {/* Checkout & Payments Routes (Lab 06) */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success/:id"
                  element={
                    <ProtectedRoute>
                      <OrderSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-All Route */}
                <Route
                  path="*"
                  element={
                    <div className="py-24 text-center max-w-md mx-auto px-4">
                      <h2 className="text-3xl font-serif font-bold text-[#342A22] mb-2">
                        404 — Page Not Found
                      </h2>
                      <p className="text-sm text-[#76685A] mb-6">
                        The requested page does not exist in ShopKart.
                      </p>
                      <a
                        href="/products"
                        className="inline-flex px-6 py-2.5 bg-[#80664A] text-[#FFFDF8] rounded-xl text-sm font-semibold hover:bg-[#695239] transition"
                      >
                        Return to Catalogue
                      </a>
                    </div>
                  }
                />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-[#E5D9C8] bg-[#FFFDF8]/80 py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#76685A]">
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-[#342A22]">ShopKart</span>
                  <span>— Complete Engineering Labs 01 to 06 Full-Stack Suite</span>
                </div>
                <div>
                  <span>Light Cream & Beige Design System • React + Express + MongoDB</span>
                </div>
              </div>
            </footer>
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
