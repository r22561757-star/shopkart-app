import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, ShoppingCart, Package, Sparkles, ArrowRight, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import api from '../services/api';

const HomePage = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { wishlistIds } = useWishlist();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const prodRes = await api.get('/products');
        if (prodRes.data.success && Array.isArray(prodRes.data.products)) {
          setFeaturedProducts(prodRes.data.products.slice(0, 4));
        }
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Customer Hero Banner */}
      <section className="bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] p-8 sm:p-12 shadow-card relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8DCC8]/50 border border-[#D8C5AA] text-xs font-semibold text-[#80664A]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authenticated Customer Dashboard</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#342A22] leading-tight">
            Welcome back, <br />
            <span className="text-[#80664A] italic">{user?.fullName || 'Valued Customer'}</span>
          </h1>

          <p className="text-sm sm:text-base text-[#76685A] leading-relaxed">
            Your personal sanctuary for artisan lifestyle goods, crafted essentials, and timeless design.
          </p>

          {/* Customer Profile Details Card (Lab 02 Requirement) */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#F8F4EC] border border-[#E5D9C8]">
              <Mail className="w-4 h-4 text-[#80664A]" />
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-semibold text-[#76685A]">Email Address</p>
                <p className="text-xs font-medium text-[#342A22] truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#F8F4EC] border border-[#E5D9C8]">
              <Phone className="w-4 h-4 text-[#80664A]" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-[#76685A]">Contact Phone</p>
                <p className="text-xs font-medium text-[#342A22]">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Catalogue</span>
            </Link>

            <Link
              to="/cart"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#E8DCC8]/60 hover:bg-[#E8DCC8] text-[#342A22] text-sm font-semibold rounded-xl border border-[#D8C5AA] transition"
            >
              <ShoppingCart className="w-4 h-4 text-[#80664A]" />
              <span>View Cart ({cartCount})</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#E8DCC8]/30 blur-3xl pointer-events-none" />
      </section>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/products"
          className="group p-6 rounded-2xl bg-[#FFFDF8] border border-[#E5D9C8] hover:border-[#D8C5AA] hover:shadow-card transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs uppercase font-semibold text-[#80664A]">Discovery</p>
            <h3 className="font-serif font-bold text-lg text-[#342A22] group-hover:text-[#80664A] transition">
              Products Catalogue
            </h3>
            <p className="text-xs text-[#76685A]">Browse curated lifestyle items</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E8DCC8]/50 flex items-center justify-center text-[#80664A] group-hover:bg-[#80664A] group-hover:text-[#FFFDF8] transition">
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="group p-6 rounded-2xl bg-[#FFFDF8] border border-[#E5D9C8] hover:border-[#D8C5AA] hover:shadow-card transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs uppercase font-semibold text-[#80664A]">Saved Items</p>
            <h3 className="font-serif font-bold text-lg text-[#342A22] group-hover:text-[#80664A] transition">
              My Wishlist
            </h3>
            <p className="text-xs text-[#76685A]">Persistent saved pieces</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E8DCC8]/50 flex items-center justify-center text-[#80664A] group-hover:bg-[#80664A] group-hover:text-[#FFFDF8] transition">
            <Heart className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/orders"
          className="group p-6 rounded-2xl bg-[#FFFDF8] border border-[#E5D9C8] hover:border-[#D8C5AA] hover:shadow-card transition flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs uppercase font-semibold text-[#80664A]">Purchases</p>
            <h3 className="font-serif font-bold text-lg text-[#342A22] group-hover:text-[#80664A] transition">
              Order History
            </h3>
            <p className="text-xs text-[#76685A]">Track verified shipments</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E8DCC8]/50 flex items-center justify-center text-[#80664A] group-hover:bg-[#80664A] group-hover:text-[#FFFDF8] transition">
            <Package className="w-5 h-5" />
          </div>
        </Link>
      </section>

      {/* Featured Products Showcase */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#80664A]">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#342A22]">
              Featured Essentials
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-[#80664A] hover:text-[#695239] flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner message="Loading products..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onNotify={showToast}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
