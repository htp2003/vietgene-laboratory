import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  const handleLogin = (loginData) => {
    console.log('Login attempt:', loginData);
    //giả login
    if (loginData.email && loginData.password) {
      // Simulate successful login
      alert('Đăng nhập thành công! (Mock)');
      
      // Later: nav dựa vào role
      // navigate('/dashboard');
    }
  };

  return (
    <div>
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
};

export default Login;