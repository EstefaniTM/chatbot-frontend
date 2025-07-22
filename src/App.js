import FilesPage from './components/FilesPage';
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import UserHeader from './components/UserHeader';
import ChatbotInterface from './components/ChatbotInterface';
import AdminPanel from './components/AdminPanel';
import AuthForm from './components/AuthForm';
import UserSettings from './components/UserSettings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

// Componente principal de la aplicación con navegación
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState('login');
  const [currentPage, setCurrentPage] = useState('chat'); // 'chat', 'files', 'settings'
  // 'chat', 'files', 'settings', 'list'
  // const [inventoryData, setInventoryData] = useState([]);

  // Si no está autenticado, no abrir automáticamente el diálogo
  // El usuario puede navegar y usar el chat sin autenticación
  // Solo se abrirá el diálogo cuando haga clic en "Iniciar Sesión" o "Registrarse"
  useEffect(() => {
    // No hacer nada automáticamente, dejar que el usuario decida
  }, [isAuthenticated]);

  const handleOpenAuth = (tab = 'login') => {
    setAuthDialogTab(tab);
    setAuthDialogOpen(true);
  };

  const handleCloseAuth = () => {
    // Permitir cerrar el diálogo sin requerir autenticación
    setAuthDialogOpen(false);
  };

  const handleNavigateTo = (page) => {
    setCurrentPage(page);
  };


  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'settings': {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'admin') {
          return <AdminPanel />;
        } else {
          return <UserSettings />;
        }
      }
      case 'admin': {
        // Mostrar siempre el panel de administración, sin importar el rol
        return <AdminPanel />;
      }
      case 'files': {
        return <FilesPage />;
      }
      default: {
        // Leer el archivo CSV y conversationId seleccionados desde localStorage
        let preloadedData = null;
        let fileName = '';
        let conversationId = localStorage.getItem('conversationId') || '';
        try {
          const selectedCsvFile = JSON.parse(localStorage.getItem('selectedCsvFile') || 'null');
          if (selectedCsvFile && selectedCsvFile.data && Array.isArray(selectedCsvFile.data)) {
            preloadedData = selectedCsvFile.data;
            fileName = selectedCsvFile.originalname || selectedCsvFile.filename || '';
          }
        } catch (e) {}
        return (
          <ChatbotInterface 
            preloadedData={preloadedData}
            fileName={fileName}
            conversationId={conversationId}
          />
        );
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Header principal - Siempre visible */}
      <UserHeader 
        onOpenAuth={handleOpenAuth}
        onNavigateTo={handleNavigateTo}
        currentPage={currentPage}
      />
      
      {/* Contenido principal - Siempre visible */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {renderCurrentPage()}
        </Box>
      </Container>

      {/* Dialog de autenticación - Solo se abre cuando se hace clic en login/registro */}
      <AuthForm
        open={authDialogOpen}
        onClose={handleCloseAuth}
        initialTab={authDialogTab}
      />
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
