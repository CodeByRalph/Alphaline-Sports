import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

// Ensure API key is present
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set in environment variables.');
}

export const openai = new OpenAI({
    apiKey: apiKey || 'dummy-key-for-build',
    dangerouslyAllowBrowser: false, // Server-side only
});

export const MODEL = 'gpt-5.2';
