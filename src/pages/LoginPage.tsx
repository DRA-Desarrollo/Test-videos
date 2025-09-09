import React from 'react';
import SignInForm from '../components/Auth/SignInForm';
import { Box, Container } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <SignInForm />
      </Container>
    </Box>
  );
};

export default LoginPage;
