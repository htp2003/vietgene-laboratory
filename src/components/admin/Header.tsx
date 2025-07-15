import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBell, FaChevronDown, FaCog, FaSignOutAlt } from 'react-icons/fa';
import NotificationDropdown from './notification/notification';


interface HeaderProps {
  children?: React.ReactNode;
  isSidebarExpanded?: boolean;
}

interface AdminUser {
  userId: string;
  username: string;
  email: string;
  full_name?: string;
  fullName?: string;
  roles?: Array<{
    name: string;
    description: string;
  }>;
  role?: string;
}
export default function Header({ children }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log("👤 Admin user data:", userData);
        setUser(userData);
      } catch (error) {
        console.error("❌ Invalid user data in localStorage:", error);
        // Clear invalid data and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      // No auth data, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  // Helper function để hiển thị tên user
  const getUserDisplayName = () => {
    if (!user) return "Admin";
    return user.full_name || user.fullName || user.username || "Admin";
  };

  // Helper function để hiển thị role
  const getUserRole = () => {
    if (!user) return "Administrator";

    // Map roles to Vietnamese
    const roleMap: { [key: string]: string } = {
      ROLE_ADMIN: "Quản trị viên",
      ROLE_STAFF: "Nhân viên",
      ROLE_USER: "Người dùng",
      admin: "Quản trị viên",
      staff: "Nhân viên",
      customer: "Khách hàng",
    };

    // Get role from roles array or fallback to role field
    let roleName = user.role;
    if (user.roles && user.roles.length > 0) {
      roleName = user.roles[0].name;
    }

    return roleMap[roleName || ""] || roleName || "Quản trị viên";
  };

  return (
    <header
      className="h-16 bg-white shadow-md sticky top-0 z-10 flex items-center justify-between px-6 rounded-b-xl backdrop-blur-md"
      style={{ minWidth: 20 }}
    >
      <div className="flex items-center gap-6 min-w-0">
        {children}
        <h2 className="text-xl font-semibold text-gray-800 truncate">
          VietGene Lab - Admin Panel
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors hover:bg-gray-50 p-2 rounded-lg"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUserCircle size={20} className="text-blue-600" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500">{getUserRole()}</p>
            </div>
            <FaChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserCircle size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {getUserRole()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate("/admin/profile"); 
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FaCog className="w-4 h-4 mr-3 text-gray-400" />
                  Cài đặt tài khoản
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="w-4 h-4 mr-3" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}

