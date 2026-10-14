import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-[#E8F4EC] text-[#3D7A5A] border-[#C3E4CD]',
    error: 'bg-[#FDF2F2] text-[#A94442] border-[#F8D7DA]',
    info: 'bg-[#FFFDF8] text-[#80664A] border-[#E5D9C8]',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#3D7A5A]" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#A94442]" />,
    info: <Info className="w-5 h-5 flex-shrink-0 text-[#80664A]" />,
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center p-4 max-w-md rounded-xl border shadow-lift space-x-3 transition-all duration-300 animate-slide-up ${
        styles[type] || styles.info
      }`}
      role="alert"
    >
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 transition"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
