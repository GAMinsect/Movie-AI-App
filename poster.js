import { openai, supabase } from './config.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});
const chosenMovies = [...new Map(JSON.parse(localStorage.getItem('chosenMovies'))).entries()]
let step = 0 //At which movie we are ( 0-indexed )
const basic_instruction = `
  You are an expert in movies and you are giving reccomendation to the user about which movie to watch a Friday night with its friend. When responding don't use any bold or capitalization
`
let title = document.getElementById('title')
let poster = document.getElementById('poster')
let description = document.getElementById('description')
const btn = document.getElementById('btn')

// localStorage.clear()

// For each chosenMovies generate a description using AI
// Then Render the page
// When next is pressed go to the next page
// After all recomendations have been made clear localstorage and return to the home page

// Give the movies to the AI for it to generate a Description
async function generateDescription(movie){
  
    if (step==chosenMovies.length){
        btn.innerText = 'Restart'
        localStorage.clear()
        location.href = 'index.html'
    }
  
  try{
      console.log(movie)
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [basic_instruction,`Generate a concise description of not more than 3 lines or 40 words of ${movie[0]} outlining its strengths`],
        config: {
          temperature: 0.1,
        },
      }); 
      
      await changeLayout(response.text,movie)
      
      
  }
  catch(e){
    console.log(e)
  }
}

// Function to change the layout of the page to show the reccomended movie
async function changeLayout(desc,mv){
    console.log(mv,step)
    title.innerText = `${mv[0]} (${mv[1]})`
    // Do Poster APi
    description.innerText = desc
}   

btn.addEventListener('click',async ()=>{
    await generateDescription(chosenMovies[step])
    step ++
})

// Generate the first time
await generateDescription(chosenMovies[step])
step ++