import React from 'react';
import SignInForm from '../components/Auth/SignInForm';

const LoginPage: React.FC = () => {
  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <SignInForm />
    </div>
  );
};

export default LoginPage;
