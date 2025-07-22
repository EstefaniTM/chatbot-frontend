import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = 'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz';

const UserSettings = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editConvId, setEditConvId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const { user, logout } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const [profile, setProfile] = useState(null);
  const [csvFiles, setCsvFiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState('');
  const [editAllDialogOpen, setEditAllDialogOpen] = useState(false);
  const [editAllMessages, setEditAllMessages] = useState([]);
  const [editAllConvId, setEditAllConvId] = useState(null);
  const [editAllLoading, setEditAllLoading] = useState(false);
  const [editPasswordDialogOpen, setEditPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const token = localStorage.getItem('token');
    // Perfil
    axios.get(`${BACKEND_URL}/users/${Number(userId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProfile(res.data)).catch(() => setProfile(null));
    // Archivos CSV
    axios.get(`${BACKEND_URL}/csv-uploads`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      let files = res.data.data || res.data.files || res.data || [];
      if (!Array.isArray(files)) files = [];
      setCsvFiles(files);
    });
    // Conversaciones SOLO del usuario actual
    axios.get(`${BACKEND_URL}/conversations?user=${Number(userId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      console.log('[Conversaciones API]', res.data);
      let convs = Array.isArray(res.data.data?.data) ? res.data.data.data : [];
      setConversations(convs);
    });
  }, [user]);

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    if (!user || !user.id) {
      setError('No se pudo obtener el usuario actual.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BACKEND_URL}/users/${Number(user.id)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cuenta eliminada correctamente.');
      logout();
    } catch (err) {
      setError('Error al eliminar la cuenta.');
    }
  };

  // Eliminar archivo CSV
  // eslint-disable-next-line no-unused-vars
  const handleDeleteCsv = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${BACKEND_URL}/csv-uploads/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCsvFiles(csvFiles.filter(f => f.id !== id));
  };

  // Eliminar conversación
  const handleDeleteConversation = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BACKEND_URL}/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(conversations.filter(c => (c._id || c.id) !== id));
      setError('');
      setSuccess('Conversación eliminada correctamente.');
    } catch (err) {
      setError('No se pudo eliminar la conversación. Puede que ya no exista.');
      setSuccess('');
    }
  };

  // Abrir diálogo de edición
  // eslint-disable-next-line no-unused-vars
  const handleOpenEditDialog = (conv) => {
    setEditConvId(conv._id || conv.id);
    setEditTitle(conv.title || '');
    setEditDescription(conv.description || '');
    setEditDialogOpen(true);
  };

  // Guardar edición
  const handleEditConversation = async () => {
    if (!editConvId) {
      setError('No hay conversación seleccionada para editar.');
      setSuccess('');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${BACKEND_URL}/conversations/${editConvId}`, {
        title: editTitle,
        description: editDescription
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setConversations(conversations.map(c => (c._id || c.id) === editConvId ? { ...c, title: editTitle, description: editDescription } : c));
      setEditDialogOpen(false);
      setSuccess('Conversación editada correctamente.');
      setError('');
    } catch (err) {
      setError('Error al editar la conversación.');
      setSuccess('');
    }
  };

  // Abrir diálogo para editar todos los mensajes
  const handleOpenEditAllDialog = (conv) => {
    setEditAllConvId(conv._id || conv.id);
    setEditAllMessages(conv.messages.map(m => m.text));
    setEditAllDialogOpen(true);
  };

  // Guardar edición de todos los mensajes
  const handleEditAllMessages = async () => {
    if (!editAllConvId) return;
    const token = localStorage.getItem('token');
    setEditAllLoading(true);
    try {
      // Actualizar solo los textos de los mensajes
      const conv = conversations.find(c => (c._id || c.id) === editAllConvId);
      const newMessages = conv.messages.map((m, idx) => ({ ...m, text: editAllMessages[idx] }));
      await axios.patch(`${BACKEND_URL}/conversations/${editAllConvId}`, {
        messages: newMessages.map(m => ({ text: m.text, author: m.author }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(conversations.map(c => (c._id || c.id) === editAllConvId ? { ...c, messages: newMessages } : c));
      setEditAllDialogOpen(false);
    } catch (err) {
      setError('Error al editar los mensajes.');
    }
    setEditAllLoading(false);
  };

  // Cambiar contraseña
  const handleEditPassword = async () => {
    if (!user || !user.id || !newPassword) return;
    const token = localStorage.getItem('token');
    setPasswordLoading(true);
    try {
      const response = await axios.put(`${BACKEND_URL}/users/${Number(user.id)}`, {
        password: newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[Cambio contraseña backend]', response.data); // <-- log para depuración
      setSuccess('Contraseña actualizada correctamente.');
      setError('');
      setEditPasswordDialogOpen(false);
      setNewPassword('');
    } catch (err) {
      setError('Error al actualizar la contraseña.');
      setSuccess('');
    }
    setPasswordLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {(!user || !user.id) ? (
        <Alert severity="info">Debes iniciar sesión para ver tu configuración de usuario.</Alert>
      ) : null}
      {(user && user.id) && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" color="secondary" gutterBottom>Perfil de Usuario</Typography>
            <Typography><strong>Correo electrónico:</strong> {user?.email || 'No disponible'}</Typography>
            <Button variant="outlined" sx={{ mt: 2, mr: 2 }} onClick={() => setEditPasswordDialogOpen(true)}>
              Editar contraseña
            </Button>
            <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={handleDeleteAccount}>Eliminar cuenta</Button>
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" color="secondary" gutterBottom>Mis Conversaciones</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conversations.map(conv => (
                    <TableRow key={conv.id || conv._id}>
                      <TableCell>
                        <strong>{conv.title}</strong>
                        {conv.description && (
                          <Typography variant="body2" color="text.secondary">{conv.description}</Typography>
                        )}
                        {Array.isArray(conv.messages) && conv.messages.length > 0 && (
                          <ul style={{margin: '8px 0', paddingLeft: '16px'}}>
                            {conv.messages.map(msg => (
                              <li key={msg._id || msg.id}>
                                <span style={{fontWeight: msg.author === 'bot' ? 'bold' : 'normal'}}>{msg.author}:</span> {msg.text}
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenEditAllDialog(conv)} size="small" color="secondary"><EditIcon /> <span style={{fontSize:'0.8em',marginLeft:4}}>Editar todos</span></IconButton>
                        <IconButton onClick={() => handleDeleteConversation(conv._id || conv.id)} size="small" color="error"><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          {/* Diálogo para editar conversación */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>Editar Conversación</DialogTitle>
            <DialogContent>
              <TextField
                label="Título"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Descripción"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleEditConversation} variant="contained" color="primary">Guardar</Button>
            </DialogActions>
          </Dialog>
          {/* Diálogo para editar todos los mensajes */}
          <Dialog open={editAllDialogOpen} onClose={() => setEditAllDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Editar todos los mensajes</DialogTitle>
            <DialogContent>
              {editAllMessages.map((msg, idx) => (
                <TextField
                  key={idx}
                  label={`Mensaje #${idx + 1}`}
                  value={editAllMessages[idx]}
                  onChange={e => {
                    const updated = [...editAllMessages];
                    updated[idx] = e.target.value;
                    setEditAllMessages(updated);
                  }}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditAllDialogOpen(false)} disabled={editAllLoading}>Cancelar</Button>
              <Button
                onClick={handleEditAllMessages}
                variant="contained"
                color="primary"
                disabled={editAllLoading}
              >
                {editAllLoading ? 'Guardando...' : 'Guardar todos'}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Diálogo para editar contraseña */}
          <Dialog open={editPasswordDialogOpen} onClose={() => setEditPasswordDialogOpen(false)}>
            <DialogTitle>Editar contraseña</DialogTitle>
            <DialogContent>
              <TextField
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditPasswordDialogOpen(false)} disabled={passwordLoading}>Cancelar</Button>
              <Button
                onClick={handleEditPassword}
                variant="contained"
                color="primary"
                disabled={passwordLoading || !newPassword}
              >
                {passwordLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default UserSettings;
