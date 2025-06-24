import React, { useState } from "react";
import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";
import { FaBars } from 'react-icons/fa';
// import { useBlogPosts } from '../../hooks/useBlogPosts';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Toggle sidebar (desktop)
    const handleToggleSidebar = () => setIsSidebarExpanded((prev) => !prev);
    // Toggle sidebar (mobile)
    const handleToggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

    // const { posts } = useBlogPosts();
    // const pendingBlogCount = posts.filter(post => post.status === 'pending').length;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out 
                ${isSidebarExpanded ? 'w-64' : 'w-20'}
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <Sidebar
                    isExpanded={isSidebarExpanded}
                    onToggleSidebar={handleToggleSidebar}
                    isMobileOpen={isMobileSidebarOpen}
                    onToggleMobileSidebar={handleToggleMobileSidebar}

                />
            </aside>

            {/* Main content */}
            <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
                <main className="p-6 overflow-auto h-[calc(100vh-4rem)]">
                    <Header>
                        <button
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
                            onClick={handleToggleMobileSidebar}
                        >
                            <FaBars size={24} />
                        </button>
                    </Header>
                    <div className="h-4" />
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
                    onClick={handleToggleMobileSidebar}
                />
            )}
        </div>
    );
}