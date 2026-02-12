import { openai, supabase } from './config.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});
const h1 = document.getElementById('user')
const btn = document.getElementById('btn')

const chosenMovies = new Map()

//
//localStorage.clear()

//state handler
let user = 0
let currentState = true
const tot_user = localStorage.getItem('numPeople')


// --- Look Logic ---
function updateMoodLook(){
  // Update the mood option look
  const mood_option = document.querySelectorAll('input[type=radio]')
  mood_option.forEach(el => {
    const label = document.getElementById(`${el.id}-label`)
    
    if (el.checked)
      label.classList.add('selected')
    else
      label.classList.remove('selected')
    })
}

function render(){
    // Render the changes of the page
    console.log("render")
    user ++
    h1.innerText = `${user}`
    if (user==tot_user)
        btn.innerText = 'Get Movie'
    
}

// --- Store Data Logic ---
function storeUserData(){
  
  // To be Parsed
  localStorage.setItem(`user${user}data`, 
  `
    ${document.getElementById('favourite-movie').value}
    Something ${document.querySelectorAll('input:checked')[0].value}
    I'm in the mood for  ${document.querySelectorAll('input:checked')[1].value}
    ${document.getElementById('famous-film').value}
     
  `)
}


// --Parsing logic-- take the users inputs from local storage and parse it

async function parser(){
    console.log("parser")
    
    // Iterate each user data and embed it
    for (let i=1; i<=tot_user; i++)
    {
      const embedded = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: localStorage.getItem(`user${i}data`),
      });
      
      // For each embedding find the nearest match
      const closest = await findNearestMatch(embedded.embeddings[0].values)
      
      // Store each movie in a map title : release Date (to remove doubles)
      chosenMovies.set(closest.title,closest.releaseYear)
    }
    
    // Store each value of the map in localstorage to be used by poster.html
    localStorage.setItem('chosenMovies',JSON.stringify(Array.from(chosenMovies.entries())))
    console.log(localStorage.chosenMovies)
}

// find the nearest matches and return the first
async function findNearestMatch(embedding) {
  console.log("findnearestmatch")
  const { data, error } = await supabase.rpc('match_movies', {
    query_embedding: embedding,
    match_threshold: 0.50,
    match_count: 1
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    return;
  }
  return data[0]
}

console.log(localStorage.getItem('numPeople'),localStorage.getItem('time'))

// --- Click Logic ---
document.addEventListener('click',async (e)=>{
  if(e.target.id=="btn"){
    storeUserData()
    if (user==tot_user){
        await parser()
        location.href = 'poster.html'
    }
    else
        render()
  }
  else
    updateMoodLook()
})
  

render()

