import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Upload as UploadIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  TableChart as TableIcon,
  Description as FileIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import ChatbotInterface from './ChatbotInterface';

const API_URL = 'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/csv-uploads';


const FileManager = () => {
  // Contexto de autenticación
  const { isAuthenticated, loading: authLoading, user, token } = useAuth();

  // Estados principales
  const [csvFiles, setCsvFiles] = useState([]); // Archivos CSV cargados
  const [loadingFiles, setLoadingFiles] = useState(false); // Loader para operaciones
  const [selectedCsvIds, setSelectedCsvIds] = useState([]); // IDs seleccionados para eliminar
  const [showPreview, setShowPreview] = useState(false); // Modal de vista previa
  const [previewData, setPreviewData] = useState([]); // Datos de vista previa
  const [showFileModal, setShowFileModal] = useState(false); // Modal para ver archivo completo
  const [fileModalFile, setFileModalFile] = useState(null); // Archivo para modal completo
  const [fileModalData, setFileModalData] = useState([]); // Datos del archivo completo
  const [showChat, setShowChat] = useState(false); // Mostrar chat
  const [selectedFile, setSelectedFile] = useState(null); // Archivo seleccionado para chat
  const [loadingChat, setLoadingChat] = useState(false); // Loader para chat

  // Comentario: Al montar el componente, obtenemos los archivos CSV del backend
  // useEffect para obtener archivos al montar el componente
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('Llamando a fetchFiles() al montar FileManager');
      fetchFiles();
    } else {
      console.log('No autenticado, no se llama a fetchFiles');
    }
    // eslint-disable-next-line
  }, [isAuthenticated, token]);

  // Función para obtener archivos del backend
  // Función para obtener archivos del backend
  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      console.log('Realizando GET a', API_URL);
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Respuesta de archivos:', response.data);
      setCsvFiles(response.data || []);
    } catch (error) {
      console.error('Error obteniendo archivos CSV', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Función para subir archivo CSV
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoadingFiles(true);
    try {
      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFiles(); // Actualiza la lista después de subir
    } catch (error) {
      console.error('Error subiendo archivo', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Función para eliminar archivo individual
  const handleDeleteFile = async (filename) => {
    setLoadingFiles(true);
    try {
      // Buscar el id del archivo por filename
      const file = csvFiles.find(f => f.filename === filename);
      if (!file || !file._id) throw new Error('No se encontró el id del archivo');
      await axios.post(`${API_URL}/delete-many`, { ids: [file._id] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFiles(); // Actualiza la lista después de eliminar
      setSelectedCsvIds(selectedCsvIds.filter(id => id !== file._id));
    } catch (error) {
      console.error('Error eliminando archivo', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Función para eliminar archivos seleccionados
  const handleDeleteSelected = async () => {
    setLoadingFiles(true);
    try {
      await axios.delete(API_URL, {
        data: { ids: selectedCsvIds },
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFiles(); // Actualiza la lista después de eliminar múltiples
      setSelectedCsvIds([]);
    } catch (error) {
      console.error('Error eliminando archivos seleccionados', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Función para vista previa de archivo
  const handlePreviewFile = async (file) => {
    setLoadingFiles(true);
    try {
      const response = await axios.get(`${API_URL}/${file.filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewData(response.data?.slice(0, 10) || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error obteniendo datos para vista previa', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Función para mostrar archivo completo en modal
  const handleShowFile = async (file) => {
    setLoadingFiles(true);
    setFileModalFile(file);
    try {
      const response = await axios.get(`${API_URL}/${file.filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFileModalData(response.data || []);
      setShowFileModal(true);
    } catch (error) {
      console.error('Error mostrando archivo completo', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Función para abrir chat con archivo
  const handleOpenChat = async (file) => {
    setLoadingChat(true);
    try {
      const response = await axios.get(`${API_URL}/${file.filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedFile({ ...file, data: response.data });
      setShowChat(true);
    } catch (error) {
      console.error('Error abriendo chat', error);
    } finally {
      setLoadingChat(false);
    }
  };

  // Formatear fecha (opcional, no usado en render actual)
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loader mientras se autentica
  if (authLoading || !isAuthenticated || !user || !token) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Renderizar chat si está activo
  if (showChat && selectedFile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Paper elevation={1} sx={{ p: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FileIcon color="primary" />
              <Typography variant="h6">{selectedFile.originalname}</Typography>
              <Chip
                label={`Estado: ${selectedFile.status}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Button
              variant="outlined"
              onClick={() => setShowChat(false)}
            >
              ← Volver al menú
            </Button>
          </Box>
        </Paper>
        <Box sx={{ flex: 1 }}>
          <ChatbotInterface preloadedData={selectedFile.data} fileName={selectedFile.originalname} />
        </Box>
      </Box>
    );
  }

  // Renderizar gestor de archivos
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestor de Inventarios CSV
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Carga y gestiona tus archivos CSV de inventario. Selecciona un archivo para chatear con tu asistente de IA.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <UploadIcon color="primary" />
          <Typography variant="h6">Cargar nuevo archivo CSV</Typography>
        </Box>
        <input
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="csv-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
            size="large"
          >
            Seleccionar archivo CSV
          </Button>
        </label>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {loadingFiles ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : csvFiles.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <FileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay archivos CSV cargados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Carga tu primer archivo CSV para comenzar a usar el asistente de inventario
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Archivos CSV ({csvFiles.length})
          </Typography>
          <Grid container spacing={3}>
            {/* Botón para eliminar seleccionados */}
            <Grid item xs={12} sx={{ mb: 2 }}>
              {selectedCsvIds.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSelected}
                  sx={{ mb: 2 }}
                >
                  Eliminar seleccionados ({selectedCsvIds.length})
                </Button>
              )}
            </Grid>
            {csvFiles.map((file) => (
              <Grid item xs={12} sm={6} lg={4} key={file.filename}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <FileIcon color="primary" />
                      <Typography variant="h6" component="div" noWrap>
                        {file.originalname}
                      </Typography>
                      <input
                        type="checkbox"
                        checked={selectedCsvIds.includes(file._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedCsvIds(ids => [...ids, file._id]);
                          } else {
                            setSelectedCsvIds(ids => ids.filter(id => id !== file._id));
                          }
                        }}
                        style={{ marginLeft: 8 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Estado: {file.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subido por: {file.uploadedBy}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={loadingChat ? <CircularProgress size={20} color="inherit" /> : <ChatIcon />}
                      onClick={() => handleOpenChat(file)}
                      disabled={loadingChat}
                      variant="contained"
                    >
                      Chatear
                    </Button>
                    <Button
                      size="small"
                      startIcon={<TableIcon />}
                      onClick={() => handlePreviewFile(file)}
                    >
                      Vista previa
                    </Button>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleShowFile(file)}
                      aria-label="Ver archivo"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteFile(file.filename)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Modal de vista previa */}
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Vista previa del archivo</DialogTitle>
        <DialogContent>
          {previewData.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(previewData[0] || {}).map((header) => (
                      <th key={header} style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        backgroundColor: '#e0e0e0',
                        textAlign: 'left',
                        position: 'sticky',
                        top: 0
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.entries(row).map(([key, value]) => (
                        <td key={key} style={{ 
                          border: '1px solid #ddd', 
                          padding: '8px' 
                        }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography>No hay datos para mostrar.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para ver archivo completo */}
      <Dialog
        open={showFileModal}
        onClose={() => setShowFileModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Archivo completo: {fileModalFile?.originalname}</DialogTitle>
        <DialogContent>
          {fileModalData.length > 0 ? (
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(fileModalData[0] || {}).map((header) => (
                      <th key={header} style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        backgroundColor: '#e0e0e0',
                        textAlign: 'left',
                        position: 'sticky',
                        top: 0
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fileModalData.map((row, index) => (
                    <tr key={index}>
                      {Object.entries(row).map(([key, value]) => (
                        <td key={key} style={{
                          border: '1px solid #ddd',
                          padding: '8px'
                        }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography>No hay datos para mostrar.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {fileModalFile && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowFileModal(false);
                setTimeout(() => {
                  setSelectedFile({
                    ...fileModalFile,
                    data: fileModalData,
                  });
                  setShowChat(true);
                }, 200);
              }}
            >
              Usar en el chat
            </Button>
          )}
          <Button onClick={() => setShowFileModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManager;