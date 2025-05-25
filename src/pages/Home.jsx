import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <main className="max-w-6xl mx-auto px-4">
                <div className="text-center py-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Xét nghiệm <span className="text-blue-600">DNA</span> chính xác
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Dịch vụ xét nghiệm huyết thống, quan hệ cha con với độ chính xác cao 
                        và thời gian xử lý nhanh chóng
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/register"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors shadow-lg"
                        >
                            Bắt đầu ngay
                        </Link>
                        <Link 
                            to="/services"
                            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium border-2 border-gray-200 transition-colors"
                        >
                            Xem dịch vụ
                        </Link>
                    </div>
                </div>

                <div className="py-16">
                    <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Tại sao chọn chúng tôi?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">Độ chính xác cao</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Kết quả chính xác <strong>99.99%</strong> với công nghệ xét nghiệm tiên tiến, 
                                đáp ứng tiêu chuẩn quốc tế
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">Thời gian nhanh</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Nhận kết quả trong vòng <strong>5-7 ngày</strong> làm việc với 
                                quy trình xử lý hiện đại và chuyên nghiệp
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">Bảo mật tuyệt đối</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Thông tin khách hàng được <strong>mã hóa</strong> và bảo mật 
                                theo tiêu chuẩn cao nhất
                            </p>
                        </div>
                    </div>
                </div>

                <div className="py-16">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white text-center">
                        <h3 className="text-2xl font-bold mb-8">Những con số ấn tượng</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <div className="text-4xl font-bold mb-2">8,000+</div>
                                <div className="text-blue-100">Khách hàng tin tưởng</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">99.99%</div>
                                <div className="text-blue-100">Độ chính xác</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">5-7</div>
                                <div className="text-blue-100">Ngày có kết quả</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">24/7</div>
                                <div className="text-blue-100">Hỗ trợ khách hàng</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
