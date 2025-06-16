import React from "react";
import { useRoutes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Services from "./pages/services/Services";
import ServiceDetail from "./pages/services/ServiceDetail";
import OrderBooking from "./pages/order/OrderBooking";
import OrderSuccess from "./pages/order/OrderSuccess";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import OrderDetail from "./pages/order/OrderDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ServicesManagement from "./pages/Admin/ServicesManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import StaffAppointments from "./pages/staff/appointment";
import StaffLayout from "./layouts/StaffLayout/StaffLayout";
import UserManagement from "./pages/Admin/UserManagement";
import DoctorManagement from "./pages/Admin/DoctorManagement";
export default function useRouteElements() {
  const routeElemets = useRoutes([
    {
      path: "/",
      index: true,
      element: (
        <MainLayout>
          <Home />
        </MainLayout>
      ),
    },
    {
      path: "/login",
      index: true,
      element: <Login />,
    },
    {
      path: "/register",
      index: true,
      element: <Register />,
    },

    // Customer
    {
      path: "/services",
      element: (
        <MainLayout>
          <Services />
        </MainLayout>
      ),
    },
    {
      path: "/services/:id",
      element: (
        <MainLayout>
          <ServiceDetail />
        </MainLayout>
      ),
    },
    {
      path: "/order/:id",
      element: (
        <MainLayout>
          <OrderBooking />
        </MainLayout>
      ),
    },
    {
      path: "/order/success",
      element: (
        <MainLayout>
          <OrderSuccess />
        </MainLayout>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <MainLayout>
          <CustomerDashboard />
        </MainLayout>
      ),
    },
    {
      path: "/orders/:id",
      element: (
        <MainLayout>
          <OrderDetail />
        </MainLayout>
      ),
    },
    {
      path: "/about",
      element: (
        <MainLayout>
          <About />
        </MainLayout>
      ),
    },
    {
      path: "/contact",
      element: (
        <MainLayout>
          <Contact />
        </MainLayout>
      ),
    },

    // Admin
    {
      path: "/admin",
      element: (
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      ),
    },
    {
      path: "/admin/users",
      element: (
        <AdminLayout>
          <UserManagement />
        </AdminLayout>
      ),
    },
    {
      path: "/admin/doctors",
      element: (
        <AdminLayout>
          <DoctorManagement />
        </AdminLayout>
      ),
    },
    {
      path: "/admin/services",
      element: (
        <AdminLayout>
          <ServicesManagement />
        </AdminLayout>
      ),
    },
    {
      path: "/admin/blog",
      element: (
        <AdminLayout>
          <BlogManagement />
        </AdminLayout>
      ),
    },

    // Staff
    {
      path: "/staff",
      element: (
        <StaffLayout>
          <StaffAppointments/>
        </StaffLayout>
      ),
    },
  ]);
  return routeElemets;
}
