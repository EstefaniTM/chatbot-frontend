import React, { useState, useEffect, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Box, Typography, Alert, Button, Paper, Divider, CircularProgress, LinearProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  InputAdornment,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  FilePresent,
  Visibility,
  DateRange,
  Search,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

// Eliminado API_BASE_URL, ya no se usa

const FilesPage = () => {
  const token = localStorage.getItem('token');
  const [csvFiles, setCsvFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(false);
  // Eliminar archivo CSV
  const deleteFile = async (fileId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este archivo?')) return;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/csv-uploads/${Number(fileId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Archivo eliminado correctamente.');
      await fetchFiles();
    } catch (error) {
      setError('Error al eliminar el archivo.');
    }
    setDeleting(false);
  };
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/csv-uploads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // El backend devuelve { success, message, data: { data: [ ... ] } }
      const files = Array.isArray(response.data?.data?.data) ? response.data.data.data : [];
      setCsvFiles(files);
      // Guardar en localStorage
      localStorage.setItem('csvFiles', JSON.stringify(files));
      // Verificar asociación por usuario
      const userId = localStorage.getItem('userId');
      if (files.length > 0) {
        const asociados = files.filter(f => String(f.uploadedBy) === userId);
        if (asociados.length > 0) {
          // console.log('Archivos asociados correctamente al usuario (id):', userId, asociados);
        } else {
          // console.warn('Ningún archivo está asociado al usuario autenticado (id):', userId);
        }
      }
    } catch (error) {
      console.error('Error obteniendo archivos CSV', error);
      setCsvFiles([]);
      localStorage.setItem('csvFiles', '[]');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    await processFiles(selectedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const processFiles = async (fileList) => {
    setUploading(true);
    setError('');
    setSuccess('');
    // Eliminado anySuccess, ya no se usa
    for (const file of fileList) {
      if (file.type !== 'text/csv') {
        setError('Solo se permiten archivos CSV');
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('originalname', file.name);
      try {
        const response = await axios.post('https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/csv-uploads', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        // Eliminado: console.log('Respuesta completa al subir archivo:', response);
        // Eliminado: console.log('Nombre recibido del backend (originalname):', response.data.data.originalname);
        if (response.data && response.data.data && response.data.data.originalname) {
          setSuccess(`Archivo "${response.data.data.originalname}" subido correctamente.`);
        } else {
          setError('El backend no devolvió el nombre del archivo subido.');
        }
      } catch (error) {
        setError(`Error al subir el archivo "${file.name}" al backend`);
      }
    }
    // Siempre refresca la lista desde el backend después de subir
    await fetchFiles();
    setUploading(false);
  };


  // Eliminar función de redirección al chat, ya que la URL no existe en el backend

  // Filtrar archivos por usuario y búsqueda
  // Eliminado: console.log('csvFiles recibidos:', csvFiles);
  // Filtrado por usuario (id) y búsqueda
  const userId = localStorage.getItem('userId');
  const userFiles = csvFiles.filter(f => String(f.uploadedBy) === userId && (f.originalname || '').toLowerCase().includes(searchTerm.toLowerCase()));
  // Eliminado: console.log('Archivos filtrados por usuario y búsqueda:', userFiles);

  // Vista previa: obtener datos actualizados del backend por ID
  const previewFile = async (file) => {
    setError('');
    setSuccess('');
    try {
      // Usar siempre el _id para visualizar
      if (!file._id) {
        setError('No se encontró el id del archivo para visualizar.');
        return;
      }
      const response = await axios.get(`https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/csv-uploads/${file._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Si la respuesta tiene .data.data, úsalo; si no, usa .data
      const fileData = response.data?.data ? response.data.data : response.data;
      setSelectedFile(fileData);
      setPreviewOpen(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError('El archivo no se encontró en el servidor. Puede que haya sido eliminado o el enlace esté roto.');
      } else {
        setError('Error al obtener la vista previa del archivo.');
      }
    }
  };

  // Generar columnas dinámicamente desde los datos del CSV
  const columns = selectedFile?.data && selectedFile.data.length > 0
    ? Object.keys(selectedFile.data[0]).map(header => ({
        field: header,
        headerName: header,
        width: 150,
        flex: 1,
      }))
    : [];

  // Mantener conversación en memoria mientras no se cierre sesión ni se cambie de archivo
  useEffect(() => {
    // Si hay una conversación y archivo en localStorage, mantenerlos
    const conversationId = localStorage.getItem('conversationId');
    const selectedCsvFile = localStorage.getItem('selectedCsvFile');
    if (conversationId && selectedCsvFile) {
      // No hacer nada, se mantiene la conversación
    } else {
      // Si falta alguno, reiniciar
      localStorage.removeItem('conversationId');
      localStorage.removeItem('selectedCsvFile');
    }
  }, []);

  if (!token) {
    return (
      <Box sx={{ p: 6, maxWidth: '600px', mx: 'auto', textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Debes iniciar sesión para acceder y gestionar tus archivos CSV.
        </Alert>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Acceso restringido
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Por favor, inicia sesión para cargar, buscar o visualizar archivos CSV.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestor de Inventarios CSV
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Carga y gestiona tus archivos CSV de inventario. Selecciona un archivo para chatear con tu asistente de IA.
      </Typography>
      <Divider sx={{ mb: 4 }} />
      {/* Sección de carga de archivos */}
      {/* Snackbar de éxito */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={success}
      />
      {/* Snackbar de error */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={error}
        ContentProps={{ style: { background: '#d32f2f', color: '#fff' } }}
      />
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload color="primary" />
          Cargar nuevo archivo CSV
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Paper
          sx={{
            p: 4,
            border: '2px dashed #ccc',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Arrastra archivos CSV aquí o haz clic para seleccionar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Formatos soportados: .csv (máximo 10MB)
          </Typography>
          <Button variant="contained" startIcon={<CloudUpload />}>Seleccionar Archivos</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Paper>
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Procesando archivos...
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </Paper>
      {/* Barra de búsqueda y filtros */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar archivos por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
        <Chip 
          label={`${userFiles.length} archivo${userFiles.length !== 1 ? 's' : ''}`} 
          color="primary" 
        />
      </Box>
      {/* Lista de archivos en tarjetas */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : userFiles.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay archivos CSV cargados para tu usuario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Carga tu primer archivo CSV para comenzar a usar el asistente de inventario
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
      {userFiles.map((file) => (
        <Grid item xs={12} sm={6} lg={4} key={file._id}>
          <Card 
            elevation={2} 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <FilePresent color="primary" />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {file.originalname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {file.size ? `Tamaño: ${(file.size/1024).toFixed(2)} KB` : ''}
                  </Typography>
                </Box>
              </Box>
              {(file.uploadDate || file.uploadedAt) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    size="small"
                    label={new Date(file.uploadDate || file.uploadedAt).toLocaleDateString('es-ES')}
                    icon={<DateRange />}
                    variant="outlined"
                  />
                </Box>
              )}
              {/* Muestra una vista rápida de los primeros datos del CSV si existen */}
              {file.data && Array.isArray(file.data) && file.data.length > 0 && file.headers && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Vista rápida:
                  </Typography>
                  <Box sx={{ maxHeight: 120, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
                    <table style={{ width: '100%', fontSize: '0.9em' }}>
                      <thead>
                        <tr>
                          {file.headers.map((h) => (
                            <th key={h} style={{ padding: '2px 6px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {file.data.slice(0, 3).map((row, idx) => (
                          <tr key={idx}>
                            {file.headers.map((h) => (
                              <td key={h} style={{ padding: '2px 6px', borderBottom: '1px solid #eee' }}>{row[h]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Box>
                <IconButton 
                  size="small" 
                  onClick={() => previewFile(file)}
                  title="Vista previa"
                >
                  <Visibility />
                </IconButton>
                <Button 
                  variant="outlined" 
                  color="error" 
                  sx={{ ml: 1 }} 
                  onClick={() => deleteFile(Number(file._id))}
                  disabled={deleting}
                >
                  Eliminar
                </Button>
              </Box>
            </CardActions>
          </Card>
        </Grid>
      ))}
        </Grid>
      )}
      {/* Dialog de vista previa */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Vista previa: {selectedFile?.originalname}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFile?.data && selectedFile.data.length > 0 ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={selectedFile.data.map((row, idx) => ({ id: idx, ...row }))}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
              />
            </Box>
          ) : (
            <Typography>No hay datos para mostrar</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={async () => {
              if (selectedFile) {
                // Eliminar conversación anterior antes de crear la nueva
                localStorage.removeItem('conversationId');
                try {
                  const token = localStorage.getItem('token');
                  const userId = localStorage.getItem('userId');
                  // Generar título
                  const title = `Inventario: ${selectedFile.originalname}`;
                  // Primer mensaje del bot
                  const botMsg = {
                    text: `¡Hola! He cargado tu archivo "${selectedFile.originalname}" con ${selectedFile.data?.length || 0} productos.`,
                    author: 'bot'
                  };
                  let messagesArr = [botMsg];
                  if (typeof botMsg.text !== 'string' || typeof botMsg.author !== 'string') {
                    alert('Error: El mensaje del bot no tiene el formato correcto.');
                    return;
                  }
                  if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
                    alert('Error: El id de usuario no es válido.');
                    return;
                  }
                  if (!title || typeof title !== 'string') {
                    alert('Error: El título de la conversación no es válido.');
                    return;
                  }
                  const res = await axios.post(
                    'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/conversations',
                    {
                      title,
                      user: userId,
                      messages: messagesArr,
                    },
                    {
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                  );
                  if (res.data && res.data.data && res.data.data.id) {
                    localStorage.setItem('conversationId', res.data.data.id);
                  } else {
                    console.warn('[Ir al chat] No se recibió un id de conversación válido del backend:', res.data);
                  }
                } catch (err) {
                  console.error('Error al crear la conversación en el backend:', err);
                  if (err.response && err.response.data) {
                    alert('Error al crear la conversación en el backend: ' + JSON.stringify(err.response.data));
                  } else {
                    alert('Error al crear la conversación en el backend.');
                  }
                  return;
                }
                localStorage.setItem('selectedCsvFile', JSON.stringify(selectedFile));
                // Verificar lectura inmediata
                const testConvId = localStorage.getItem('conversationId');
                const testCsvFile = localStorage.getItem('selectedCsvFile');
                window.location.href = `/chat?fileId=${selectedFile._id}`;
              }
            }}
            sx={{ mr: 2 }}
          >
            Ir al chat
          </Button>
          <Button onClick={() => setPreviewOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilesPage;
