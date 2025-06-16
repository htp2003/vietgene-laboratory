import React from "react";
import { useRoutes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout/MainLayout";
import Home from "./src/pages/Home";
import Login from "./src/pages/auth/Login";
import Register from "./src/pages/auth/Register";
import Services from "./src/pages/services/Services";
import ServiceDetail from "./src/pages/services/ServiceDetail";
import OrderBooking from "./src/pages/order/OrderBooking";
import OrderSuccess from "./src/pages/order/OrderSuccess";
import CustomerDashboard from "./src/pages/dashboard/CustomerDashboard";
import OrderDetail from "./src/pages/order/OrderDetail";
import About from "./src/pages/About";
import Contact from "./src/pages/Contact";
import ProtectedRoute from "./src/components/ProtectedRoute";
import Profile from "./src/pages/profile/Profile";
import News from "./src/pages/News/News";
export default function useRouteElements() {
  const routeElemets = useRoutes([
    {
      path: "/",
      index: true,
      element: (
        <ProtectedRoute>
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
  ]);
  return routeElemets;
}
