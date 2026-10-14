import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success && Array.isArray(res.data.wishlist)) {
        setWishlistItems(res.data.wishlist.filter((item) => item != null));
      }
      setWishlistError(null);
    } catch (err) {
      setWishlistError(err.response?.data?.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Synchronize wishlist whenever customer login status changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Set of product IDs in wishlist for O(1) lookup
  const wishlistIds = useMemo(() => {
    return new Set(wishlistItems.map((item) => (item._id ? item._id : item)));
  }, [wishlistItems]);

  const wishlistCount = useMemo(() => {
    return wishlistItems.length;
  }, [wishlistItems]);

  // Toggle wishlist (Lab 04 Bonus Challenge)
  const toggleWishlist = async (productId) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Please login to save to wishlist' };
    }

    try {
      // Use backend toggle endpoint
      const res = await api.patch(`/wishlist/${productId}/toggle`);
      if (res.data.success) {
        // Refresh full wishlist items from backend to keep populated details in sync
        await fetchWishlist();
        return {
          success: true,
          saved: res.data.saved,
          message: res.data.message,
        };
      }
      return { success: false, message: res.data.message || 'Wishlist action failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating wishlist';
      return { success: false, message: msg };
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to remove from wishlist' };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistIds,
        wishlistCount,
        loading,
        wishlistError,
        fetchWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
