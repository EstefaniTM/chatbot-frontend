import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, Button } from '@mui/material';

const EditMessagesDialog = ({ open, onClose, messages, setMessages, onSave }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Editar Mensajes de la Conversación</DialogTitle>
    <DialogContent>
      {messages.map((msg, idx) => (
        <Box key={idx} sx={{ mb: 2 }}>
          <TextField
            label={`Mensaje ${idx + 1}`}
            value={msg.text}
            onChange={e => {
              const newMsgs = [...messages];
              newMsgs[idx].text = e.target.value;
              setMessages(newMsgs);
            }}
            fullWidth
            sx={{ mb: 1 }}
          />
          <TextField
            label="Autor"
            value={msg.author}
            onChange={e => {
              const newMsgs = [...messages];
              newMsgs[idx].author = e.target.value;
              setMessages(newMsgs);
            }}
            fullWidth
          />
        </Box>
      ))}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button onClick={onSave} variant="contained" color="primary">Guardar</Button>
    </DialogActions>
  </Dialog>
);

export default EditMessagesDialog;
