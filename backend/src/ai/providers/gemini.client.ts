import { GoogleGenAI } from "@google/genai";
import env from "@configs/env.config.js"

const gemini = new GoogleGenAI({
    apiKey : env.GEMINI_API_KEY
})

export default gemini;