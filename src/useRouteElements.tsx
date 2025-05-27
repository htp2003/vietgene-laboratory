import React from 'react'
import { useRoutes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout/MainLayout'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLayout from './layouts/AdminLayout/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ServicesManagement from './pages/Admin/ServicesManagement'
import UserManagement from './pages/Admin/UserManagement'
import BlogManagement from './pages/Admin/BlogManagement'


export default function useRouteElements() {
    const routeElemets = useRoutes([
        {
            path: "/login",
            index: true,
            element: (
                <Login />
            )
        },
        {
            path: "/register",
            index: true,
            element: (
                <Register />
            )
        },
        // Customer Dashboard
        {
            path: "/",
            index: true,
            element: (
                <MainLayout>
                    <Home />
                </MainLayout>
            )
        },
        // Admin Dashboard
        {
            path: "/admin",
            index: true,
            element: (
                <AdminLayout>
                    <AdminDashboard />
                </AdminLayout>
            )
        },
        {
            path: "/admin/users",
            index: true,
            element: (
                <AdminLayout>
                    <UserManagement />
                </AdminLayout>
            )
        },
        {
            path: "/admin/services",
            index: true,
            element: (
                <AdminLayout>
                    <ServicesManagement />
                </AdminLayout>
            )
        },
        {
            path: "/admin/blog",
            index: true,
            element: (
                <AdminLayout>
                    <BlogManagement />
                </AdminLayout>
            )
        },

        // Staff Dashboard
        
    ])
    return routeElemets
}
