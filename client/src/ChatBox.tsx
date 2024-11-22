
import React, { useState, useEffect,  useRef } from 'react';
import { Avatar, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch('https://mental-health-chatbot-hnn9.onrender.com/history', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Error fetching history: ${response.status}`);
        }
        const data = await response.json();
        const conversation = data.conversation.map(
          (message: { role: string; content: string }) => ({
            sender: message.role === 'user' ? 'user' : 'bot',
            text: message.content,
          })
        );
  
        if (conversation.length > 0) {
          setMessages(conversation);
        } else {
          setMessages([
            {
              sender: 'bot',
              text: 'Hello! I am here to provide information on resources regarding your mental health. Deep breaths, I am here for you and we will get through this. How can I help?',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    };
  
    fetchConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (userMessage.trim() === '') return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: userMessage },
    ]);

    const messageToSend = userMessage;
    setUserMessage('');
    setIsLoading(true);

    // Send message to server
    try {
      const response = await fetch('https://mental-health-chatbot-hnn9.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
    elevation={3}
    sx={{
      padding: 2,
      marginTop: 1,
      width: '100%', 
      maxWidth: '700px', 
      boxSizing: 'border-box',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 1,
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
           {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
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
