import React, { useState } from 'react'
import Header from "../../components/admin/Header";
import { FaBars, FaCalendarAlt, FaClipboardList, FaUserMd, FaCog } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';


interface DoctorLayoutProps {
    children: React.ReactNode;
}

interface DoctorMenuItem {
    title: string;
    path: string;
    icon: React.ReactNode;
}

const doctorMenuItems: DoctorMenuItem[] = [
    { title: 'Dashboard', path: '/doctor', icon: <FaCalendarAlt size={20} /> },
    { title: 'Lịch hẹn  ', path: '/doctor/schedule', icon: <FaClipboardList size={20} /> },
    { title: 'Chứng chỉ', path: '/doctor/certificates', icon: <FaUserMd size={20} /> },
    { title: 'Cài đặt', path: '/doctor/settings', icon: <FaCog size={20} /> }
];

export default function DoctorLayout({ children }: DoctorLayoutProps) {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation();

    const handleToggleSidebar = () => setIsSidebarExpanded((prev) => !prev);
    const handleToggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev)

    return (
<div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Doctor Sidebar - Inline */}
            <nav
                className={`
                    fixed top-0 left-0 h-full
                    bg-gradient-to-b from-green-700 via-green-800 to-green-900
                    text-white shadow-2xl backdrop-blur-lg
                    transition-all duration-300 ease-in-out
                    ${isSidebarExpanded ? 'w-64' : 'w-20'}
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    z-40
                `}
            >
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-600/20 to-transparent opacity-50"></div>
                <div className="flex flex-col h-full relative z-10">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-6 border-b border-green-600/30">
                        {isSidebarExpanded && (
                            <div className="text-2xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                                Doctor Panel
                            </div>
                        )}
                        <button
                            onClick={handleToggleSidebar}
                            className="p-2 hover:bg-green-600/50 rounded-xl transition-all duration-200 transform hover:scale-110 hidden md:block backdrop-blur-sm"
                        >
                            <FaBars size={18} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-6 space-y-2 px-4">
                        {doctorMenuItems.map((item, index) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    group flex items-center px-4 py-4 relative
                                    hover:bg-gradient-to-r hover:from-green-600/50 hover:to-green-500/50
                                    rounded-xl transition-all duration-300 ease-in-out
                                    transform hover:scale-105 hover:shadow-lg
                                    backdrop-blur-sm border border-transparent
                                    hover:border-green-400/30
                                    ${!isSidebarExpanded && 'justify-center'}
                                    ${location.pathname === item.path ? 'bg-gradient-to-r from-green-600/70 to-green-700/70 border-green-400/40' : ''}
                                `}
                                onClick={() => setIsMobileSidebarOpen(false)}
                                style={{ animationDelay: `${index * 0.07}s` }}
                            >
                                <span className="flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:text-green-100">
                                    {item.icon}
                                </span>
                                {isSidebarExpanded && (
                                    <span className="ml-4 whitespace-nowrap font-medium text-green-50 group-hover:text-white transition-all duration-300">
                                        {item.title}
                                    </span>
                                )}
                                {/* Hover indicator */}
                                <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></div>
                            </Link>
                        ))}
                    </div>

                    {/* Bottom decoration */}
                    <div className="p-4 border-t border-green-600/30">
                        <div className="flex items-center justify-center">
                            <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400/20 via-transparent to-green-800/20"></div>
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-green-400/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
            </nav>

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
                    onClick={handleToggleMobileSidebar}
                />
            )}

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
        </div>
    )
}
