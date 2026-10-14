import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Loader2 } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';

const ProductCard = ({ product, isWishlisted: propIsWishlisted, onWishlistToggle, onNotify }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, wishlistIds } = useWishlist();
  const navigate = useNavigate();

  const isWishlisted = propIsWishlisted !== undefined ? propIsWishlisted : wishlistIds.has(product._id);

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      const res = await toggleWishlist(product._id);
      if (res.success) {
        if (onNotify) {
          onNotify(res.saved ? 'Added to wishlist' : 'Removed from wishlist', res.saved ? 'success' : 'info');
        }
        if (onWishlistToggle) {
          onWishlistToggle(product._id, res.saved);
        }
      } else {
        if (onNotify) onNotify(res.message || 'Wishlist update failed', 'error');
      }
    } catch (err) {
      if (onNotify) onNotify('Wishlist update failed', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (cartLoading || product.stock < 1) return;

    setCartLoading(true);
    const res = await addToCart(product._id);
    setCartLoading(false);

    if (res.success) {
      setJustAdded(true);
      if (onNotify) onNotify(res.message || 'Added to cart!', 'success');
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      if (onNotify) onNotify(res.message, 'error');
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-[#FFFDF8] rounded-2xl border border-[#E5D9C8] overflow-hidden flex flex-col justify-between hover:shadow-card hover:border-[#D8C5AA] transition-all duration-300">
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] bg-[#E8DCC8]/20 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-[#FFFDF8]/90 backdrop-blur-sm text-[#76685A] text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#E5D9C8]/60 shadow-sm">
          {product.category}
        </span>

        {/* Wishlist Floating Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition shadow-sm backdrop-blur-sm ${
            isWishlisted
              ? 'bg-[#FDF2F2] text-[#A94442] border border-[#F8D7DA]'
              : 'bg-[#FFFDF8]/90 text-[#76685A] hover:text-[#A94442] hover:bg-[#FFFDF8]'
          }`}
        >
          {wishlistLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#80664A]" />
          ) : (
            <Heart
              className={`w-4 h-4 transition ${
                isWishlisted ? 'fill-current text-[#A94442]' : ''
              }`}
            />
          )}
        </button>
      </div>

      {/* Product Details Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-serif font-semibold text-base sm:text-lg text-[#342A22] line-clamp-1 mb-1">
            <Link to={`/products/${product._id}`} className="hover:text-[#80664A] transition">
              {product.name}
            </Link>
          </h3>
          <p className="text-xs sm:text-sm text-[#76685A] line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-4">
            <PriceDisplay amount={product.price} className="text-lg sm:text-xl font-bold" />
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                isOutOfStock
                  ? 'bg-[#FDF2F2] text-[#A94442]'
                  : product.stock < 5
                  ? 'bg-[#FEF9E7] text-[#8A6D3B]'
                  : 'bg-[#E8F4EC] text-[#3D7A5A]'
              }`}
            >
              {isOutOfStock
                ? 'Out of Stock'
                : product.stock < 5
                ? `Only ${product.stock} left`
                : `${product.stock} in stock`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5D9C8]/60">
            <Link
              to={`/products/${product._id}`}
              className="w-full py-2.5 px-3 rounded-xl border border-[#E5D9C8] hover:bg-[#E8DCC8]/30 text-center text-xs sm:text-sm font-semibold text-[#342A22] transition"
            >
              View Details
            </Link>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={cartLoading || isOutOfStock}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs sm:text-sm font-semibold transition ${
                isOutOfStock
                  ? 'bg-[#E8DCC8]/50 text-[#76685A] cursor-not-allowed'
                  : justAdded
                  ? 'bg-[#E8F4EC] text-[#3D7A5A]'
                  : 'bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] shadow-sm'
              }`}
            >
              {cartLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
