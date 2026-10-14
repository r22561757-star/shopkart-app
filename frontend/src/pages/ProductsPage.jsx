import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, RefreshCw, AlertCircle, ShoppingBag, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Books'];

const ProductsPage = () => {
  const { user } = useAuth();
  const { wishlistIds } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');

  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All') params.category = category;
      if (sort && sort !== 'default') params.sort = sort;

      const res = await api.get('/products', { params });
      if (res.data.success && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('default');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Header & Title */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#80664A]">
          Lab 03 • Product Catalogue & Discovery
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#342A22]">
          Our Curated Catalogue
        </h1>
        <p className="text-sm text-[#76685A]">
          Explore premium goods designed for simple living and intentional craftsmanship.
        </p>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E5D9C8] p-4 sm:p-5 shadow-soft space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#76685A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8F4EC]/60 border border-[#E5D9C8] rounded-xl text-sm text-[#342A22] focus:bg-[#FFFDF8] focus:border-[#80664A] focus:outline-none transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-[#76685A] hover:text-[#342A22]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills (or Dropdown on Small Screens) */}
          <div className="md:col-span-4 flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                  category === cat
                    ? 'bg-[#80664A] text-[#FFFDF8] shadow-sm'
                    : 'bg-[#F8F4EC] text-[#76685A] hover:bg-[#E8DCC8]/50 hover:text-[#342A22]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3 flex items-center justify-end space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-[#76685A]" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-2 px-3 bg-[#F8F4EC]/60 border border-[#E5D9C8] rounded-xl text-xs sm:text-sm font-medium text-[#342A22] focus:border-[#80664A] focus:outline-none transition"
            >
              <option value="default">Sort by: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area with Required UI States */}
      <div>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner message="Loading products..." size="lg" />
          </div>
        ) : error ? (
          <div className="py-12">
            <div className="max-w-md mx-auto p-8 bg-[#FDF2F2] border border-[#F8D7DA] rounded-2xl text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-[#A94442] mx-auto" />
              <h3 className="text-lg font-serif font-semibold text-[#A94442]">{error}</h3>
              <p className="text-xs text-[#76685A]">
                Check your backend connection or try reloading.
              </p>
              <button
                type="button"
                onClick={fetchProducts}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] text-xs font-semibold rounded-xl transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={ShoppingBag}
              title="No products found"
              description={
                search || category !== 'All'
                  ? 'No matching products found with your current search and filter combination.'
                  : 'There are currently no products available in the database.'
              }
              actionText="Reset All Filters"
              onAction={handleClearFilters}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#76685A] font-medium">
              Showing <span className="font-semibold text-[#342A22]">{products.length}</span> items
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onNotify={showToast}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
