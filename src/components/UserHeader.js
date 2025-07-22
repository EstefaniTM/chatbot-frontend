import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Button,
  Chip
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Login,
  Settings,
  SmartToy,
  Folder as FolderIcon,
  ArrowBack
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserHeader = ({ onOpenAuth, onNavigateTo, currentPage }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const userId = user?.id || localStorage.getItem('userId');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'files': return 'Mis Archivos CSV';
      case 'settings': return 'Configuración';
      default: return 'ChatBot Inventario';
    }
  };

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo y navegación */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {currentPage !== 'chat' && (
            <IconButton 
              color="inherit" 
              onClick={() => onNavigateTo('chat')}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          
          <SmartToy sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            {getPageTitle()}
          </Typography>
          
          {currentPage === 'chat' && (
            <Chip 
              label="AI Assistant" 
              size="small" 
              sx={{ 
                background: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 500
              }} 
            />
          )}
        </Box>

        {/* Navegación central y usuario */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Navegación principal */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<FolderIcon />}
              variant={currentPage === 'files' ? 'contained' : 'outlined'}
              onClick={() => onNavigateTo('files')}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                backgroundColor: currentPage === 'files' ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Mis Archivos scec
            </Button>
          </Box>

          {/* Área de usuario */}
          {isAuthenticated ? (
            <>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.name}
                  sx={{ width: 36, height: 36 }}
                >
                  {getInitials(user?.name || user?.email)}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
                sx={{ mt: 1 }}
              >
                <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <br />
                  <span style={{fontSize:'0.8em',color:'#888'}}>ID: {userId}</span>
                </Box>
                <Divider />
                <MenuItem onClick={() => { onNavigateTo('settings'); handleClose(); }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Configuración</ListItemText>
                </MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem onClick={() => { onNavigateTo('admin'); handleClose(); }}>
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Panel Admin</ListItemText>
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cerrar Sesión</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Login />}
                variant="outlined"
                onClick={() => onOpenAuth('login')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Iniciar sesión
              </Button>
              <Button
                variant="outlined"
                onClick={() => { onOpenAuth('register'); window.setTimeout(() => { window.dispatchEvent(new CustomEvent('setRegisterType', { detail: 'admin' })); }, 100); }}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Registrarte como admin
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserHeader;
