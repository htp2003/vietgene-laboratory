import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaVial,
  FaBlog,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes
} from 'react-icons/fa';

interface MenuItem {
  title: string
  path: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/admin', icon: <FaHome size={20} /> },
  { title: 'Users', path: '/admin/users', icon: <FaUsers size={20} /> },
  { title: 'Doctors', path: '/admin/doctors', icon: <FaUsers size={20} /> },
  { title: 'Services', path: '/admin/services', icon: <FaVial size={20} /> },
  { title: 'Blog', path: '/admin/blog', icon: <FaBlog size={20} /> },
  { title: 'Appointments', path: '/admin/appointments', icon: <FaCalendarAlt size={20} /> },
  { title: 'Reports', path: '/admin/reports', icon: <FaChartBar size={20} /> },
  { title: 'Settings', path: '/admin/settings', icon: <FaCog size={20} /> }
]

interface SidebarProps {
  isExpanded: boolean;
  onToggleSidebar: () => void;
  isMobileOpen: boolean;
  onToggleMobileSidebar: () => void;
}

export default function Sidebar({ isExpanded, onToggleSidebar, isMobileOpen, onToggleMobileSidebar }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 right-4 z-50 p-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 md:hidden"
        onClick={onToggleMobileSidebar}
      >
        {isMobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-full
          bg-gradient-to-b from-red-700 via-red-800 to-red-900
          text-white shadow-2xl backdrop-blur-lg
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          z-40
        `}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/20 to-transparent opacity-50"></div>
        <div className="flex flex-col h-full relative z-10">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-red-600/30">
            {isExpanded && (
              <div className="text-2xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                Vietgene Admin
              </div>
            )}
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-red-600/50 rounded-xl transition-all duration-200 transform hover:scale-110 hidden md:block backdrop-blur-sm"
            >
              {isExpanded ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-6 space-y-2 px-4">
            {menuItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center px-4 py-4 relative
                  hover:bg-gradient-to-r hover:from-red-600/50 hover:to-red-500/50
                  rounded-xl transition-all duration-300 ease-in-out
                  transform hover:scale-105 hover:shadow-lg
                  backdrop-blur-sm border border-transparent
                  hover:border-red-400/30
                  ${!isExpanded && 'justify-center'}
                  ${location.pathname === item.path ? 'bg-gradient-to-r from-red-600/70 to-red-700/70 border-red-400/40' : ''}
                `}
                onClick={onToggleMobileSidebar}
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <span className="flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:text-red-100">
                  {item.icon}
                </span>
                {isExpanded && (
                  <span className="ml-4 whitespace-nowrap font-medium text-red-50 group-hover:text-white transition-all duration-300">
                    {item.title}
                  </span>
                )}
                {/* Hover indicator */}
                <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></div>
              </Link>
            ))}
          </div>

          {/* Bottom decoration */}
          <div className="p-4 border-t border-red-600/30">
            <div className="flex items-center justify-center">
              <div className="w-8 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-400/20 via-transparent to-red-800/20"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-red-400/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={onToggleMobileSidebar}
        />
      )}
    </>
  );
}
