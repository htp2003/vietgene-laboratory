import React, { useState } from "react";
import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";
import { FaBars } from 'react-icons/fa';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar for desktop */}
            <aside className={`w-64 fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out z-20`}>
                <Sidebar />
            </aside>

            {/* Main content */}
            <div className="flex-1 lg:ml-64">
                <Header>
                    <button
                        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <FaBars size={24} />
                    </button>
                </Header>
                
                <div className="h-16" />
                <main className="p-6 overflow-auto h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0  bg-opacity-50 transition-opacity lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}