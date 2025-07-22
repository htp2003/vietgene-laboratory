import React, { useEffect, useState } from 'react';
import { FaUsers, FaVial, FaCalendarAlt, FaMoneyBillWave, FaUserMd, FaCertificate, FaEye, FaDownload, FaSearch, FaFilter } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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

interface Order {
  userId: string;
  orderId: string;
  order_code: number;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string | null;
  transaction_id: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderDetail {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  note: string;
  dnaServiceId: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  serviceId: string;
  service_name: string;
  service_description: string;
  test_price: number;
  service_category: string;
  duration_days: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface EnhancedOrder extends Order {
  orderDetails: OrderDetail[];
  user?: User;
  services: Service[];
  participantCount: number;
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

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'processing': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [enhancedOrders, setEnhancedOrders] = useState<EnhancedOrder[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<EnhancedOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);



  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('Không tìm thấy token');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch orders, services, và users song song
        const [ordersRes, servicesRes, usersRes] = await Promise.all([
          fetch('https://dna-service-se1857.onrender.com/dna_service/orders/all', { headers }),
          fetch('https://dna-service-se1857.onrender.com/dna_service/service/all', { headers }),
          fetch('https://dna-service-se1857.onrender.com/dna_service/user', { headers })
        ]);

        const [ordersData, servicesData, usersData] = await Promise.all([
          ordersRes.json(),
          servicesRes.json(),
          usersRes.json()
        ]);

        if (ordersData.code === 200) setOrders(ordersData.result || []);
        if (servicesData.code === 200) setServices(servicesData.result || []);
        if (usersData.code === 200) setUsers(usersData.result || []);

      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch chi tiết cho mỗi order
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orders.length === 0) return;

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const enhancedOrdersData = await Promise.all(
        orders.map(async (order) => {
          try {
            // Fetch order details và participants
            const [orderDetailsRes, participantsRes] = await Promise.all([
              fetch(`https://dna-service-se1857.onrender.com/dna_service/order-details/${order.orderId}/all`, { headers }),
              fetch(`https://dna-service-se1857.onrender.com/dna_service/OrderParticipants/order/${order.orderId}`, { headers })
            ]);

            const [orderDetailsData, participantsData] = await Promise.all([
              orderDetailsRes.json(),
              participantsRes.json()
            ]);

            const orderDetails = orderDetailsData.code === 200 ? orderDetailsData.result : [];
            const participants = participantsData.code === 200 ? participantsData.result : [];

            // Map services từ order details
            const orderServices = orderDetails.map((detail: OrderDetail) => {
              const service = services.find(s => s.serviceId === detail.dnaServiceId);
              return service || {
                serviceId: detail.dnaServiceId,
                service_name: 'Dịch vụ không xác định',
                service_description: '',
                test_price: detail.unit_price,
                service_category: 'Không xác định',
                duration_days: 7
              };
            });

            // Find user info
            const user = users.find(u => u.id === order.userId);

            return {
              ...order,
              orderDetails,
              user,
              services: orderServices,
              participantCount: participants.length
            } as EnhancedOrder;

          } catch (error) {
            console.error(`Lỗi khi tải chi tiết order ${order.orderId}:`, error);
            return {
              ...order,
              orderDetails: [],
              services: [],
              participantCount: 0
            } as EnhancedOrder;
          }
        })
      );

      setEnhancedOrders(enhancedOrdersData);
    };

