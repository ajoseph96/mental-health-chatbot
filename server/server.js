// server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import OpenAI from 'openai';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to the Mental Health Chatbot API!');
});

app.use( cors({
  origin: ['https://mental-health-chatbot-project.netlify.app', 'http://localhost:5173'], 
}));
app.use(express.json());

//app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log('Received message from user:', userMessage);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userMessage }],
    });

    const assistantMessage = response.choices[0].message.content;
    console.log('Assistant response:', assistantMessage);
    res.json({ reply: assistantMessage });
  } catch (error) {
    console.error(
      'Error communicating with OpenAI API:',
      error.response ? error.response.data : error.message
    );
    res.status(500).send('Error communicating with ChatGPT API');
  }
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const url = `https://mental-health-chatbot-hnn9.onrender.com`; 
const interval = (30000); 

function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}


setInterval(reloadWebsite, interval);

