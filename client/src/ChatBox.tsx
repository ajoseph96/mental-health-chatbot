// src/ChatBox.tsx
import React, { useState, useEffect } from 'react';
import { Avatar, Paper, TextField, Button, Typography, Box } from '@mui/material';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: 'Hello! I am here to provide information on resources regarding your mental health. Deep breaths, I am here for you and we will get through this. How can I help?',
      },
    ]);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (userMessage.trim() === '') return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: userMessage },
    ]);

    const messageToSend = userMessage;
    setUserMessage('');

    // Send message to server
    try {
      const response = await fetch('https://mental-health-chatbot-hnn9.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: data.reply },
      ]);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'bot',
          text: 'Sorry, there was an error processing your request.',
        },
      ]);
    }
  };

  return (
    <Paper
    elevation={3}
    sx={{
      padding: 2,
      marginTop: 4,
      width: '100%',
      boxSizing: 'border-box',
    }}
  >

<Box
     sx={{
      display: 'flex',
      alignItems: 'center',
       justifyContent: 'center',
      marginBottom: 2,
      flexDirection: { xs: 'column', sm: 'row' },
    }}
  >
      <Avatar
      variant="rounded"
      alt="Chatbot Icon"
      src="/logo.svg"
      imgProps={{ style: { objectFit: 'contain' } }}
      sx={{ width: 30, height: 30, marginRight: 1 }}
    />
    <Typography variant="h6" gutterBottom align="inherit">
      Someone Who Cares About You
    </Typography>
    </Box>

      <Box
  sx={{
    height: { xs: '300px', sm: '400px', md: '500px' },
    overflowY: 'auto',
    marginBottom: 2,
    padding: 1,
    border: '1px solid #ccc',
    borderRadius: 1,
  }}
>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Box
              sx={{
                backgroundColor: msg.sender === 'user' ? '#0b93f6' : '#e5e5ea',
                color: msg.sender === 'user' ? '#fff' : '#000',
                padding: 1,
                borderRadius: 2,
                maxWidth: '80%',
              }}
            >
              {msg.text}
            </Box>
          </Box>
        ))}
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          variant="outlined"
          color="primary" 
        />
        <Button
          type="submit"
          variant="contained"
          color="primary" 
          sx={{ marginLeft: 1 }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatBox;
