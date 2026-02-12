import { GoogleGenAI } from "@google/genai";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { supabase } from './config.js';
import movies from './content.js';


const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});

// Only run this when you want to update your supabase with new data

// Split the Data 
async function splitData(source){
    
    const splitter = new CharacterTextSplitter({
        separator: " ",
        chunkSize: 150,
        chunkOverlap: 15,
    })
    
    const texts = await splitter.createDocuments([source])
    
    return texts
}
    


// Insert it into supabase 
async function createAndStoreEmbeddings(file) {
  await Promise.all(
    file.map( async (movie)=>{
      
      // split each content
      let splitted = await splitData(movie.content)
      
      await Promise.all(
        splitted.map( async (chunk) => {
          
          // Each chunk is embedded
          const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: chunk.pageContent
          });
          
          // Data to add
          let data = {
            title: movie.title,
            releaseYear: movie.releaseYear,
            content: chunk.pageContent,
            embedding: response.embeddings[0].values
          }
      
          //Add it to supabase
          await supabase.from('movies').insert(data)
        })
      )
    })
  )
}

// Start
createAndStoreEmbeddings(movies)