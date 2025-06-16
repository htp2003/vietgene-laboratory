import React from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa'

interface HeaderProps {
  children?: React.ReactNode;
  isSidebarExpanded?: boolean;
}

export default function Header({ children }: HeaderProps) {
  return (
    <header
      className="h-16 bg-white shadow-md sticky top-0 z-10 flex items-center justify-between px-6 rounded-b-xl backdrop-blur-md"
      style={{ minWidth: 20 }}
    >
      <div className="flex items-center gap-6 min-w-0">
        {children}
        <h2 className="text-xl font-semibold text-gray-800 truncate">Admin</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative">
          <FaBell size={20} className="text-gray-600 hover:text-gray-800 transition-colors" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center gap-2">
          <FaUserCircle size={24} className="text-gray-600" />
          <span className="text-gray-800">Admin</span>
        </div>
      </div>
    </header>
  );
}

