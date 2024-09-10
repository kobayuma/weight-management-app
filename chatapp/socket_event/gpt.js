import OpenAI from "openai";
import { config } from 'dotenv';
config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

export const handlePromptEvent = async (data, callback) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: data.prompt }],
      model: 'gpt-3.5-turbo',
    });
    const gptResponse = completion.choices[0].message.content;

    callback({ response: gptResponse });
  } catch (error) {
    console.error('Failed to fetch from OpenAI:', error);
    callback({ response: 'Error fetching from OpenAI' });
  }
};