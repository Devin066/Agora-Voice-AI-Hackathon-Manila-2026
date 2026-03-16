import { useState, useContext } from 'react';
import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { storage } from "@/lib/MMKVConfig"; 
import {QuizContext} from "@/context/QuizContext"





export const useGeminiQuiz = () => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(QuizContext)

  const handleAddQuizId = (id: string) => {
  const currArray = storage.getString("quizId");
  const item: string[] = currArray ? JSON.parse(currArray) : [];
  item.push(id);
  const jsonQuiz = JSON.stringify(item);
  storage.set("quizId", jsonQuiz);
};

  

  if (!context) return null 

  const {setQuiz} = context

  const generateQuiz = async (textToProcess: string, numberOf : number, difficulty : string, promptCustom?:string ) => {
    const apiKey = storage.getString("gemini_api_key") || process.env.EXPO_PUBLIC_GEMINI_API;
    
    if (!apiKey) {
      console.error("No API key found in Settings or .env file");
      throw new Error("MISSING_API_KEY");
    }
    
    if (!textToProcess || textToProcess.trim().length < 5) {
      throw new Error("NO_TEXT");
    }

    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const schema: ResponseSchema = {
        description: "Quiz generated from text",
        type: SchemaType.OBJECT,
        properties: {
          quiz_title: { type: SchemaType.STRING },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.NUMBER },
                type: { type: SchemaType.STRING },
                question: { type: SchemaType.STRING },
                options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                answer: { type: SchemaType.STRING },
              },
              required: ["id", "type", "question", "answer"]
            }
          }
        },
        required: ["quiz_title", "questions"]
      };

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", 
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const promptPredined = `
        You are an expert educator. Based on the following text, create a comprehensive study quiz.
        
        TEXT: "${textToProcess}"
        
        REQUIREMENTS:
        1. Generate exactly ${numberOf} questions.
        2. Provide an equal mix of 'multiple_choice' (with 4 options) and 'fill_in_the_blank'.
        3. Ensure questions cover the entire depth of the text and is ${difficulty}.
      `;
      const prompt = promptCustom ? promptCustom : promptPredined
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const data = JSON.parse(text);
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      handleAddQuizId(id)
      storage.set(`${id}`, JSON.stringify(data))
      setQuiz(data)
      return data
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error
    } finally {
      setIsLoading(false);
    }
  };
  return { generateQuiz, isLoading };
};