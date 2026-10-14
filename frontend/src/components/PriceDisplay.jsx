import React from 'react';

const PriceDisplay = ({ amount, className = '' }) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

  return (
    <span className={`font-semibold text-[#342A22] ${className}`}>
      {formatted}
    </span>
  );
};

export default PriceDisplay;
