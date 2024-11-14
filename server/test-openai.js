

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAPI() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello!' }],
    });
    console.log('API Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testAPI();
