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

interface DashboardData {
  totalRevenue: number;
  averageServicePrice: number;
  revenueByCategory: CategoryRevenue[];
  revenueByMonth: MonthlyRevenue[];
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

export default function AdminDashboard() {
  const { services, getServiceStats } = useServices();
  const { getDoctorStats } = useDoctor();
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 0,
    averageServicePrice: 0,
    revenueByCategory: [],
    revenueByMonth: [],
    topServices: []
  });

  // Calculate dashboard metrics from real data
  useEffect(() => {
    if (services && services.length > 0) {
      // Calculate total potential revenue (sum of all service prices)
      const totalRevenue = services.reduce((sum, service) => sum + (service.price || 0), 0);
      
      // Calculate average service price
      const averageServicePrice = totalRevenue / services.length;
      
      // Group revenue by category
      const revenueByCategory: CategoryRevenue[] = services.reduce((acc: CategoryRevenue[], service) => {
        const existing = acc.find(item => item.category === service.test_category);
        if (existing) {
          existing.revenue += service.price || 0;
          existing.count += 1;
        } else {
          acc.push({
            category: service.test_category || 'Unknown',
            revenue: service.price || 0,
            count: 1
          });
        }
        return acc;
      }, []);
      
      // Mock monthly revenue data based on services (simulating orders)
      const monthlyMultipliers = [0.8, 1.2, 1.5, 1.8, 1.6, 2.0, 1.9, 2.2, 2.5, 2.7, 2.9, 3.2];
      const revenueByMonth: MonthlyRevenue[] = monthlyMultipliers.map((multiplier, index) => {
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        return {
          month: monthNames[index],
          revenue: Math.round(averageServicePrice * multiplier * 10), // Simulate orders
          orders: Math.round(multiplier * 15) // Mock order count
        };
      });
      
      // Top 5 services by price
      const topServices: TopService[] = [...services]
        .sort((a, b) => (b.price || 0) - (a.price || 0))
        .slice(0, 5)
        .map(service => ({
          name: service.service_name || 'Unknown Service',
          price: service.price || 0,
          category: service.test_category || 'Unknown'
        }));

      setDashboardData({
        totalRevenue,
        averageServicePrice,
        revenueByCategory,
        revenueByMonth,
        topServices
      });
    }
  }, [services]);

  const serviceStats = getServiceStats();
  const doctorStats = getDoctorStats();

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const stats = [
    {
      title: 'Tổng Dịch vụ',
      value: serviceStats.total,
      icon: <FaVial size={24} className="text-white" />,
      color: 'bg-blue-500',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Bác sĩ',
      value: doctorStats.total,
      icon: <FaUserMd size={24} className="text-white" />,
      color: 'bg-green-500',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Doanh thu Tiềm năng',
      value: formatPrice(dashboardData.totalRevenue),
      icon: <FaMoneyBillWave size={24} className="text-white" />,
      color: 'bg-purple-500',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Giá TB/Dịch vụ',
      value: formatPrice(dashboardData.averageServicePrice),
      icon: <FaCalendarAlt size={24} className="text-white" />,
      color: 'bg-yellow-500',
      trend: { value: 5, isPositive: false }
    }
  ];

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Tổng quan</h1>
        <p className="text-gray-600 mt-2">Chào mừng đến với bảng điều khiển quản trị</p>
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
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Doanh thu theo tháng (Dự kiến)</h2>
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
        </div>

        {/* Revenue by Category Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Doanh thu theo danh mục</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.revenueByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: CategoryRevenue) => {
                  const percent = (entry.revenue / dashboardData.totalRevenue) * 100;
                  return `${entry.category} ${percent.toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {dashboardData.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatPrice(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services by Price */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Top 5 Dịch vụ Giá cao</h2>
          <div className="space-y-3">
            {dashboardData.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatPrice(service.price)}</p>
                </div>
              </div>
            ))}
            {dashboardData.topServices.length === 0 && (
              <p className="text-gray-500 text-center py-4">Chưa có dữ liệu dịch vụ</p>
            )}
          </div>
        </div>

        {/* Service & Doctor Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Tóm tắt hệ thống</h2>
          <div className="space-y-4">
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

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Thao tác nhanh</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                  Thêm dịch vụ
                </button>
                <button className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                  Thêm bác sĩ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}