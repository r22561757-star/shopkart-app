import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      }
      setCartError(null);
    } catch (err) {
      setCartError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Synchronize cart whenever customer login status changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (productId) => {
    try {
      setCartError(null);
      const res = await api.post(`/cart/${productId}`);
      if (res.data.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Could not add to cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error adding product to cart';
      setCartError(msg);
      return { success: false, message: msg };
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      setCartError(null);
      const res = await api.patch(`/cart/${productId}`, { quantity });
      if (res.data.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating cart quantity';
      setCartError(msg);
      return { success: false, message: msg };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setCartError(null);
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error removing item from cart';
      setCartError(msg);
      return { success: false, message: msg };
    }
  };

  // Clear cart after confirmed payment
  const clearCart = () => {
    setCartItems([]);
  };

  // Derived values: Total units count and Subtotal
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * (item.quantity || 0);
    }, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        loading,
        cartError,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
