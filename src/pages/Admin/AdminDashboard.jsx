import React from 'react'
import { FaUsers, FaVial, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const StatCard = ({ title, value, icon, color }) => (
  <div className='bg-white rounded-lg shadow-md p-8 flex items-center justify-between hover:shadow-lg transition-shadow'>
    <div>
      <p className='text-gray-500 text-sm font-medium uppercase tracking-wide'>{title}</p>
      <p className='text-3xl font-bold mt-3'>{value}</p>
    </div>
    <div className={`p-4 rounded-full ${color} transform transition-transform hover:scale-110`}>
      {icon}
    </div>
  </div>
)

export default function AdminDashboard() {
  // Dummy data - replace with real data later
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: <FaUsers size={24} className='text-white' />,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Services',
      value: '15',
      icon: <FaVial size={24} className='text-white' />,
      color: 'bg-green-500'
    },
    {
      title: 'Appointments Today',
      value: '28',
      icon: <FaCalendarAlt size={24} className='text-white' />,
      color: 'bg-yellow-500'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,678',
      icon: <FaMoneyBillWave size={24} className='text-white' />,
      color: 'bg-purple-500'
    }
  ]

  // Dữ liệu mẫu cho doanh thu từng tháng
  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 20000 },
    { month: 'Jun', revenue: 25000 },
    { month: 'Jul', revenue: 23000 },
    { month: 'Aug', revenue: 27000 },
    { month: 'Sep', revenue: 30000 },
    { month: 'Oct', revenue: 32000 },
    { month: 'Nov', revenue: 35000 },
    { month: 'Dec', revenue: 40000 }
  ]

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-800'>Dashboard Overview</h1>
        <p className='text-gray-600'>Welcome to your admin dashboard</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Biểu đồ doanh thu theo tháng */}
      <div className='bg-white rounded-lg shadow-md p-6 mt-8'>
        <h2 className='text-lg font-semibold mb-4'>Doanh thu theo tháng</h2>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`}/>
            <Legend />
            <Bar dataKey='revenue' fill='#8884d8' name='Doanh thu' />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-lg font-semibold mb-4'>Recent Orders</h2>
          {/* Add orders table/list here */}
          <p className='text-gray-500'>Coming soon...</p>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-lg font-semibold mb-4'>Latest Activities</h2>
          {/* Add activity feed here */}
          <p className='text-gray-500'>Coming soon...</p>
        </div>
      </div>
    </div>
  )
}
