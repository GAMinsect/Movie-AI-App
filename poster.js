import { openai, supabase } from './config.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});
const btn = document.getElementById('btn')
const basic_instruction = `
  You are an expert in movies and you are giving reccomendation to the user about which movie to watch a Friday night with its friend. When responding don't use any bold or capitalization
`

//state handler
let user = 1

// take the user input on the various field and parse it
async function parser(){
    
    if (!currentState){
      changeLayout("")
      return
    }
    
    const txt1 = document.getElementById('favourite-movie')
    const txt2 = document.getElementById('mood-movie').value
    const txt3 = document.getElementById('fun-serious-movie').value
    
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
    match_threshold: 0.50,
    match_count: 1
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    return;
  }
  
  await giveReccomendation(data[0])
  // [{id: 83, title: 'Oppenheimer', releaseYear: 2023, similarity: 0.584346676805823}]
}


// Give the updated context to Gemini
async function giveReccomendation(movie){
  
  try{
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [basic_instruction,`Generate a concise description of not more than 3 lines or 40 words ${movie.title} outlining its strengths`],
        config: {
          temperature: 0.1,
        },
      }); 
      
      changeLayout(response.text,movie)
      
  }
  catch(e){
    changeLayout("Oppenheimer for its splendid dialogue Oppenheimer for its splendid dialogue Oppenheimer for its splendid dialogue",{title:"Oppenheimer",releaseYear:"2024"}) 
  }
}

function changeLayout(txt,movie = {title:"",releaseYear: "" }){
  movie.releaseYear = movie.releaseYear.length ? `(${movie.releaseYear})` : ""
  document.getElementById('response').innerHTML = `<h1>${movie.title} ${movie.releaseYear}</h1><h2>${txt}</h2>`
  document.getElementById('response').classList.toggle('hide')
  
  if (currentState){
    document.getElementById('one').style.display = 'none'
    document.getElementById('two').style.display = 'none'
    document.getElementById('three').style.display = 'none'
    btn.innerText = 'Go Again'
  }
  else{
    document.getElementById('one').style.display = 'flex'
    document.getElementById('two').style.display = 'flex'
    document.getElementById('three').style.display = 'flex'
    btn.innerText = 'Lets go'
  }
  
  currentState = !currentState
}

btn.addEventListener('click',async () => {await parser()})


console.log(localStorage.getItem('numPeople'),localStorage.getItem('time'))