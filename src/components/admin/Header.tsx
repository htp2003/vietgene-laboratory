import React from 'react'
import { FaUserCircle, FaBell } from 'react-icons/fa'

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <header className='h-16 bg-white shadow-md fixed top-0 right-0 left-0 flex items-center justify-between px-6 z-10'>
      <div className='flex items-center gap-6'>
        {children}
        <div className='h-8 w-px bg-gray-200 hidden lg:block' /> {/* Divider */}
        <h2 className='text-xl font-semibold text-gray-800'>Welcome, Admin</h2>
      </div>

      <div className='flex items-center gap-4'>
        <button className='relative'>
          <FaBell size={20} className='text-gray-600 hover:text-gray-800 transition-colors' />
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>3</span>
        </button>
        <div className='flex items-center gap-2'>
          <FaUserCircle size={24} className='text-gray-600' />
          <span className='text-gray-800'>Admin User</span>
        </div>
      </div>
    </header>
  )
}
