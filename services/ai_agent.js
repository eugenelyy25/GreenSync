// services/ai_agent.js
import { GEMINI_API_KEY } from './config.js'; 

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const generateAISuggestion = async (role, data, retryCount = 0) => {
  const API_KEY = GEMINI_API_KEY; 
  const MODEL = "gemini-2.5-flash"; // Updated to bypass the deprecated 2.0 limit

  const systemInstructions = `
    You are an Expert Sustainability Data Scientist. 
    Analyze the provided Drive metadata as a ${role}. 
    Return a strictly formatted JSON object without markdown formatting.
    Format: {"suggestion": "string", "carbonSaved": number, "priority": "high|medium|low"}
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `${systemInstructions}\n\nData: ${JSON.stringify(data)}` }] 
        }]
      })
    });

    const result = await response.json();

    // SAFETY CHECK: Catch Google API errors (like disabled APIs or bad keys)
    if (!response.ok) {
        throw new Error(`Google API Error: ${result.error?.message || response.statusText}`);
    }

    if (response.status === 429 && retryCount < 3) {
      console.warn("Free tier limit hit. Retrying in 5s...");
      await delay(5000); 
      return generateAISuggestion(role, data, retryCount + 1);
    }
    
    const textResponse = result.candidates[0].content.parts[0].text;
    const cleanJson = textResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("AI Error:", error.message);
    return { suggestion: "Eco-audit paused. Please try again in a moment.", carbonSaved: 0 };
  }
};

/**
 * Standard Carbon Coefficients for Cloud Storage
 * Coefficient: 0.000001 kg CO2 per MB stored per year
 */
export const calculateCarbonSaved = (fileSizeMB) => {
    const CO2_PER_MB = 0.000001; 
    return (fileSizeMB * CO2_PER_MB).toFixed(6);
};