import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';

import Layout from './components/common/Layout';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* publicc route */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes - mốt thêm sau */}
          <Route path="/dashboard" element={
            <Layout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Dashboard content will be here</p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">🎉 Tailwind CSS đã hoạt động!</p>
                </div>
              </div>
            </Layout>
          } />
          
          {/* all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;