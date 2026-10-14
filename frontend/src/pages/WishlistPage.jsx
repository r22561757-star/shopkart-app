import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';

const WishlistPage = () => {
  const { addToCart } = useCart();
  const { wishlistItems, loading, wishlistError: error, fetchWishlist, removeFromWishlist } = useWishlist();

  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Remove single item from wishlist
  const handleRemove = async (productId) => {
    const res = await removeFromWishlist(productId);
    if (res.success) {
      setToast({ message: 'Product removed from wishlist', type: 'info' });
    } else {
      setToast({ message: res.message || 'Failed to remove product from wishlist', type: 'error' });
    }
  };

  // Add to cart from wishlist
  const handleAddToCart = async (product) => {
    if (product.stock < 1) {
      setToast({ message: 'Product is currently out of stock', type: 'error' });
      return;
    }
    const res = await addToCart(product._id);
    if (res.success) {
      setToast({ message: 'Product added to cart!', type: 'success' });
    } else {
      setToast({ message: res.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#80664A]">
          Lab 04 • Persistent Customer Wishlist
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#342A22]">
          My Wishlist
        </h1>
        <p className="text-sm text-[#76685A]">
          Products you've saved to keep track of for later.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Loading your saved pieces..." size="lg" />
        </div>
      ) : error ? (
        <div className="py-12">
          <div className="max-w-md mx-auto p-8 bg-[#FDF2F2] border border-[#F8D7DA] rounded-2xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-[#A94442] mx-auto" />
            <h3 className="text-lg font-serif font-semibold text-[#A94442]">{error}</h3>
            <button
              onClick={fetchWishlist}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#80664A] text-[#FFFDF8] text-xs font-semibold rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Explore our curated collection and save your favorite pieces to revisit anytime."
            actionText="Discover Products"
            actionLink="/products"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#76685A] font-medium">
            Saved items: <span className="font-semibold text-[#342A22]">{wishlistItems.length}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product._id}
                className="bg-[#FFFDF8] rounded-2xl border border-[#E5D9C8] overflow-hidden flex flex-col justify-between hover:shadow-card transition"
              >
                <div className="relative aspect-[4/3] bg-[#E8DCC8]/20 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#FFFDF8]/90 text-[#76685A] text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border border-[#E5D9C8]">
                    {product.category}
                  </span>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FDF2F2] border border-[#F8D7DA] flex items-center justify-center text-[#A94442] hover:bg-[#FBE8E8] transition shadow-sm"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif font-semibold text-base text-[#342A22] line-clamp-1">
                      <Link to={`/products/${product._id}`} className="hover:text-[#80664A]">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#76685A] line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <PriceDisplay amount={product.price} className="text-base font-bold" />
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          product.stock <= 0
                            ? 'bg-[#FDF2F2] text-[#A94442]'
                            : 'bg-[#E8F4EC] text-[#3D7A5A]'
                        }`}
                      >
                        {product.stock <= 0 ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5D9C8]/60">
                      <Link
                        to={`/products/${product._id}`}
                        className="py-2 px-2 text-center text-xs font-semibold rounded-xl border border-[#E5D9C8] hover:bg-[#E8DCC8]/30 transition"
                      >
                        Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1 text-xs font-semibold transition ${
                          product.stock <= 0
                            ? 'bg-[#E8DCC8]/50 text-[#76685A] cursor-not-allowed'
                            : 'bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8]'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
