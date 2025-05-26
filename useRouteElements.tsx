import React from 'react'
import { useRoutes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout/MainLayout'
import Home from './src/pages/Home'
import Login from './src/pages/auth/Login'
import Register from './src/pages/auth/Register'


export default function useRouteElements() {
    const routeElemets = useRoutes([
        {
            path: "/",
            index: true,
            element: (
                <MainLayout>
                    <Home />
                </MainLayout>
            )
        },
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
    ])
    return routeElemets
}
