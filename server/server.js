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
  dbName: 'chatbot', // Explicitly specify database name
  collectionName: 'sessions',
  touchAfter: 24 * 3600, // Lazy session update (update once per 24 hours)
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // Changed to true to ensure session is created
    store: MongoStore, // CRITICAL FIX: Added MongoDB store
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS in production, HTTP in development
      httpOnly: true, 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      // Removed domain restriction to allow cookies across netlify and render domains
    },
  })
);

// Debug endpoint to check session info
app.get('/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    sessionExists: !!req.session,
    conversationExists: !!req.session?.conversation,
    conversationLength: req.session?.conversation?.length || 0,
    cookie: req.session?.cookie,
  });
});

app.get('/history', (req, res) => {
  console.log('History request - Session ID:', req.sessionID);
  console.log('Session exists:', !!req.session);
  console.log('Conversation exists:', !!req.session?.conversation);
  console.log('Conversation length:', req.session?.conversation?.length || 0);
  
  // Check if a session exists and has a conversation
  if (req.session && req.session.conversation) {
    // Filter out system messages - only send user and assistant messages
    const filteredConversation = req.session.conversation.filter(
      (msg) => msg.role !== 'system'
    );
    res.json({ conversation: filteredConversation });
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
  console.log('Chat request - Session ID:', req.sessionID);
  console.log('Session exists:', !!req.session);
  console.log('Conversation exists before processing:', !!req.session?.conversation);

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
  
  Your approach should be:
- Listen first, then respond appropriately to the actual emotional content
- Only express sympathy when the user actually expresses negative emotions
- Maintain a balanced, warm, and professional tone
- Ask questions to better understand the user's situation
- Offer practical coping strategies when appropriate

Guidelines:
- Avoid repetitive sympathetic phrases
- Don't assume the user is feeling bad unless they express it
- Keep responses natural and conversational
- Focus on being present and engaging rather than just sympathetic
- Only mention professional help when truly necessary

Remember: Not every response needs to be sympathetic - focus on being genuinely helpful and engaging.
  
  // Guidelines:
  // - **Avoid** using phrases like "I'm unable to help" or "I can't provide assistance."
  // - **Do not** mention that you are an AI language model or reference any policies.
  // - **Refrain** from providing any medical advice or making diagnoses.
  // - **Keep responses concise**, compassionate, and focused on supporting the user's emotional well-being.
  // - **Include a gentle disclaimer** when appropriate, such as "While I'm not a substitute for professional help, I'm here to listen and offer support."
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
  
    // Save session to MongoDB
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
    });
  
    return res.json({ reply: safeResponse });
  }
  
  req.session.conversation.push({ role: 'user', content: userMessage });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fixed: gpt-5 doesn't exist. Using gpt-4o-mini (fast, affordable, good quality)
      messages: req.session.conversation,
      temperature: 0.8,
    });

    const assistantMessage = response.choices[0].message.content.trim();
    console.log('Assistant response:', assistantMessage);
    req.session.conversation.push({ role: 'assistant', content: assistantMessage });

    // Save session to MongoDB
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          reply: 'There was an issue saving your conversation. Please try again.' 
        });
      }
      res.json({ reply: assistantMessage });
    });
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