    fetchOrderDetails();
  }, [orders, services, users]);

  // Tính toán thống kê
  const calculateStats = () => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.payment_status?.toLowerCase() === 'paid');
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      paidOrdersCount: paidOrders.length,
      totalRevenue,
      averageOrderValue,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'completed').length
    };
  };

  const stats = calculateStats();

  // Filter orders
  const filteredOrders = enhancedOrders.filter(order => {
    const matchesSearch = 
      order.order_code.toString().includes(searchTerm) ||
      order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status?.toLowerCase() === paymentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Doanh thu theo tháng
  const revenueByMonth = orders.reduce((acc: any[], order) => {
    const date = new Date(order.createdAt);
    const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
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

  // Top services
  const serviceStats = enhancedOrders.reduce((acc: any[], order) => {
    order.services.forEach(service => {
      const existing = acc.find(s => s.serviceId === service.serviceId);
      if (existing) {
        existing.count += 1;
        existing.revenue += service.test_price;
      } else {
        acc.push({
          serviceId: service.serviceId,
          name: service.service_name,
          count: 1,
          revenue: service.test_price,
          price: service.test_price
        });
      }
    });
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const handleViewOrder = (order: EnhancedOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleExportOrders = () => {
    // ✅ Tạo CSV với format chuẩn và escape special characters
    const headers = [
      'Mã đơn hàng',
      'ID đơn hàng', 
      'Tên khách hàng',
      'Email',
      'Điện thoại',
      'Dịch vụ',
      'Số lượng',
      'Đơn giá',
      'Thành tiền',
      'Tổng tiền đơn hàng',
      'Trạng thái đơn',
      'Trạng thái thanh toán',
      'Phương thức thanh toán',
      'Số người tham gia',
      'Ngày tạo',
      'Ghi chú'
    ];

    // ✅ Function để escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Nếu có dấu phẩy, xuống dòng, hoặc dấu ngoặc kép thì wrap trong quotes
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // ✅ Tạo data rows với thông tin chi tiết
    const dataRows = filteredOrders.flatMap(order => {
      // Nếu order có nhiều services, tạo một row cho mỗi service
      if (order.orderDetails.length > 0) {
        return order.orderDetails.map((detail, index) => {
          const service = order.services.find(s => s.serviceId === detail.dnaServiceId);
          return [
            escapeCSV(order.order_code),
            escapeCSV(order.orderId.slice(-8)),
            escapeCSV(order.user?.full_name || 'N/A'),
            escapeCSV(order.user?.email || 'N/A'),
            escapeCSV(order.user?.phone || 'N/A'),
            escapeCSV(service?.service_name || 'Dịch vụ không xác định'),
            escapeCSV(detail.quantity),
            escapeCSV(detail.unit_price.toLocaleString('vi-VN')),
            escapeCSV(detail.subtotal.toLocaleString('vi-VN')),
            escapeCSV(index === 0 ? order.total_amount.toLocaleString('vi-VN') : ''), // Chỉ hiển thị tổng ở row đầu
            escapeCSV(index === 0 ? order.status : ''),
            escapeCSV(index === 0 ? order.payment_status : ''),
            escapeCSV(index === 0 ? getCustomePaymentMethod(order.payment_method) : ''),
            escapeCSV(index === 0 ? order.participantCount : ''),
            escapeCSV(index === 0 ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''),
            escapeCSV(index === 0 ? (order.notes || '') : '')
          ].join(',');
        });
      } else {
        // Fallback nếu không có order details
        return [[
          escapeCSV(order.order_code),
          escapeCSV(order.orderId.slice(-8)),
          escapeCSV(order.user?.full_name || 'N/A'),
          escapeCSV(order.user?.email || 'N/A'),
          escapeCSV(order.user?.phone || 'N/A'),
          escapeCSV('N/A'),
          escapeCSV('N/A'),
          escapeCSV('N/A'),
          escapeCSV('N/A'),
          escapeCSV(order.total_amount.toLocaleString('vi-VN')),
          escapeCSV(order.status),
          escapeCSV(order.payment_status),
          escapeCSV(getCustomePaymentMethod(order.payment_method)),
          escapeCSV(order.participantCount),
          escapeCSV(new Date(order.createdAt).toLocaleDateString('vi-VN')),
          escapeCSV(order.notes || '')
        ].join(',')];
      }
    });

    // ✅ Tạo summary rows
    const summaryRows = [
      '',
      '=== TỔNG KẾT ===',
      `Tổng số đơn hàng: ${filteredOrders.length}`,
      `Đơn đã thanh toán: ${filteredOrders.filter(o => o.payment_status?.toLowerCase() === 'paid').length}`,
      `Đơn chờ thanh toán: ${filteredOrders.filter(o => o.payment_status?.toLowerCase() === 'pending').length}`,
      `Tổng doanh thu (đã thanh toán): ${formatPrice(filteredOrders.filter(o => o.payment_status?.toLowerCase() === 'paid').reduce((sum, o) => sum + o.total_amount, 0))}`,
      `Ngày xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`
    ];

    // ✅ Kết hợp tất cả
    const csvContent = [
      headers.join(','),
      ...dataRows,
      ...summaryRows
    ].join('\n');

    // ✅ Tạo và download file với BOM cho UTF-8
    const BOM = '\uFEFF'; // Để Excel hiển thị đúng tiếng Việt
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // ✅ Tên file với timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `DanhSachDonHang_${timestamp}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // ✅ Cleanup
    URL.revokeObjectURL(link.href);
  };

  const statCards = [
    {
      title: 'Tổng Đơn hàng',
      value: stats.totalOrders,
      icon: <FaCalendarAlt size={24} className="text-white" />,
      color: 'bg-blue-500',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Đơn Đã thanh toán',
      value: stats.paidOrdersCount,
      icon: <FaCertificate size={24} className="text-white" />,
      color: 'bg-green-500',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Doanh thu Thực tế',
      value: formatPrice(stats.totalRevenue),
      icon: <FaMoneyBillWave size={24} className="text-white" />,
      color: 'bg-purple-500',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Giá TB/Đơn hàng',
      value: formatPrice(stats.averageOrderValue),
      icon: <FaUsers size={24} className="text-white" />,
      color: 'bg-yellow-500',
      trend: { value: 5, isPositive: false }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Quản lý và giám sát toàn bộ đơn hàng ({stats.totalOrders} đơn)
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chi tiết Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Phân tích
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Revenue Calculation Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              Chi tiết tính toán Doanh thu
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calculation Steps */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Bước 1: Tổng tất cả đơn hàng</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tổng số đơn hàng:</span>
                        <span className="font-medium">{stats.totalOrders} đơn</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tổng giá trị tất cả đơn:</span>
                        <span className="font-medium">{formatPrice(orders.reduce((sum, order) => sum + order.total_amount, 0))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h3 className="font-medium text-gray-800 mb-3">Bước 2: Lọc đơn hàng đã thanh toán</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Đơn hàng đã thanh toán (paid):</span>
                        <span className="font-medium text-green-600">{stats.paidOrdersCount} đơn</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đơn hàng chưa thanh toán:</span>
                        <span className="font-medium text-yellow-600">{stats.totalOrders - stats.paidOrdersCount} đơn</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h3 className="font-medium text-gray-800 mb-3">Bước 3: Tính doanh thu thực tế</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">Chỉ tính các đơn hàng có payment_status = "paid"</p>
                      {orders.filter(o => o.payment_status.toLowerCase() === 'paid').slice(0, 3).map((order, index) => (
                        <div key={order.orderId} className="flex justify-between">
                          <span>Đơn #{order.order_code}:</span>
                          <span className="font-medium">+ {formatPrice(order.total_amount)}</span>
                        </div>
                      ))}
                      {orders.filter(o => o.payment_status.toLowerCase() === 'paid').length > 3 && (
                        <div className="flex justify-between text-gray-500">
                          <span>... và {orders.filter(o => o.payment_status.toLowerCase() === 'paid').length - 3} đơn khác</span>
                          <span></span>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-green-600">
                        <span>= Doanh thu thực tế:</span>
                        <span>{formatPrice(stats.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Tóm tắt</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng đơn hàng:</span>
                      <span className="font-medium">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã thanh toán:</span>
                      <span className="font-medium text-green-600">{stats.paidOrdersCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tỷ lệ thanh toán:</span>
                      <span className="font-medium">{stats.totalOrders > 0 ? ((stats.paidOrdersCount / stats.totalOrders) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Doanh thu thực:</span>
                      <span className="text-green-600">{formatPrice(stats.totalRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Verification</h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Chỉ tính đơn hàng payment_status = "paid"</p>
                    <p>• Bỏ qua đơn hàng "pending", "failed"</p>
                    <p>• Tổng được cập nhật real-time</p>
                    <p>• Click "Chi tiết Đơn hàng" để xem từng đơn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => {
                  const user = users.find(u => u.id === order.userId);
                  return (
                    <div key={order.orderId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">#{order.order_code}</p>
                        <p className="text-sm text-gray-600">{user?.full_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{formatPrice(order.total_amount)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Top Dịch vụ</h2>
              <div className="space-y-3">
                {serviceStats.map((service, index) => (
                  <div key={service.serviceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.count} đơn</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatPrice(service.revenue)}</p>
                      <p className="text-sm text-gray-500">{formatPrice(service.price)}/đơn</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-md">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>

              <button
                onClick={handleExportOrders}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload />
                Xuất Excel
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Hiển thị {filteredOrders.length} / {enhancedOrders.length} đơn hàng
            </p>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{order.order_code}</p>
                        <p className="text-xs text-gray-500">{order.orderId.slice(-8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.user?.full_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.participantCount} người tham gia</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {order.services.length > 0 ? (
                          order.services.map((service, idx) => (
                            <div key={idx}>
                              <p className="text-sm text-gray-900">{service.service_name}</p>
                              <p className="text-xs text-gray-500">{formatPrice(service.test_price)}</p>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {order.orderDetails.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-900">{detail.quantity}x</p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(order.total_amount)}</p>
                        {order.orderDetails.map((detail, idx) => (
                          <p key={idx} className="text-xs text-gray-500">
                            {detail.quantity} × {formatPrice(detail.unit_price)} = {formatPrice(detail.subtotal)}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{getCustomePaymentMethod(order.payment_method)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <FaEye size={14} />
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy đơn hàng nào phù hợp với bộ lọc</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                  labelFormatter={(label) => `Tháng ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Service Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Hiệu suất dịch vụ</h2>
            <div className="space-y-4">
              {serviceStats.map((service, index) => (
                <div key={service.serviceId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(service.count / Math.max(...serviceStats.map(s => s.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold">{service.count} đơn</p>
                    <p className="text-xs text-gray-500">{formatPrice(service.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              {Object.entries(
                orders.reduce<Record<string, number>>((acc, order) => {
                  const method = getCustomePaymentMethod(order.payment_method);
                  acc[method] = (acc[method] || 0) + 1;
                  return acc;
                }, {})
              ).map(([method, count]: [string, number]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-gray-700">{method}</span>
                  <span className="font-semibold">{count} đơn</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Phân bố trạng thái đơn hàng</h2>
            <div className="space-y-3">
              {Object.entries(
                orders.reduce<Record<string, number>>((acc, order) => {
                  acc[order.status] = (acc[order.status] || 0) + 1;
                  return acc;
                }, {})
              ).map(([status, count]: [string, number]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                  <span className="font-semibold">{count} đơn</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Chi tiết đơn hàng #{selectedOrder.order_code}</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Thông tin khách hàng</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Tên:</span> {selectedOrder.user?.full_name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                    <p><span className="font-medium">Điện thoại:</span> {selectedOrder.user?.phone || 'N/A'}</p>
                    <p><span className="font-medium">Số người tham gia:</span> {selectedOrder.participantCount}</p>
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Thông tin đơn hàng</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">ID:</span> {selectedOrder.orderId}</p>
                    <p><span className="font-medium">Ngày tạo:</span> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                    <p><span className="font-medium">Trạng thái:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Ghi chú:</span> {selectedOrder.notes || 'Không có'}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Thông tin thanh toán</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Phương thức:</span> {getCustomePaymentMethod(selectedOrder.payment_method)}</p>
                    <p><span className="font-medium">Trạng thái:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </p>
                    <p><span className="font-medium">Tổng tiền:</span> <span className="text-lg font-bold text-green-600">{formatPrice(selectedOrder.total_amount)}</span></p>
                    {selectedOrder.payment_date && (
                      <p><span className="font-medium">Ngày thanh toán:</span> {new Date(selectedOrder.payment_date).toLocaleString('vi-VN')}</p>
                    )}
                    {selectedOrder.transaction_id && (
                      <p><span className="font-medium">Mã giao dịch:</span> {selectedOrder.transaction_id}</p>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Dịch vụ & Chi tiết</h3>
                  <div className="space-y-3">
                    {selectedOrder.orderDetails.map((detail, index) => {
                      const service = selectedOrder.services.find(s => s.serviceId === detail.dnaServiceId);
                      return (
                        <div key={detail.id} className="border border-gray-200 rounded-lg p-3">
                          <p className="font-medium">{service?.service_name || 'Dịch vụ không xác định'}</p>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>Số lượng: {detail.quantity}</p>
                            <p>Đơn giá: {formatPrice(detail.unit_price)}</p>
                            <p>Thành tiền: <span className="font-medium text-green-600">{formatPrice(detail.subtotal)}</span></p>
                            {detail.note && <p>Ghi chú: {detail.note}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Tóm tắt đơn hàng</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tổng dịch vụ</p>
                      <p className="font-medium">{selectedOrder.services.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tổng số lượng</p>
                      <p className="font-medium">{selectedOrder.orderDetails.reduce((sum, d) => sum + d.quantity, 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Số người tham gia</p>
                      <p className="font-medium">{selectedOrder.participantCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tổng thanh toán</p>
                      <p className="font-bold text-lg text-green-600">{formatPrice(selectedOrder.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowOrderModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>    
  );
}