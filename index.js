import { openai, supabase } from './config.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});
const btn = document.getElementById('btn')

// take the user input on the various field and parse it
async function parser(){
    const txt1 = 'interstellar for its good story' //document.getElementById('favourite-movie')
    const txt2 = 'something classic' //document.getElementById('mood-movie').value
    const txt3 = 'i want to have funn' //document.getElementById('fun-serious-movie').value
    
    const embedded = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: txt1+txt2+txt3,
    });
    console.log(embedded.embeddings[0].values)
    await findNearestMatch(embedded.embeddings[0].values)
}

// find the nearest matches and return the first
async function findNearestMatch(embedding) {
  const { data, error } = await supabase.rpc('match_movies', {
    query_embedding: embedding,
    match_threshold: 0.00,
    match_count: 1
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    return;
  }
  
  console.log("Matched Movie:", data);
}


// Give the updated context to Gemini

btn.addEventListener('click',async () => await parser())