import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [loginResult, setLoginResult] = React.useState(null);
  const [loginLoading, setLoginLoading] = React.useState(false);
  const token = localStorage.getItem('token');
  const loginCurl = `curl -X GET https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/users \
  -H "Authorization: Bearer ${token}"`;
  const [curlInput, setCurlInput] = React.useState(loginCurl);
  const [curlResult, setCurlResult] = React.useState(null);
  const [curlLoading, setCurlLoading] = React.useState(false);
  const [section, setSection] = React.useState('users');
  const [users, setUsers] = React.useState([]);
  const [editUserId, setEditUserId] = React.useState(null);
  const [editEmail, setEditEmail] = React.useState('');
  const [editRole, setEditRole] = React.useState('user');
  const [csvFiles, setCsvFiles] = React.useState([]);
  const [conversations, setConversations] = React.useState([]);
  // Función para login automático
  const handleAutoLogin = async () => {
    setLoginLoading(true);
    setLoginResult(null);
    try {
      const res = await fetch('https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@gmail.com', password: '123456' })
      });
      const json = await res.json();
      setLoginResult(json);
    } catch (err) {
      setLoginResult({ error: err.message });
    }
    setLoginLoading(false);
  };

  // Función para ejecutar cualquier CURL
  const handleCurlExecute = async () => {
    setCurlLoading(true);
    setCurlResult(null);
    try {
      const match = curlInput.match(/curl\s+-X\s+(\w+)\s+(\S+)(.*)/i);
      if (!match) throw new Error('Formato curl no soportado.');
      const [, method, url, rest] = match;
      const headers = {};
      let body = null;
      const headerMatches = [...rest.matchAll(/-H\s+"([^"]+)"/g)];
      headerMatches.forEach(h => {
        const [key, value] = h[1].split(':').map(s => s.trim());
        headers[key] = value;
      });
      const dataMatch = rest.match(/-d\s+'([^']+)'/);
      if (dataMatch) body = JSON.parse(dataMatch[1]);
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      setCurlResult(json);
    } catch (err) {
      setCurlResult({ error: err.message });
    }
    setCurlLoading(false);
  };

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (section === 'users') {
      fetch('https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/users?page=1&limit=20', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.data?.data)) setUsers(data.data.data);
          else if (Array.isArray(data.data)) setUsers(data.data);
          else if (Array.isArray(data)) setUsers(data);
          else setUsers([]);
        });
    }
    if (section === 'csv') {
      fetch('https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/csv-uploads', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCsvFiles(data);
          else if (Array.isArray(data.files)) setCsvFiles(data.files);
          else if (Array.isArray(data.data)) setCsvFiles(data.data);
          else setCsvFiles([]);
        });
    }
    if (section === 'conversations') {
      fetch('https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setConversations(data);
          else if (Array.isArray(data.conversations)) setConversations(data.conversations);
          else if (Array.isArray(data.data)) setConversations(data.data);
          else setConversations([]);
        })
        .catch(() => setConversations([]));
    }
  }, [section]);

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">No autorizado. Inicia sesión como administrador.</Typography>
      </Box>
    );
  }

  // Eliminar usuario
  // ...existing code...

  // Editar usuario
  // ...existing code...

  // Eliminar CSV
  // ...existing code...

  // Eliminar conversación
  // ...existing code...
  // Panel CURL
  // ...existing code...

  // ...existing code...
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Panel de Administración</Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Token actual del administrador</Typography>
        <Box sx={{ p: 1, bgcolor: '#fffde7', fontSize: 14, wordBreak: 'break-all' }}>
          <code>{token}</code>
        </Box>
        <button onClick={handleAutoLogin} disabled={loginLoading} style={{ marginTop: 16, marginBottom: 16 }}>
          {loginLoading ? 'Logueando...' : 'Obtener token'}
        </button>
        {loginResult?.data?.access_token && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="primary">Access Token:</Typography>
            <Box sx={{ p: 1, bgcolor: '#fffde7', fontSize: 14, wordBreak: 'break-all' }}>
              <code>{loginResult.data.access_token}</code>
            </Box>
          </Box>
        )}
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Ejecutar cualquier CURL (API)</Typography>
        <textarea
          value={curlInput}
          onChange={e => setCurlInput(e.target.value)}
          rows={5}
          style={{ width: '100%', marginBottom: 8, fontSize: 15, padding: 8, resize: 'vertical', borderRadius: 6, border: '1px solid #ccc', fontFamily: 'monospace' }}
        />
        <button onClick={handleCurlExecute} disabled={curlLoading || !curlInput} style={{ marginBottom: 16 }}>
          {curlLoading ? 'Ejecutando...' : 'Ejecutar'}
        </button>
        {curlResult && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle1" gutterBottom>Resultado:</Typography>
            <pre style={{ fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxWidth: '100%' }}>{JSON.stringify(curlResult, null, 2)}</pre>
          </Box>
        )}
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="secondary" gutterBottom>Usuarios registrados</Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Rol</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {editUserId === user.id ? (
                    <input value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                  ) : user.email}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {editUserId === user.id ? (
                    <input value={editRole} onChange={e => setEditRole(e.target.value)} />
                  ) : user.role}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {editUserId === user.id ? (
                    <button onClick={async () => {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/users/${editUserId}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ email: editEmail, role: editRole })
                      });
                      const result = await res.json();
                      if (result.success) {
                        setUsers(users.map(u => u.id === editUserId ? { ...u, email: editEmail, role: editRole } : u));
                        setEditUserId(null);
                        setEditEmail('');
                        setEditRole('user');
                      } else {
                        alert(result.message || 'Error al editar usuario');
                      }
                    }}>Guardar</button>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditUserId(user.id);
                        setEditEmail(user.email);
                        setEditRole(user.role);
                      }}>Editar</button>
                      <button style={{ marginLeft: 8, color: 'red' }} onClick={async () => {
                        if (window.confirm('¿Seguro que deseas eliminar este usuario?')) {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/users/${user.id}`, {
                            method: 'DELETE',
                            headers: {
                              Authorization: `Bearer ${token}`
                            }
                          });
                          const result = await res.json();
                          if (result.success) {
                            setUsers(users.filter(u => u.id !== user.id));
                          } else {
                            alert(result.message || 'Error al eliminar usuario');
                          }
                        }
                      }}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default AdminPanel;
