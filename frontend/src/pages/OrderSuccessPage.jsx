import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ShoppingBag, ArrowRight, MapPin, Calendar } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
        } else {
          setError('Order details could not be retrieved');
        }
      } catch (err) {
        setError('Error retrieving order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Retrieving order confirmation..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Badge Banner */}
      <div className="bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] p-8 sm:p-12 text-center shadow-card space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E8F4EC] border border-[#C3E4CD] flex items-center justify-center mx-auto text-[#3D7A5A]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest font-semibold text-[#3D7A5A]">
          Payment Verified • Order Placed
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#342A22]">
          Thank You for Your Order!
        </h1>

        <p className="text-sm text-[#76685A] max-w-lg mx-auto">
          Your payment was verified via HMAC-SHA256 test signature. Your order has been placed successfully and your cart has been cleared.
        </p>

        {order && (
          <div className="pt-2 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F8F4EC] border border-[#E5D9C8] text-xs font-mono text-[#342A22]">
            <span>Order Reference:</span>
            <span className="font-bold">{order._id}</span>
          </div>
        )}

        <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#E8DCC8]/60 hover:bg-[#E8DCC8] text-[#342A22] text-sm font-semibold rounded-xl border border-[#D8C5AA] transition"
          >
            <ShoppingBag className="w-4 h-4 text-[#80664A]" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Historical Order Snapshot Card */}
      {order && (
        <div className="bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] p-6 sm:p-8 shadow-card space-y-6">
          <h2 className="font-serif font-bold text-xl text-[#342A22] border-b border-[#E5D9C8] pb-4">
            Order Summary Snapshot
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#76685A] border-b border-[#E5D9C8] pb-4">
            <div>
              <p className="font-semibold text-[#342A22]">Payment Status:</p>
              <span className="inline-block mt-1 font-semibold text-[#3D7A5A] bg-[#E8F4EC] px-2 py-0.5 rounded">
                {order.paymentStatus}
              </span>
            </div>
            <div>
              <p className="font-semibold text-[#342A22]">Order Status:</p>
              <span className="inline-block mt-1 font-semibold text-[#80664A] bg-[#E8DCC8]/60 px-2 py-0.5 rounded">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="divide-y divide-[#E5D9C8]/60 space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="pt-4 first:pt-0 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl bg-[#E8DCC8]/20 border border-[#E5D9C8]"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-sm text-[#342A22]">{item.name}</h4>
                    <p className="text-xs text-[#76685A]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <PriceDisplay amount={item.price * item.quantity} className="text-sm font-semibold" />
              </div>
            ))}
          </div>

          {/* Shipping Address Summary */}
          {order.shippingAddress && (
            <div className="pt-4 border-t border-[#E5D9C8] text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-[#342A22]">
                <MapPin className="w-3.5 h-3.5 text-[#80664A]" />
                <span>Shipping Destination:</span>
              </div>
              <p className="text-[#76685A]">
                {order.shippingAddress.fullName} • {order.shippingAddress.phone}
              </p>
              <p className="text-[#76685A]">
                {order.shippingAddress.addressLine}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} - {order.shippingAddress.pinCode}
              </p>
            </div>
          )}

          {/* Total Amount */}
          <div className="pt-4 border-t border-[#E5D9C8] flex justify-between items-baseline">
            <span className="font-serif font-bold text-base text-[#342A22]">Total Paid:</span>
            <PriceDisplay amount={order.totalAmount} className="text-2xl font-bold text-[#80664A]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccessPage;
