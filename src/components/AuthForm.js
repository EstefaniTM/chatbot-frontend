import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box,
  IconButton 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = ({ open, onClose, initialTab = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const { login } = useAuth();

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  const handleAuthSuccess = (authData) => {
    login(authData);
    console.log('Login exitoso, cerrando modal...');
    window.requestAnimationFrame(() => {
      onClose();
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 0
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Botón de cerrar - siempre disponible */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Contenido del formulario */}
        {isLogin ? (
          <LoginForm 
            onAuthSuccess={handleAuthSuccess} 
            onSwitchToRegister={switchToRegister} 
          />
        ) : (
          <RegisterForm 
            onAuthSuccess={handleAuthSuccess} 
            onSwitchToLogin={switchToLogin} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthForm;