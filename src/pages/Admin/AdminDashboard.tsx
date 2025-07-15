import React, { useEffect, useState } from 'react';
import { FaUsers, FaVial, FaCalendarAlt, FaMoneyBillWave, FaUserMd, FaCertificate } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { useServices } from '../../hooks/useServices';
import { useDoctor } from '../../hooks/useDoctor';
import { formatPrice } from '../../services/serviceService';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  count: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface TopService {
  name: string;
  price: number;
  category: string;
}

interface Order {
  userId: string;
  orderId: string;
  order_code: number;
  status: string;
  total_amount: number;
  collection_method: string;
  payment_method: string;
  payment_status: string;
  payment_date: string | null;
  transaction_id: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  paidOrders: number;
  revenueByMonth: MonthlyRevenue[];
  revenueByPaymentMethod: { method: string; methodDisplay: string; revenue: number; count: number; }[];
  topServices: TopService[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%</span>
            <span className="text-gray-500 ml-1">vs tháng trước</span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-full ${color} transform transition-transform hover:scale-110`}>
        {icon}
      </div>
    </div>
  </div>
);

const getCustomePaymentMethod = (method: string): string => {
  const methodLower = method.toLowerCase();

  switch (methodLower) {
    case 'transfer':
      return 'Chuyển khoản';
    case 'cash':
      return 'Tiền mặt';
    case 'credit_card':
    case 'creditcard':
    case 'credit card':
      return 'Thẻ tín dụng';
    case 'debit_card':
    case 'debitcard':
    case 'debit card':
      return 'Thẻ ghi nợ';
    case 'e_wallet':
    case 'ewallet':
    case 'e-wallet':
      return 'Ví điện tử';
    case 'bank_transfer':
    case 'banktransfer':
      return 'Chuyển khoản ngân hàng';
    case 'momo':
      return 'MoMo';
    case 'zalopay':
      return 'ZaloPay';
    case 'vnpay':
      return 'VNPay';
    default:
      return method || 'Không xác định';
  }
};

export default function AdminDashboard() {
  const { services, getServiceStats } = useServices();
  const { getDoctorStats } = useDoctor();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    paidOrders: 0,
    revenueByMonth: [],
    revenueByPaymentMethod: [],
    topServices: []
  });

  // Lấy dữ liệu đơn hàng từ API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Không tìm thấy token');
          setLoading(false);
          return;
        }

        const response = await fetch('https://dna-service-se1857.onrender.com/dna_service/orders/all', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.code === 200 && data.result) {
          setOrders(data.result);
        } else {
          console.error('API Error:', data.message);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Tính toán các chỉ số dashboard thực từ dữ liệu đơn hàng
  useEffect(() => {
    if (orders.length > 0) { // Chỉ cần orders, không cần đợi services
      
      // Tính toán các chỉ số doanh thu thực
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const paidOrders = orders.filter(order => order.payment_status.toLowerCase() === 'paid');
      const paidRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalRevenue / orders.length;

      // Nhóm doanh thu theo tháng (dữ liệu thực)
      const revenueByMonth: MonthlyRevenue[] = orders.reduce((acc: MonthlyRevenue[], order) => {
        const date = new Date(order.createdAt);
        const monthKey = `T${date.getMonth() + 1}/${date.getFullYear()}`;
        
        const existing = acc.find(item => item.month === monthKey);
        if (existing) {
          existing.revenue += order.total_amount;
          existing.orders += 1;
        } else {
          acc.push({
            month: monthKey,
            revenue: order.total_amount,
            orders: 1
          });
        }
        return acc;
      }, []).sort((a, b) => a.month.localeCompare(b.month));

      // Nhóm doanh thu theo phương thức thanh toán
      const revenueByPaymentMethod = orders.reduce((acc: { method: string; methodDisplay: string; revenue: number; count: number; }[], order) => {
        const originalMethod = order.payment_method || 'unknown';
        const vietnameseMethod = getCustomePaymentMethod(originalMethod);
       
        const existing = acc.find(item => item.method === order.payment_method);
        if (existing) {
          existing.revenue += order.total_amount;
          existing.count += 1;
        } else {
          acc.push({
            method: order.payment_method || 'Không xác định',
            methodDisplay: vietnameseMethod,
            revenue: order.total_amount,
            count: 1
          });
        }
        return acc;
      }, []);

      // Top 5 dịch vụ có giá cao nhất (từ dữ liệu dịch vụ)
      const topServices: TopService[] = services && services.length > 0 ? [...services]
        .sort((a, b) => (b.price || 0) - (a.price || 0))
        .slice(0, 5)
        .map(service => ({
          name: service.service_name || 'Dịch vụ không xác định',
          price: service.price || 0,
          category: service.test_category || 'Không xác định'
        })) : [];

      const newDashboardData = {
        totalRevenue: paidRevenue, // Chỉ tính đơn hàng đã thanh toán
        averageOrderValue,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        revenueByMonth,
        revenueByPaymentMethod,
        topServices
      };

      setDashboardData(newDashboardData);
    }
  }, [orders, services]);

  const serviceStats = getServiceStats();
  const doctorStats = getDoctorStats();

  // Màu sắc cho biểu đồ tròn
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const stats = [
    {
      title: 'Tổng Đơn hàng',
      value: dashboardData.totalOrders,
      icon: <FaCalendarAlt size={24} className="text-white" />,
      color: 'bg-blue-500',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Đơn Đã thanh toán',
      value: dashboardData.paidOrders,
      icon: <FaCertificate size={24} className="text-white" />,
      color: 'bg-green-500',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Doanh thu Thực tế',
      value: formatPrice(dashboardData.totalRevenue),
      icon: <FaMoneyBillWave size={24} className="text-white" />,
      color: 'bg-purple-500',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Giá TB/Đơn hàng',
      value: formatPrice(dashboardData.averageOrderValue),
      icon: <FaUsers size={24} className="text-white" />,
      color: 'bg-yellow-500',
      trend: { value: 5, isPositive: false }
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8 p-6 min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Tổng quan</h1>
        <p className="text-gray-600 mt-2">
          Dữ liệu thực tế từ {dashboardData.totalOrders} đơn hàng 
          ({dashboardData.paidOrders} đã thanh toán)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Doanh thu theo tháng (Thực tế)</h2>
          {dashboardData.revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.revenueByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                  labelFormatter={(label: string) => `Tháng ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Revenue by Payment Method Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Doanh thu theo phương thức thanh toán</h2>
          {dashboardData.revenueByPaymentMethod.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.revenueByPaymentMethod}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const total = dashboardData.revenueByPaymentMethod.reduce((sum, item) => sum + item.revenue, 0);
                    const percent = (entry.revenue / total) * 100;
                    return `${entry.methodDisplay} ${percent.toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {dashboardData.revenueByPaymentMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatPrice(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Chưa có dữ liệu thanh toán
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Đơn hàng gần đây</h2>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order, index) => (
              <div key={order.orderId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="min-w-[20px] h-8 bg-blue-100 rounded-full flex items-center justify-center px-2">
                      <span className="text-blue-600 font-semibold text-xs">#{order.order_code}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formatPrice(order.total_amount)}</p>
                    <p className="text-sm text-gray-500">
                      {getCustomePaymentMethod(order.payment_method)} • {order.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`min-w-[30px] inline-flex items-center justify-center   px-2 py-1 rounded-full text-xs font-medium ${
                    order.payment_status.toLowerCase() === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
            )}
          </div>
        </div>

