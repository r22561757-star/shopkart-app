import React from 'react';
import { Minus, Plus } from 'lucide-react';

const QuantityControls = ({
  quantity,
  maxStock,
  onIncrement,
  onDecrement,
  disabled = false,
  size = 'md',
}) => {
  const isMin = quantity <= 1;
  const isMax = quantity >= maxStock;

  const btnClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className="inline-flex items-center space-x-2 bg-[#F8F4EC] p-1 rounded-xl border border-[#E5D9C8]">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled || isMin}
        aria-label="Decrease quantity"
        className={`${btnClasses[size]} rounded-lg flex items-center justify-center font-semibold transition ${
          disabled || isMin
            ? 'opacity-40 cursor-not-allowed text-[#76685A]'
            : 'hover:bg-[#E8DCC8] text-[#342A22] active:scale-95'
        }`}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="w-8 text-center text-sm font-semibold text-[#342A22] select-none">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled || isMax}
        aria-label="Increase quantity"
        className={`${btnClasses[size]} rounded-lg flex items-center justify-center font-semibold transition ${
          disabled || isMax
            ? 'opacity-40 cursor-not-allowed text-[#76685A]'
            : 'hover:bg-[#E8DCC8] text-[#342A22] active:scale-95'
        }`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default QuantityControls;
