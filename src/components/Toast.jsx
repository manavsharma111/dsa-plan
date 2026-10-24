import React from 'react';
import { useSelector } from 'react-redux';
import { selectToast } from '../store/progressSlice';

export default function Toast() {
  const toast = useSelector(selectToast);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-[#1f1b16] text-[#faf7f5] font-mono text-xs md:text-sm px-4 py-2.5 rounded-lg shadow-xl z-50 transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2">
      <span>{toast}</span>
    </div>
  );
}
