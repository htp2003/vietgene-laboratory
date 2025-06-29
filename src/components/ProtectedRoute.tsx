

import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Danh sách role được phép truy cập
}

// Hàm kiểm tra user có role phù hợp không
const hasRequiredRole = (user: any, allowedRoles: string[]) => {
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  return user.roles.some((r: any) => allowedRoles.includes(r.name));
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user: any = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    user = null;
  }

  // Nếu chưa login, redirect về login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có truyền roles, kiểm tra quyền
  if (roles && roles.length > 0) {
    if (!hasRequiredRole(user, roles)) {
      // Có thể tạo trang /unauthorized hoặc hiện thông báo
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
