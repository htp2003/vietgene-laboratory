import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">VG</span>
                            </div>
                            <span className="text-lg font-bold">VietGene Lab</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Trung tâm xét nghiệm DNA hàng đầu Việt Nam với công nghệ hiện đại 
                            và đội ngũ chuyên gia giàu kinh nghiệm.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Liên kết</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/services" className="text-gray-300 hover:text-white">
                                    Dịch vụ
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-300 hover:text-white">
                                    Giới thiệu
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="text-gray-300 hover:text-white">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-300 hover:text-white">
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Liên hệ</h3>
                        <div className="text-sm text-gray-300 space-y-2">
                            <p>📍 Nhà Văn Hóa Sinh viên</p>
                            <p>📞 113</p>
                            <p>✉️ info@vietgenelab.vn</p>
                            <p>🕒 T2-T6: 8:00-17:00, T7: 8:00-12:00</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>© 2024 VietGene Laboratory. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white">Bảo mật</Link>
                        <Link to="/terms" className="hover:text-white">Điều khoản</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
