import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ShoppingCart, User, LogOut, Menu, X, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition px-3 py-1.5 rounded-lg ${
      isActive
        ? 'text-[#80664A] bg-[#E8DCC8]/50 font-semibold'
        : 'text-[#76685A] hover:text-[#342A22] hover:bg-[#E8DCC8]/20'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-[#E5D9C8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={user ? "/home" : "/products"} className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#80664A] flex items-center justify-center text-[#FFFDF8] shadow-sm group-hover:bg-[#695239] transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#342A22]">
                ShopKart
              </span>
              <span className="text-[10px] tracking-wider uppercase text-[#76685A] font-semibold">
                Mindful Living
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {user && (
              <NavLink to="/home" className={navLinkClass}>
                Home
              </NavLink>
            )}
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
            {user && (
              <>
                <NavLink to="/wishlist" className={navLinkClass}>
                  <span className="flex items-center space-x-1.5">
                    <Heart className="w-4 h-4 text-[#80664A]" />
                    <span>Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</span>
                  </span>
                </NavLink>
                <NavLink to="/orders" className={navLinkClass}>
                  <span className="flex items-center space-x-1.5">
                    <Package className="w-4 h-4 text-[#80664A]" />
                    <span>Orders</span>
                  </span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Desktop Actions & Cart Badge */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Cart Icon with Dynamic Count Badge */}
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl text-[#342A22] hover:bg-[#E8DCC8]/40 transition flex items-center"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-[#80664A]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#80664A] text-[#FFFDF8] text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-sm animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Customer Info Greeting */}
                <div className="flex items-center space-x-2 border-l border-[#E5D9C8] pl-4">
                  <div className="w-8 h-8 rounded-full bg-[#E8DCC8] flex items-center justify-center text-[#80664A] font-semibold text-xs">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-[#342A22] max-w-[120px] truncate">
                    {user.fullName || 'Customer'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-[#76685A] hover:text-[#A94442] hover:bg-[#FDF2F2] rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#80664A] hover:bg-[#E8DCC8]/30 rounded-xl transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] rounded-xl shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            {user && (
              <Link
                to="/cart"
                className="relative p-2 rounded-lg text-[#342A22] hover:bg-[#E8DCC8]/40"
              >
                <ShoppingCart className="w-5 h-5 text-[#80664A]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#80664A] text-[#FFFDF8] text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#342A22] hover:bg-[#E8DCC8]/40 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5D9C8] bg-[#FFFDF8] px-4 pt-3 pb-6 space-y-2 shadow-soft">
          {user ? (
            <>
              <div className="py-2 border-b border-[#E5D9C8] mb-2 flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#E8DCC8] flex items-center justify-center text-[#80664A] font-semibold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#342A22]">{user.fullName}</p>
                  <p className="text-xs text-[#76685A]">{user.email}</p>
                </div>
              </div>

              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#342A22] hover:text-[#80664A]"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#342A22] hover:text-[#80664A]"
              >
                Products
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#342A22] hover:text-[#80664A]"
              >
                Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#342A22] hover:text-[#80664A]"
              >
                My Orders
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#342A22] hover:text-[#80664A]"
              >
                Cart ({cartCount})
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-sm font-semibold text-[#A94442] flex items-center space-x-2 pt-2 border-t border-[#E5D9C8]"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#342A22]"
              >
                Products
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-sm font-semibold text-[#80664A] bg-[#E8DCC8]/40 rounded-xl"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-sm font-semibold bg-[#80664A] text-[#FFFDF8] rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
