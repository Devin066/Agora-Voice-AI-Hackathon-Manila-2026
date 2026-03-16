import React from 'react';

export function NavButton({ icon, label, active, onClick, color }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-[72px] h-[64px] transition-all duration-300 ${active ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div 
        className={`mb-1.5 transition-all duration-300 p-3 rounded-[18px] ${active ? 'bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-gray-100/50' : 'hover:bg-gray-50/50'}`}
        style={{ color: active ? color : 'currentColor' }}
      >
        {React.cloneElement(icon, { size: active ? 24 : 22, strokeWidth: active ? 2.5 : 2 })}
      </div>
      <span className={`text-[11px] tracking-widest ${active ? 'font-extrabold' : 'font-semibold'}`}>{label}</span>
    </button>
  );
}
