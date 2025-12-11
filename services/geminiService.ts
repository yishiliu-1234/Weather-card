import { GoogleGenAI, Type } from "@google/genai";
import { WeatherType, WeatherData, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured weather data
const weatherSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ['Sunny', 'Rainy', 'Snowy', 'Windy'] },
    temp: { type: Type.NUMBER },
    high: { type: Type.NUMBER },
    low: { type: Type.NUMBER },
    label: { type: Type.STRING },
  },
  required: ['type', 'temp', 'high', 'low', 'label'],
};

export const fetchCityWeather = async (city: string, lang: Language): Promise<WeatherData | null> => {
  try {
    const langInstruction = lang === 'zh' 
      ? 'The label must be in Simplified Chinese.' 
      : 'The label must be in English.';
      
    const prompt = `Generate realistic current weather data for the city: "${city}".
    ${langInstruction}
    Map the condition strictly to one of: Sunny, Rainy, Snowy, Windy.
    Return a JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: weatherSchema,
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    
    // Capitalize label if English
    let label = data.label;
    if (lang === 'en' && label) {
        label = label.charAt(0).toUpperCase() + label.slice(1);
    }

    return {
      id: `${city}-${Date.now()}`,
      city: city, // User provided city name
      type: data.type as WeatherType,
      temp: Math.round(data.temp),
      high: Math.round(data.high),
      low: Math.round(data.low),
      label: label
    };
  } catch (error) {
    console.error("Gemini API Error (fetchCityWeather):", error);
    return null;
  }
};

export const generateWeatherDescription = async (weather: WeatherType, city: string, lang: Language): Promise<string> => {
  try {
    const langPrompt = lang === 'zh' 
      ? 'Write in Simplified Chinese.' 
      : 'Write in English.';

    const prompt = `Write a short, poetic, and immersive single-sentence description for the current weather: ${weather} in ${city}. 
    ${langPrompt}
    Make it sound premium and atmospheric, suitable for a high-end design app. 
    Do not use quotation marks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || (lang === 'zh' ? `感受${city}的天气之美。` : `Experience the atmosphere of ${city}.`);
  } catch (error) {
    console.error("Gemini API Error (generateWeatherDescription):", error);
    return lang === 'zh' ? `当前${city}天气：${weather}` : `Current weather in ${city}: ${weather}`;
  }
};