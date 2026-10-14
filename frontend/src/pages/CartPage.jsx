import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Loader2 } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';
import QuantityControls from '../components/QuantityControls';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    loading,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const handleQtyChange = async (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1 || newQty > maxStock) return;

    setActionLoadingId(productId);
    const res = await updateQuantity(productId, newQty);
    setActionLoadingId(null);

    if (!res.success) {
      setToast({ message: res.message || 'Could not update quantity', type: 'error' });
    }
  };

  const handleRemove = async (productId) => {
    setActionLoadingId(productId);
    const res = await removeFromCart(productId);
    setActionLoadingId(null);

    if (res.success) {
      setToast({ message: 'Item removed from cart', type: 'info' });
    } else {
      setToast({ message: res.message || 'Could not remove item', type: 'error' });
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
          Lab 05 • Persistent Cart & React Context API
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#342A22]">
          Shopping Cart
        </h1>
        <p className="text-sm text-[#76685A]">
          Review your chosen items before heading to secure checkout.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is currently empty"
            description="Explore our curated collection and add pieces you love to get started."
            actionText="Start Shopping"
            actionLink="/products"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List (Left Column) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5D9C8] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#76685A]">
                  Item Description
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#76685A]">
                  Subtotal
                </span>
              </div>

              <div className="divide-y divide-[#E5D9C8]/60 space-y-6">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const isBusy = actionLoadingId === product._id;
                  const itemSubtotal = product.price * item.quantity;

                  return (
                    <div
                      key={product._id}
                      className={`pt-6 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isBusy ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-[#E8DCC8]/20 border border-[#E5D9C8] flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-[#80664A] tracking-wider">
                            {product.category}
                          </span>
                          <h3 className="font-serif font-semibold text-base text-[#342A22]">
                            <Link
                              to={`/products/${product._id}`}
                              className="hover:text-[#80664A] transition"
                            >
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-[#76685A]">
                            Price: <PriceDisplay amount={product.price} />
                          </p>
                          <span className="inline-block text-[10px] font-semibold text-[#3D7A5A] bg-[#E8F4EC] px-2 py-0.5 rounded">
                            {product.stock} units available
                          </span>
                        </div>
                      </div>

                      {/* Controls and Subtotal */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <QuantityControls
                            quantity={item.quantity}
                            maxStock={product.stock}
                            disabled={isBusy}
                            onIncrement={() =>
                              handleQtyChange(product._id, item.quantity, 1, product.stock)
                            }
                            onDecrement={() =>
                              handleQtyChange(product._id, item.quantity, -1, product.stock)
                            }
                          />

                          <button
                            type="button"
                            onClick={() => handleRemove(product._id)}
                            disabled={isBusy}
                            className="p-2 rounded-xl text-[#76685A] hover:text-[#A94442] hover:bg-[#FDF2F2] transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-[#76685A] sm:hidden">Item Subtotal:</p>
                          <PriceDisplay
                            amount={itemSubtotal}
                            className="text-base sm:text-lg font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-[#80664A] hover:underline"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Order Summary Card (Right Column) */}
          <div className="lg:col-span-4">
            <div className="bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] p-6 sm:p-8 shadow-card space-y-6 sticky top-24">
              <h2 className="font-serif font-bold text-xl text-[#342A22] border-b border-[#E5D9C8] pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#76685A]">
                  <span>Total Units:</span>
                  <span className="font-semibold text-[#342A22]">{cartCount} items</span>
                </div>

                <div className="flex justify-between text-[#76685A]">
                  <span>Subtotal:</span>
                  <PriceDisplay amount={cartSubtotal} className="font-semibold text-[#342A22]" />
                </div>

                <div className="flex justify-between text-[#76685A]">
                  <span>Estimated Delivery:</span>
                  <span className="font-semibold text-[#3D7A5A]">Free Standard</span>
                </div>

                <div className="border-t border-[#E5D9C8] pt-4 flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#342A22]">
                    Total Amount:
                  </span>
                  <PriceDisplay amount={cartSubtotal} className="text-2xl font-bold text-[#80664A]" />
                </div>
              </div>

              {/* Proceed to Checkout Action */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-[#76685A]">
                <ShieldCheck className="w-4 h-4 text-[#80664A]" />
                <span>Protected by Razorpay Test Payments</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
