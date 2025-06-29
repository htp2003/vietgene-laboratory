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
import ServicesManagement from "./pages/Admin/ServicesManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import AppointmentService from "./pages/staff/appointment";
import StaffLayout from "./layouts/StaffLayout/StaffLayout";
import UserManagement from "./pages/Admin/UserManagement";
import DoctorManagement from "./pages/Admin/DoctorManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/profile/Profile";
import News from "./pages/News/News";
import NewsDetail from "./pages/news/NewsDetail";
import StaffProfileComponent from "./pages/staff/StaffProfile";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorLayout from "./layouts/DoctorLayout/DoctorLayout";
import DoctorCertificates from "./pages/Doctor/DoctorCertificates";
import DoctorSchedule from "./pages/Doctor/DoctorSchedule";
import Unauthorized from "./pages/Unauthorized";
import StaffAppointments from "./pages/staff/appointment";
import StaffMedicalRecord from "./pages/staff/StaffMedicalRecord";


import StaffMedicalRecordPage from "./pages/staff/StaffMedicalRecord";

export default function useRouteElements() {
  const routeElemets = useRoutes([
    {
      path: "/",
      index: true,
      element: (
        <ProtectedRoute >
          <MainLayout>
            <Home />
          </MainLayout>
        </ProtectedRoute>
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
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/news",
      element: (
        <MainLayout>
          <News />
        </MainLayout>
      ),
    },
    {
      path: "/news/:id",
      element: (
        <MainLayout>
          <NewsDetail />
        </MainLayout>
      ),
    },

    // Add this route to useRouteElements.tsx:

    // {
    //   path: "/api-test",
    //   element: (
    //     <MainLayout>
    //       <APITestPage />
    //     </MainLayout>
    //   ),
    // },

    // Admin
    {
      path: "/admin",
      element: (
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/users",
      element: (
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminLayout>
            <UserManagement />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/doctors",
      element: (
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminLayout>
            <DoctorManagement />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/services",
      element: (
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminLayout>
            <ServicesManagement />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/blog",
      element: (
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminLayout>
            <BlogManagement />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/notification",
      element: (
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminLayout>
            <BlogManagement />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/profile",
      element: (
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AdminLayout>
            <Profile />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },

    // Staff
    {
      path: "/staff",
      element: (

        <ProtectedRoute roles={["ROLE_STAFF"]}>
          <StaffLayout>
            <StaffAppointments />
          </StaffLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/profile",
      element: (

        <ProtectedRoute roles={["ROLE_STAFF"]}>
          <StaffLayout>
            <StaffProfileComponent/>
          </StaffLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/medical-records",
      element: (

        <ProtectedRoute roles={["ROLE_STAFF"]}>
          <StaffLayout>
            <StaffMedicalRecord/>
          </StaffLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/medical-record",
      element: (
        <ProtectedRoute roles={["ROLE_STAFF"]}>
          <StaffLayout>
            <StaffMedicalRecord/>
          </StaffLayout>
        </ProtectedRoute>
      ),
    },

    // Doctor
    {
      path: "/doctor",
      element: (
        <ProtectedRoute roles={["ROLE_DOCTOR"]}>
          <DoctorLayout>
            <DoctorCertificates />
          </DoctorLayout>
        </ProtectedRoute>
      ),
    },
    // {
    //   path: "/doctor/schedule",
    //   element: (
    //     <ProtectedRoute roles={["ROLE_DOCTOR"]}>
    //       <DoctorLayout>
    //         <DoctorSchedule doctorId={doctorId} doctorName={doctorName} />
    //       </DoctorLayout>
    //     </ProtectedRoute>
    //   ),
    // },
    {
      path: "/doctor/certificates",
      element: (
        <ProtectedRoute roles={["ROLE_DOCTOR"]}>
          <DoctorLayout>
            <DoctorCertificates />
          </DoctorLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/unauthorized",
      element: <Unauthorized />,
    },
  ]);
  return routeElemets;
}