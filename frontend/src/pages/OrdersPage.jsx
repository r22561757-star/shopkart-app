import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Calendar, AlertCircle, ShoppingBag, RefreshCw } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders');
      if (res.data.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#80664A]">
          Lab 06 • Order History & Verification
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#342A22]">
          My Orders
        </h1>
        <p className="text-sm text-[#76685A]">
          Review all confirmed purchases and verified transactions.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Loading your order history..." size="lg" />
        </div>
      ) : error ? (
        <div className="py-12">
          <div className="max-w-md mx-auto p-8 bg-[#FDF2F2] border border-[#F8D7DA] rounded-2xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-[#A94442] mx-auto" />
            <h3 className="text-lg font-serif font-semibold text-[#A94442]">{error}</h3>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#80664A] text-[#FFFDF8] text-xs font-semibold rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Package}
            title="No orders placed yet"
            description="You haven't placed any orders yet. Discover our collection and place your first order today."
            actionText="Start Shopping"
            actionLink="/products"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-[#76685A] font-medium">
            Total Orders: <span className="font-semibold text-[#342A22]">{orders.length}</span>
          </p>

          <div className="space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={order._id}
                  className="bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] p-6 shadow-card hover:shadow-lift transition-all space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5D9C8] pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-mono font-semibold text-[#342A22]">
                          #{order._id}
                        </span>
                        <span className="text-[#76685A]">•</span>
                        <span className="flex items-center text-[#76685A]">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-[#E8F4EC] text-[#3D7A5A] border border-[#C3E4CD]'
                            : 'bg-[#FEF9E7] text-[#8A6D3B] border border-[#F9E79F]'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>

                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8DCC8]/60 text-[#80664A]">
                        {order.orderStatus || order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 flex flex-wrap gap-3">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 bg-[#F8F4EC] px-3 py-1.5 rounded-xl border border-[#E5D9C8]"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-7 h-7 object-cover rounded-lg"
                            />
                          )}
                          <span className="text-xs font-medium text-[#342A22] max-w-[160px] truncate">
                            {item.name}
                          </span>
                          <span className="text-[11px] font-semibold text-[#76685A]">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="md:col-span-4 flex items-center justify-between md:justify-end md:space-x-6">
                      <div className="text-left md:text-right">
                        <p className="text-[11px] uppercase font-semibold text-[#76685A]">Total Paid</p>
                        <PriceDisplay amount={order.totalAmount} className="text-lg font-bold text-[#80664A]" />
                      </div>

                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] rounded-xl text-xs font-semibold transition"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
