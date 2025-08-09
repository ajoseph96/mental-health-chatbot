import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { client, connectDB } from './db.js';
import connectMongo from 'connect-mongo';




dotenv.config();

import OpenAI from 'openai';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const app = express();

await connectDB();

app.get('/', (req, res) => {
  res.send('Welcome to the Mental Health Chatbot API!');
});

app.use( cors({
  origin: ['https://mental-health-chatbot-project.netlify.app', 'http://localhost:5173', 'https://mentalwellnessbot.help'],
  credentials: true, 
  })
);

app.use(express.json());

//app.use(express.static(path.join(__dirname, 'public')));

const MongoStore = connectMongo.create({
  client: client, 
  collectionName: 'sessions',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(
  session({
    store: MongoStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // REMEMBER TO: Set to true if using HTTPS/deploying
      httpOnly: true, 
      sameSite: 'none', // REMEMBER TO: change to none if deployed 
      //maxAge: 1000 * 60 * 60, // 1 hour
      domain: 'https://mentalwellnessbot.help',
    },
  })
);

app.get('/history', (req, res) => {
  // Check if a session exists and has a conversation
  if (req.session && req.session.conversation) {
    res.json({ conversation: req.session.conversation });
  } else {
    res.json({ conversation: [] }); 
  }
});

function isSelfHarmContent(message) {
  const selfHarmIndicators = [
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'hurt myself',
    'self-harm',
  ];
  return selfHarmIndicators.some((phrase) =>
    message.toLowerCase().includes(phrase)
  );
}

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log('Received message from user:', userMessage);

  // if (isSelfHarmContent(userMessage)) {
  //   res.json({
  //     reply:
  //       "I'm so sorry to hear that you're feeling this way. Please consider reaching out to a mental health professional or someone you trust for support. You will get through this, I believe in you. Dial 988 for Ontario's suicide hotline. You deserve to be here and see everything life can offer you. Things will get better, I promise.",
  //   });
  //   return;
  // }

  if (!req.session.conversation) {
    req.session.conversation = [
      {
        role: 'system',
        content: `
  You are "Someone Who Cares About You" a compassionate and supportive virtual assistant specializing in mental well-being.
  
  Your goals are:
  - To provide empathetic, comforting, and non-judgmental support to users expressing feelings of sadness or mild distress.
  - To offer general suggestions for coping strategies, such as deep breathing exercises, mindfulness, and encouraging positive activities.
  - To **encourage users to seek professional help** if they express severe distress or mention self-harm.
  - To gently remind user that your main purpose is to provide help regarding their mental health and not to complete other things for them.
  
  Guidelines:
  - **Avoid** using phrases like "I'm unable to help" or "I can't provide assistance."
  - **Do not** mention that you are an AI language model or reference any policies.
  - **Refrain** from providing any medical advice or making diagnoses.
  - **Keep responses concise**, compassionate, and focused on supporting the user's emotional well-being.
  - **Include a gentle disclaimer** when appropriate, such as "While I'm not a substitute for professional help, I'm here to listen and offer support."
  `,
      },
    ];
  }
  
  if (isSelfHarmContent(userMessage)) {
    console.warn(`Self-harm content detected: ${userMessage}`);
  
    const safeResponse =
      "I'm so sorry to hear that you're feeling this way. Please consider reaching out to a mental health professional or someone you trust for support. You will get through this, I believe in you. Dial 988 for Ontario's suicide hotline. You deserve to be here and see everything life can offer you. Things will get better, I promise.";
  
    
    req.session.conversation.push({ role: 'user', content: userMessage });
    req.session.conversation.push({ role: 'assistant', content: safeResponse });
  
    return res.json({ reply: safeResponse });
  }
  
  req.session.conversation.push({ role: 'user', content: userMessage });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5', 
      messages:
        req.session.conversation,
      temperature: 0.8,
    });

    const assistantMessage = response.choices[0].message.content.trim();
    console.log('Assistant response:', assistantMessage);
    req.session.conversation.push({ role: 'assistant', content: assistantMessage });

    res.json({ reply: assistantMessage });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error);
    res
      .status(500)
      .send('There was an issue processing your message. Please try again later.');
  }
});


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const url = `https://api.mentalwellnessbot.help`; 
const interval = (14*60*1000); 

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

