import React, { useState } from "react";
import {
  FaTimes,
  FaBars,
  FaCalendarAlt,
  FaFlask,
  FaHeadset,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navLinks = [
    {
      name: "Lịch hẹn",
      href: "/staff/appointments",
      icon: <FaCalendarAlt size={20} />,
    },
    {
      name: "Yêu cầu xét nghiệm",
      href: "/staff/test-requests",
      icon: <FaFlask size={20} />,
    },
    { name: "Hỗ trợ", href: "/staff/support", icon: <FaHeadset size={20} /> },
    { name: "Hồ sơ", href: "/staff/profile", icon: <FaUser size={20} /> },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-md shadow-lg md:hidden"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Main Content */}
      <main
        className={`
          flex-grow 
          transition-all duration-300 ease-in-out
          ${isExpanded ? "md:ml-64" : "md:ml-20"}
          px-6 py-8
        `}
      >
        <div
          className={`
    container mx-auto
    ${isExpanded ? "max-w-[calc(100%-4rem)]" : "max-w-full"}
  `}
        >
          {children}
        </div>
      </main>

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-full bg-gray-800 text-white shadow-lg
          transition-all duration-300 ease-in-out
          ${isExpanded ? "w-64" : "w-20"}
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {isExpanded && <div className="text-xl font-bold">Vietgene</div>}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-700 rounded-md hidden md:block"
            >
              {isExpanded ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`
                  flex items-center px-4 py-3 hover:bg-gray-700 transition-colors
                  ${!isExpanded && "justify-center"}
                `}
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                {isExpanded && (
                  <span className="ml-3 whitespace-nowrap">{link.name}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
    </div>
  );
};

export default StaffLayout;
