import { openai, supabase } from './config.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});
const chosenMovies = new Map(JSON.parse(localStorage.getItem('chosenMovies')))

// localStorage.clear()

// For each chosenMovies generate a description using AI
// Then Render the page
// When next is pressed go to the next page
// After all recomendations have been made clear localstorage and return to the home page
console.log([...chosenMovies.entries()])

