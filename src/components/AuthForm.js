import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box,
  IconButton,
  Button
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = ({ open, onClose, initialTab = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [registerType, setRegisterType] = useState('user'); // 'user' o 'admin'

  React.useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'admin') {
        setIsLogin(false);
        setRegisterType('admin');
      } else if (e.detail === 'user') {
        setIsLogin(false);
        setRegisterType('user');
      }
    };
    window.addEventListener('setRegisterType', handler);
    return () => window.removeEventListener('setRegisterType', handler);
  }, []);
  const { login } = useAuth();

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  const handleAuthSuccess = (authData) => {
    login(authData);
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

        {/* Botones para elegir tipo de registro */}
        {!isLogin && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button
              variant={registerType === 'user' ? 'contained' : 'outlined'}
              onClick={() => setRegisterType('user')}
            >
              Registrar usuario
            </Button>
            <Button
              variant={registerType === 'admin' ? 'contained' : 'outlined'}
              onClick={() => setRegisterType('admin')}
            >
              Registrar admin
            </Button>
          </Box>
        )}

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
            registerType={registerType}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthForm;