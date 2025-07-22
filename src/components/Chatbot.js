import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  ChatContainer, 
  MessageContainer, 
  Message, 
  InputContainer, 
  Input, 
  SendButton,
  UserMessage,
  BotMessage,
  TypingIndicator
} from './Chatbot.styles';
import { FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // URL de tu backend - ajusta esta URL según tu configuración
  const BACKEND_URL = 'https://nestjs-chatbot-backeb-api.desarrollo-software.xyz'; // Corregido al puerto 3008

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Llamada automática al backend al montar el componente
  useEffect(() => {
    const fetchInitialBotMessage = async () => {
      try {
        const response = await axios.post(BACKEND_URL, {
          message: '', // Puedes cambiar el mensaje inicial si lo deseas
          userId: 'user-123',
        });
        const botMessage = {
          id: Date.now(),
          text: response.data.message || response.data.response || '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages([botMessage]);
      } catch (error) {
        setMessages([
          {
            id: Date.now(),
            text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?',
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
      }
    };
    fetchInitialBotMessage();
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Enviar mensaje al backend
      const response = await axios.post(BACKEND_URL, {
        message: input,
        // Agregar cualquier dato adicional que requiera tu backend
        userId: 'user-123', // Opcional: ID del usuario
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.message || response.data.response || 'Lo siento, no pude procesar tu mensaje.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, ocurrió un error. Por favor, intenta de nuevo más tarde.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <ChatContainer>
      <MessageContainer>
        {messages.map((message) => (
          <Message key={message.id} sender={message.sender}>
            {message.sender === 'user' ? (
              <UserMessage>{message.text}</UserMessage>
            ) : (
              <BotMessage>{message.text}</BotMessage>
            )}
          </Message>
        ))}
        {isTyping && (
          <Message sender="bot">
            <TypingIndicator>
              <span></span>
              <span></span>
              <span></span>
            </TypingIndicator>
          </Message>
        )}
        <div ref={messagesEndRef} />
      </MessageContainer>
      
      <InputContainer>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu mensaje aquí..."
        />
        <SendButton onClick={sendMessage} disabled={input.trim() === ''}>
          <FaPaperPlane />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chatbot;
