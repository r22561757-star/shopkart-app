import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto bg-[#FFFDF8] rounded-2xl border border-[#E5D9C8] shadow-card">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[#E8DCC8]/40 flex items-center justify-center mb-5 text-[#80664A]">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-serif font-semibold text-[#342A22] mb-2">{title}</h3>
      <p className="text-sm text-[#76685A] mb-6 leading-relaxed">{description}</p>
      {actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] text-sm font-medium rounded-xl shadow-sm transition"
        >
          {actionText}
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-[#80664A] hover:bg-[#695239] text-[#FFFDF8] text-sm font-medium rounded-xl shadow-sm transition"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;
