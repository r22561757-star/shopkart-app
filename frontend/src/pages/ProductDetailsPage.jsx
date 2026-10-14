import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Check, AlertCircle, Loader2, PackageCheck } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';
import QuantityControls from '../components/QuantityControls';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { toggleWishlist, wishlistIds } = useWishlist();

  const isWishlisted = wishlistIds.has(id);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/products/${id}`);
        if (res.data.success && res.data.product) {
          setProduct(res.data.product);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        if (err.response?.status === 400) {
          setError('Invalid Product ID format');
        } else if (err.response?.status === 404) {
          setError('Product not found in catalogue');
        } else {
          setError('Error loading product details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      const res = await toggleWishlist(id);
      if (res.success) {
        setToast({
          message: res.saved ? 'Added to wishlist' : 'Removed from wishlist',
          type: res.saved ? 'success' : 'info',
        });
      } else {
        setToast({ message: res.message || 'Wishlist update failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Wishlist update failed', type: 'error' });
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product || product.stock < 1 || cartLoading) return;

    try {
      setCartLoading(true);
      // If adding multiple units, add once then set quantity if needed
      const addRes = await addToCart(product._id);
      if (addRes.success && quantity > 1) {
        await updateQuantity(product._id, quantity);
      }

      setCartLoading(false);
      if (addRes.success) {
        setJustAdded(true);
        setToast({ message: `Added ${quantity} unit(s) to cart`, type: 'success' });
        setTimeout(() => setJustAdded(false), 2000);
      } else {
        setToast({ message: addRes.message, type: 'error' });
      }
    } catch (err) {
      setCartLoading(false);
      setToast({ message: 'Error adding to cart', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading product details..." size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="p-8 bg-[#FFFDF8] border border-[#E5D9C8] rounded-3xl shadow-card space-y-4">
          <AlertCircle className="w-12 h-12 text-[#A94442] mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-[#342A22]">{error || 'Product Not Found'}</h2>
          <p className="text-sm text-[#76685A]">
            The product you are looking for may have been removed or the link is invalid.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#80664A] text-[#FFFDF8] rounded-xl text-sm font-semibold hover:bg-[#695239] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalogue</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-[#76685A] hover:text-[#80664A] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      {/* Product Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Large Product Image (Left Column) */}
        <div className="lg:col-span-6 bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] overflow-hidden shadow-card p-4 sm:p-6">
          <div className="aspect-square bg-[#E8DCC8]/20 rounded-2xl overflow-hidden relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            <span className="absolute top-4 left-4 bg-[#FFFDF8]/90 backdrop-blur-sm text-[#76685A] text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#E5D9C8]/60 shadow-sm">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Information & Purchase Area (Right Column) */}
        <div className="lg:col-span-6 space-y-6 bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] p-6 sm:p-8 shadow-card">
          <div className="space-y-2 border-b border-[#E5D9C8] pb-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#80664A]">
              Category: {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#342A22]">
              {product.name}
            </h1>
            <div className="pt-2 flex items-baseline space-x-4">
              <PriceDisplay amount={product.price} className="text-3xl font-bold" />
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
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
                  ? `Hurry, only ${product.stock} units left!`
                  : `${product.stock} units available in stock`}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#76685A]">
              Product Overview
            </h3>
            <p className="text-sm sm:text-base text-[#342A22] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Features Highlights */}
          <div className="py-4 border-y border-[#E5D9C8] grid grid-cols-2 gap-4 text-xs text-[#76685A]">
            <div className="flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-[#80664A]" />
              <span>Authentic Artisan Quality</span>
            </div>
            <div className="flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-[#80664A]" />
              <span>Secure Razorpay Test Checkout</span>
            </div>
          </div>

          {/* Quantity Controls & Action Buttons */}
          <div className="space-y-4 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#342A22]">
                  Quantity:
                </span>
                <QuantityControls
                  quantity={quantity}
                  maxStock={product.stock}
                  onIncrement={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartLoading || isOutOfStock}
                className={`py-3 px-6 rounded-xl flex items-center justify-center space-x-2 text-sm font-semibold transition ${
                  isOutOfStock
                    ? 'bg-[#E8DCC8]/50 text-[#76685A] cursor-not-allowed'
                    : justAdded
                    ? 'bg-[#E8F4EC] text-[#3D7A5A]'
                    : 'bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] shadow-sm active:scale-[0.99]'
                }`}
              >
                {cartLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`py-3 px-6 rounded-xl border flex items-center justify-center space-x-2 text-sm font-semibold transition ${
                  isWishlisted
                    ? 'bg-[#FDF2F2] border-[#F8D7DA] text-[#A94442] hover:bg-[#FBE8E8]'
                    : 'bg-[#F8F4EC] border-[#E5D9C8] text-[#342A22] hover:bg-[#E8DCC8]/50'
                }`}
              >
                {wishlistLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#80664A]" />
                ) : (
                  <>
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? 'fill-current text-[#A94442]' : 'text-[#80664A]'
                      }`}
                    />
                    <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
