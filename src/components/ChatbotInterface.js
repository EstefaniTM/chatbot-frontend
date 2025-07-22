import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  Chip,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import Papa from 'papaparse';

const ChatbotInterface = ({ preloadedData = null, fileName = '', conversationId }) => {
  // Estado para listado de conversaciones del usuario
  const [userConversations, setUserConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  // Eliminar el estado inicial, siempre leer de localStorage
  const getUserId = () => localStorage.getItem('userId') || '';
  const [currentUserId, setCurrentUserId] = useState(getUserId());

  // Efecto SOLO para limpiar estado tras logout
  useEffect(() => {
    const clearChatbotState = () => {
      setCurrentUserId('');
      setMessages([
        {
          id: 1,
          text: '¡Hola! Debes iniciar sesión para usar el chat y cargar inventario.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setInventoryData([]);
      setInventoryFileName('');
      setUserConversations([]);
      localStorage.removeItem('conversationId');
      // Eliminado: console.log('[DEBUG] Estado después de limpiar (logout):', { currentUserId, inventoryFileName, userConversations, messages });
    };
    const checkUser = () => {
      const userId = localStorage.getItem('userId');
      // Eliminado: console.log('[DEBUG] checkUser - userId en localStorage:', userId, 'currentUserId:', currentUserId);
      if (!userId && currentUserId) {
        clearChatbotState();
      }
    };
    window.addEventListener('storage', checkUser);
    window.forceChatbotLogout = clearChatbotState;
    return () => {
      window.removeEventListener('storage', checkUser);
      delete window.forceChatbotLogout;
    };
  }, [currentUserId]);

  // Efecto para limpiar SOLO cuando detecta logout (no bucle)
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId && currentUserId) {
      // Solo limpiar una vez
      setCurrentUserId('');
      setMessages([
        {
          id: 1,
          text: '¡Hola! Debes iniciar sesión para usar el chat y cargar inventario.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setInventoryData([]);
      setInventoryFileName('');
      setUserConversations([]);
      localStorage.removeItem('conversationId');
      console.log('[DEBUG] Limpieza por logout detectado');
    }
  }, [currentUserId]);

  // Obtener conversaciones del usuario solo si hay usuario válido
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) return; // No llamar si no hay usuario válido
    if (currentUserId !== userId) return; // Esperar a que el id se sincronice
    setLoadingConvs(true);
    const fetchUserConversations = async () => {
      try {
        // Eliminado: console.log('[DEBUG] fetchUserConversations - Haciendo petición a:', `https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/conversations/user/${userId}`);
        const res = await axios.get(
          `https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/conversations/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const allConvs = res.data?.data || [];
        const filtered = allConvs.filter(conv => (conv.user === userId || conv.user === String(userId)));
        setUserConversations(filtered);
        // Eliminado: console.log('[DEBUG] fetchUserConversations - Conversaciones recibidas:', filtered);
      } catch (err) {
        setUserConversations([]);
        // Eliminado: console.log('[DEBUG] fetchUserConversations - Error en petición:', err);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchUserConversations();
  }, [currentUserId]);
  // Estados principales
  const [messages, setMessages] = useState([]);
  // Hidratar mensajes desde el backend al montar o cuando cambia usuario
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchConversation = async () => {
      let convId = conversationId || localStorage.getItem('conversationId');
      const userId = localStorage.getItem('userId');
      // Si NO hay usuario, limpiar todo y mostrar mensaje neutro
      if (!userId) {
        localStorage.removeItem('conversationId');
        setInventoryData([]);
        setInventoryFileName('');
        setMessages([
          {
            id: 1,
            text: 'Hola, ¿en qué ayudo?',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        return;
      }
      // Si el usuario cambió, limpiar conversación e inventario
      if (userId !== currentUserId) {
        localStorage.removeItem('conversationId');
        setInventoryData([]);
        setInventoryFileName('');
        setMessages([
          {
            id: 1,
            text: 'Hola, ¿en qué ayudo?',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        setCurrentUserId(userId);
        return;
      }
      if (convId && convId !== 'undefined') {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/conversations/${convId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const msgs = res.data?.data?.messages || [];
          const mapped = msgs.map((m, idx) => ({
            id: idx + 1,
            text: m.text,
            sender: m.author === 'user' ? 'user' : 'bot',
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }));
          setMessages(mapped);
          // Si hay inventario en la conversación, hidratarlo y asignar id único
          const inventory = res.data?.data?.inventory || res.data?.data?.data;
          if (Array.isArray(inventory) && inventory.length > 0) {
            const hydrated = inventory
              .filter(row => row && Object.keys(row).length > 1)
              .map((row, idx) => ({ ...row, id: `inv-${idx}-${Date.now()}` }));
            setInventoryData(hydrated);
          }
        } catch (err) {
          setMessages([
            {
              id: 1,
              text: (preloadedData && preloadedData.length > 0 && userId)
                ? `¡Hola! He cargado tu archivo "${fileName}" con ${preloadedData.length} productos. Puedes preguntarme sobre cantidades, productos específicos, o pedirme que muestre la tabla completa.`
                : 'Hola, ¿en qué ayudo?',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        setMessages([
          {
            id: 1,
            text: (preloadedData && preloadedData.length > 0 && userId)
              ? `¡Hola! He cargado tu archivo "${fileName}" con ${preloadedData.length} productos. Puedes preguntarme sobre cantidades, productos específicos, o pedirme que muestre la tabla completa.`
              : 'Hola, ¿en qué ayudo?',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        if (preloadedData && preloadedData.length > 0 && userId) {
          const hydrated = preloadedData
            .filter(row => row && Object.keys(row).length > 1)
            .map((row, idx) => ({ ...row, id: `preload-${idx}-${Date.now()}` }));
          setInventoryData(hydrated);
        } else {
          setInventoryData([]);
        }
      }
    };
    fetchConversation();
  }, [conversationId, preloadedData, fileName, currentUserId]);
  // Estado para inventario, siempre con id único
  const [inventoryData, setInventoryData] = useState(() => {
    if (preloadedData && preloadedData.length > 0) {
      return preloadedData
        .filter(row => row && Object.keys(row).length > 1)
        .map((row, idx) => ({ ...row, id: `preload-${idx}-${Date.now()}` }));
    }
    return [];
  });
  const [inventoryFileName, setInventoryFileName] = useState(fileName || '');
  // Referencias y estados faltantes
  const [showTable, setShowTable] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  // Estado para mostrar el diálogo de login requerido
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // URL de tu backend - ajusta según tu configuración
  const BACKEND_URL = 'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/api/chat';
  // URL para guardar conversación
  const SAVE_CONVERSATION_URL = 'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/conversations';

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Función para cargar el archivo CSV
  const handleFileUpload = (event) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoginDialogOpen(true);
      return;
    }
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setInventoryFileName('');
      Papa.parse(file, {
        complete: async (results) => {
          if (results.data && results.data.length > 0) {
            localStorage.removeItem('conversationId');
            setMessages([]);
            setInventoryData([]);
            // ...existing code...
            const headers = results.data[0];
            let rowCount = 0;
            const rows = results.data.slice(1)
              .filter(row => row.some(cell => cell && cell.trim() !== ''))
              .map((row) => {
                rowCount++;
                const rowObject = {};
                headers.forEach((header, i) => {
                  rowObject[header] = row[i];
                });
                if (Object.keys(rowObject).filter(k => rowObject[k] && rowObject[k].trim() !== '').length > 1) {
                  rowObject.id = `row-${rowCount}-${Date.now()}`;
                  return rowObject;
                }
                return null;
              })
              .filter(row => row && row.id);
            setInventoryData(rows);
            setInventoryFileName(file.name);
            const inventoryPayload = rows.map(row => {
              const { id, ...rest } = row;
              const validFields = Object.keys(rest).filter(k => rest[k] && rest[k].toString().trim() !== '');
              return validFields.length > 1 ? rest : null;
            }).filter(row => row);
            try {
              const token = localStorage.getItem('token');
              // Bloquear si no hay userId válido
              if (!userId) {
                setLoginDialogOpen(true);
                return;
              }
              const res = await axios.post(
                'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/conversations',
                {
                  title: `Inventario: ${file.name}`,
                  user: userId,
                  messages: [
                    {
                      text: `¡Perfecto! He cargado ${inventoryPayload.length} productos a tu inventario. Ahora puedes preguntarme cosas como "¿cuántas pastillas me quedan?" o "mostrar tabla de inventario".`,
                      author: 'bot'
                    }
                  ]
                },
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              );
              const newConvId = res.data?.data?.id || res.data?.data?._id || res.data?.id;
              if (newConvId) {
                localStorage.setItem('conversationId', newConvId);
              }
              setMessages([
                {
                  id: Date.now(),
                  text: `¡Perfecto! He cargado ${inventoryPayload.length} productos a tu inventario. Ahora puedes preguntarme cosas como "¿cuántas pastillas me quedan?" o "mostrar tabla de inventario".`,
                  sender: 'bot',
                  timestamp: new Date(),
                }
              ]);
            } catch (err) {
              const errorMsg = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message || 'Error desconocido';
              setMessages([
                {
                  id: Date.now(),
                  text: `Error al crear la conversación: ${errorMsg}`,
                  sender: 'bot',
                  timestamp: new Date(),
                }
              ]);
              console.log('Error backend:', errorMsg);
            }
          }
        },
        header: false,
        skipEmptyLines: true,
      });
    }
  };

  // Función para guardar la conversación en el backend
  const saveConversation = async (msgs) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoginDialogOpen(true);
        return;
      }
      const title = inventoryFileName ? `Inventario: ${inventoryFileName}` : 'Conversación de prueba';
      const formattedMessages = msgs.map(m => ({
        text: m.text,
        author: m.sender === 'user' ? 'user' : 'bot'
      }));
      let convId = conversationId || localStorage.getItem('conversationId');
      let triedPatch = false;
      if (convId && convId !== 'undefined') {
        try {
          await axios.patch(`${SAVE_CONVERSATION_URL}/${convId}`, {
            messages: formattedMessages,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          triedPatch = true;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            localStorage.removeItem('conversationId');
            convId = undefined;
            console.warn('Id de conversación inválido, se borra y se creará una nueva ahora.');
          } else {
            console.error('Error al guardar conversación (PATCH):', err.response?.data || err.message);
            triedPatch = true;
          }
        }
      }
      if (!convId || convId === 'undefined' || !triedPatch) {
        const res = await axios.post(
          SAVE_CONVERSATION_URL,
          {
            title,
            user: userId,
            messages: formattedMessages,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const newId = res.data?.data?.id || res.data?.data?._id || res.data?.id;
        if (newId) {
          localStorage.setItem('conversationId', newId);
        }
      }
    } catch (err) {
      console.error('Error al crear/guardar conversación:', err.response?.data || err.message);
    }
  };

  // Función para enviar mensaje
  const sendMessage = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoginDialogOpen(true);
      return;
    }
    if (input.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => {
      const updated = [...prevMessages, userMessage];
      saveConversation(updated);
      return updated;
    });
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // ...existing code...
      if (currentInput.toLowerCase().includes('mostrar tabla') || 
          currentInput.toLowerCase().includes('ver inventario')) {
        setShowTable(true);
        const botMessage = {
          id: Date.now() + 1,
          text: 'Aquí tienes tu inventario completo. Haz clic en el botón "Ver Tabla" que aparece abajo.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prevMessages => {
          const updated = [...prevMessages, botMessage];
          saveConversation(updated);
          return updated;
        });
        setIsTyping(false);
        return;
      }

      if (inventoryData.length > 0) {
        const searchResults = searchInventory(currentInput);
        if (searchResults) {
          const botMessage = {
            id: Date.now() + 1,
            text: searchResults,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages(prevMessages => {
            const updated = [...prevMessages, botMessage];
            saveConversation(updated);
            return updated;
          });
          setIsTyping(false);
          return;
        }
      }

      // Bloquear si no hay userId válido
      if (!userId) {
        setLoginDialogOpen(true);
        setIsTyping(false);
        return;
      }
      const response = await axios.post(BACKEND_URL, {
        message: currentInput,
        inventoryData: inventoryData,
        userId: userId,
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.message || response.data.response || 'Lo siento, no pude procesar tu mensaje.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prevMessages => {
        const updated = [...prevMessages, botMessage];
        saveConversation(updated);
        return updated;
      });
    } catch (error) {
      let errorText = 'Lo siento, ocurrió un error. Asegúrate de que el backend esté funcionando.';
      if (error.response && error.response.data) {
        errorText = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorText = error.message;
      }
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error al procesar tu solicitud: ${errorText}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prevMessages => {
        const updated = [...prevMessages, errorMessage];
        saveConversation(updated);
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Buscar en inventario local
  const searchInventory = (query) => {
    if (!inventoryData.length) return null;
    const lowercaseQuery = query.toLowerCase();
    const matchingProducts = inventoryData.filter(item => {
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(lowercaseQuery)
      );
    });
    if (matchingProducts.length > 0) {
      if (lowercaseQuery.includes('cuánto') || lowercaseQuery.includes('cantidad')) {
        const product = matchingProducts[0];
        const quantityField = Object.keys(product).find(key => 
          key.toLowerCase().includes('cantidad') || 
          key.toLowerCase().includes('stock') ||
          key.toLowerCase().includes('qty')
        );
        if (quantityField) {
          return `Tienes ${product[quantityField]} unidades de ${product[Object.keys(product)[1]] || 'ese producto'}.`;
        }
      }
      return `Encontré ${matchingProducts.length} producto(s) relacionado(s). El primero es: ${JSON.stringify(matchingProducts[0], null, 2)}`;
    }
    return null;
  };

  // Manejar enter en input
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  // Formatear hora
  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Columnas para la tabla
  const columns = inventoryData.length > 0 
    ? Object.keys(inventoryData[0])
        .filter(key => key !== 'id')
        .map(key => ({
          field: key,
          headerName: key.charAt(0).toUpperCase() + key.slice(1),
          width: 150,
          flex: 1,
        }))
    : [];
  // Estado para edición de mensajes
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMsgIdx, setEditMsgIdx] = useState(null);
  const [editMsgText, setEditMsgText] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con botones de acción */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => {
                  if (!localStorage.getItem('userId')) {
                    setLoginDialogOpen(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                sx={{ mr: 1 }}
                disabled={!localStorage.getItem('userId')}
              >
                Subir archivo CSV
              </Button>
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              {inventoryData.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<TableIcon />}
                  onClick={() => setShowTable(true)}
                >
                  Ver Tabla ({inventoryData.length} productos)
                </Button>
              )}
            </Box>
            {getUserId() && inventoryFileName && (
              <Box sx={{ mt: 2, bgcolor: 'white', borderRadius: 2, px: 2, py: 1, boxShadow: 'none', display: 'inline-block' }}>
                <Typography variant="subtitle1" sx={{ color: 'black', fontWeight: 600 }}>
                  {inventoryFileName}
                </Typography>
              </Box>
            )}
            {/* Eliminado: Usuario actual */}
      {/* Conversaciones eliminadas por solicitud */}
          </Grid>
        </Grid>
        <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
          {messages.map((message, idx) => (
            <Box key={message.id} sx={{ display: 'flex', mb: 2, alignItems: 'center', gap: 1, justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {/* Ícono a la izquierda para bot, a la derecha para usuario */}
              {message.sender === 'bot' && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
              )}
              <Box sx={{ maxWidth: '70%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                {/* Botón Editar arriba de la burbuja del usuario */}
                {message.sender === 'user' && (
                  <Button
                    size="small"
                    variant="text"
                    sx={{
                      fontSize: '0.75rem',
                      color: 'primary.main',
                      textTransform: 'none',
                      p: 0,
                      minWidth: 'auto',
                      mb: 0.5,
                      opacity: 0.8,
                      '&:hover': { bgcolor: 'primary.light', opacity: 1 }
                    }}
                    onClick={() => {
                      setEditMsgIdx(messages.findIndex(m => m.id === message.id));
                      setEditMsgText(message.text);
                      setEditDialogOpen(true);
                    }}
                    title="Editar este mensaje"
                  >
                    Editar
                  </Button>
                )}
                <Divider sx={{ width: '100%', mb: 1 }} />
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    minWidth: 120,
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                </Paper>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {formatTimestamp(message.timestamp)}
                </Typography>
              </Box>
              {message.sender === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, ml: 1 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              )}
            </Box>
          ))}
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <BotIcon fontSize="small" />
              </Avatar>
              <Chip label="Escribiendo..." size="small" />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pregúntame sobre tu inventario..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
          />
          <IconButton 
            color="primary" 
            onClick={sendMessage}
            disabled={input.trim() === ''}
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
      {/* Dialog para mostrar la tabla */}
      {/* Diálogo para login requerido */}
      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
        <DialogTitle>Necesitas iniciar sesión</DialogTitle>
        <DialogContent>
          <Typography>Por favor, inicia sesión para poder cargar archivos CSV y comentar en el chat.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialogOpen(false)} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>
      <Dialog 
        open={showTable} 
        onClose={() => setShowTable(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Inventario Completo
        </DialogTitle>
        <DialogContent>
          {inventoryData.length > 0 ? (
            inventoryData.every(row => row.id) ? (
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={inventoryData}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 20]}
                  disableSelectionOnClick
                />
              </Box>
            ) : (
              <Typography color="error">Error: Hay filas sin id único. Revisa el archivo CSV.</Typography>
            )
          ) : (
            <Typography>No hay datos de inventario cargados.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTable(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      {/* Diálogo para editar mensaje */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Editar mensaje</DialogTitle>
        <DialogContent>
          <TextField
            label="Mensaje"
            value={editMsgText}
            onChange={e => setEditMsgText(e.target.value)}
            fullWidth
            multiline
            rows={2}
            disabled={editLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editLoading}>Cancelar</Button>
          <Button
            onClick={async () => {
              if (editMsgIdx !== null && editMsgText.trim()) {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                  setLoginDialogOpen(true);
                  return;
                }
                const convId = conversationId || localStorage.getItem('conversationId');
                if (!convId || convId === 'undefined') {
                  alert('Error: El id de la conversación es inválido o no está definido. No se puede editar el mensaje.');
                  return;
                }
                setEditLoading(true);
                let newMessages = messages.map((m, idx) => idx === editMsgIdx ? { ...m, text: editMsgText } : m);
                // Buscar la respuesta del bot asociada (el siguiente mensaje después del editado)
                let botIdx = null;
                for (let i = editMsgIdx + 1; i < newMessages.length; i++) {
                  if (newMessages[i].sender === 'bot') {
                    botIdx = i;
                    break;
                  }
                }
                // Enviar el mensaje editado al backend y obtener la nueva respuesta
                let botMessage = null;
                try {
                  const token = localStorage.getItem('token');
                  const response = await axios.post(
                    'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/api/chat',
                    {
                      message: editMsgText,
                      inventoryData: inventoryData,
                      userId: userId,
                    },
                    {
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                  );
                  botMessage = {
                    id: Date.now() + 1,
                    text: response.data.message || response.data.response || 'Lo siento, no pude procesar tu mensaje.',
                    sender: 'bot',
                    timestamp: new Date(),
                  };
                } catch (error) {
                  let errorText = 'Lo siento, ocurrió un error. Asegúrate de que el backend esté funcionando.';
                  if (error.response && error.response.data) {
                    errorText = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                  } else if (error.message) {
                    errorText = error.message;
                  }
                  botMessage = {
                    id: Date.now() + 1,
                    text: `Error al procesar tu solicitud: ${errorText}`,
                    sender: 'bot',
                    timestamp: new Date(),
                  };
                }
                // Reemplazar la respuesta del bot asociada (si existe), si no, agregarla
                let updatedMessages;
                if (botIdx !== null) {
                  updatedMessages = newMessages.map((m, idx) => idx === botIdx ? botMessage : m);
                } else {
                  updatedMessages = [...newMessages, botMessage];
                }
                setMessages(updatedMessages);
                await saveConversation(updatedMessages);
                setEditDialogOpen(false);
                setEditLoading(false);
              }
            }}
            variant="contained"
            color="primary"
            disabled={editLoading}
          >
            {editLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChatbotInterface;