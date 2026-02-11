import { openai, supabase } from './config.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});
const h1 = document.getElementById('user')
const btn = document.getElementById('btn')
const basic_instruction = `
  You are an expert in movies and you are giving reccomendation to the user about which movie to watch a Friday night with its friend. When responding don't use any bold or capitalization
`
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
  
  // To be given to the AI
  localStorage.setItem(`user${user}`,
    `
      What’s your favorite movie and why? 
      ${document.getElementById('favourite-movie').value}
      Are you in the mood for something new or a classic?
      ${document.querySelectorAll('input:checked')[0].value}
      What are you in the mood for?
      ${document.querySelectorAll('input:checked')[1].value}
      Which famous film person would you love to be stranded on an island with and why?
      ${document.getElementById('famous-film').value}
    `)
  
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

/*
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
*/
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

