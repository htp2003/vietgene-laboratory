import React from "react";
import toast from "react-hot-toast";
import RegisterForm from "../../components/auth/RegisterForm";

const Register = () => {
  const handleRegister = (registerData) => {
    console.log("Register attempt:", registerData);

    if (registerData.fullName && registerData.email && registerData.password) {
      toast.success("Đăng ký thành công");
    }
  };

  return (
    <div>
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
};

export default Register;
