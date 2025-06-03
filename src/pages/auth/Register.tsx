import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';

const Register = () => {
    const handleRegister = (registerData) => {
        console.log('Register attempt:', registerData);

        if (registerData.fullName && registerData.email && registerData.password) {
            alert('Đăng ký thành công! (Mock)');
        }
    };

    return (
        <div>
            <RegisterForm onSubmit={handleRegister} />
        </div>
    );
};

export default Register;
