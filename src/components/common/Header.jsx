import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { path: '/', label: 'Trang chủ' },
        { path: '/services', label: 'Dịch vụ' },
        { path: '/about', label: 'Giới thiệu' },
        { path: '/contact', label: 'Liên hệ' },
    ];

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">VG</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800">VietGene Lab</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors ${
                                    location.pathname === link.path
                                        ? 'text-blue-600'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Đăng ký
                        </Link>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-4 px-4 space-y-2">
                            <Link
                                to="/login"
                                className="block text-center py-2 text-gray-600 border border-gray-300 rounded-md"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="block text-center py-2 bg-blue-600 text-white rounded-md"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
