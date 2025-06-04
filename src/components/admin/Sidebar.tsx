import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FaHome,
  FaUsers,
  FaVial,
  FaBlog,
  FaCalendarAlt,
  FaChartBar,
  FaCog
} from 'react-icons/fa'

interface MenuItem {
  title: string
  path: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/admin', icon: <FaHome size={20} /> },
  { title: 'Users', path: '/admin/users', icon: <FaUsers size={20} /> },
  { title: 'Services', path: '/admin/services', icon: <FaVial size={20} /> },
  { title: 'Blog', path: '/admin/blog', icon: <FaBlog size={20} /> },
  { title: 'Appointments', path: '/admin/appointments', icon: <FaCalendarAlt size={20} /> },
  { title: 'Reports', path: '/admin/reports', icon: <FaChartBar size={20} /> },
  { title: 'Settings', path: '/admin/settings', icon: <FaCog size={20} /> }
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className='w-64 h-screen bg-gray-800 text-white fixed left-0 top-0 overflow-y-auto'>
      <div className='p-4 border-b border-gray-700'>
        <h1 className='text-xl font-bold'>Vietgene Admin</h1>
      </div>
      <nav className='mt-4' role='navigation'>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${location.pathname === item.path ? 'bg-gray-700' : ''}`}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
