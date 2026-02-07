import { openai, supabase } from './config.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});

// take the user input on the various field and parse it

// find the nearest matches and return the first

// Give the updated context to Gemini