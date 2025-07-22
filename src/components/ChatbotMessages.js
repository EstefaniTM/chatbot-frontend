

import React from 'react';
import { Box, Paper, Typography, Avatar, Chip, IconButton } from '@mui/material';
import { SmartToy as BotIcon, Person as PersonIcon, Edit as EditIcon } from '@mui/icons-material';

const ChatbotMessages = ({ messages, isTyping, messagesEndRef, formatTimestamp, onEditMessage }) => (
  <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
    {messages.map((message, idx) => (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
          alignItems: 'flex-start',
          gap: 1
        }}
      >
        {message.sender === 'bot' && (
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <BotIcon fontSize="small" />
          </Avatar>
        )}
        <Box sx={{ maxWidth: '70%', position: 'relative' }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
              color: message.sender === 'user' ? 'white' : 'text.primary',
              borderRadius: 2,
              position: 'relative',
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.text}
            </Typography>
            {/* Botón de editar para cada mensaje */}
            {onEditMessage && (
              <IconButton 
                size="small" 
                color="primary" 
                sx={{ position: 'absolute', top: 4, right: 4 }} 
                onClick={() => onEditMessage(idx)}
                title="Editar este mensaje"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Paper>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {formatTimestamp(message.timestamp)}
          </Typography>
        </Box>
        {message.sender === 'user' && (
          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
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
);

export default ChatbotMessages;