        {/* Service & Doctor Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Tóm tắt hệ thống</h2>
          <div className="space-y-4">
            {/* Orders Summary */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FaMoneyBillWave className="text-purple-500" />
                Đơn hàng & Doanh thu
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tổng đơn:</span>
                  <span className="ml-2 font-semibold">{dashboardData.totalOrders}</span>
                </div>
                <div>
                  <span className="text-gray-500">Đã thanh toán:</span>
                  <span className="ml-2 font-semibold text-green-600">{dashboardData.paidOrders}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Doanh thu thực:</span>
                  <span className="ml-2 font-semibold text-purple-600">
                    {formatPrice(dashboardData.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Services Summary */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FaVial className="text-blue-500" />
                Dịch vụ
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tổng số:</span>
                  <span className="ml-2 font-semibold">{serviceStats.total}</span>
                </div>
                <div>
                  <span className="text-gray-500">Danh mục:</span>
                  <span className="ml-2 font-semibold">{Object.keys(serviceStats.byCategory || {}).length}</span>
                </div>
              </div>
            </div>

            {/* Doctors Summary */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FaUserMd className="text-green-500" />
                Bác sĩ
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Hoạt động:</span>
                  <span className="ml-2 font-semibold text-green-600">{doctorStats.active}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tạm ngưng:</span>
                  <span className="ml-2 font-semibold text-red-600">{doctorStats.inactive}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}