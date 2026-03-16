import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { storage } from "@/lib/MMKVConfig";

export const addQuizIdToStorage = (id: string) => {
  const currArray = storage.getString("quizId");
  const items: string[] = currArray ? JSON.parse(currArray) : [];
  items.push(id);
  storage.set("quizId", JSON.stringify(items));
};

export const fetchGeminiQuizData = async (
  textToProcess: string, 
  numberOf: number, 
  difficulty: string, 
  promptCustom?: string
) => {
  const apiKey = storage.getString("gemini_api_key") || process.env.EXPO_PUBLIC_GEMINI_API;
  
  if (!apiKey) throw new Error("MISSING_API_KEY");

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
    2. Provide an equal mix of 'multiple_choice' and 'fill_in_the_blank'.
    3. Difficulty level: ${difficulty}.
  `;

  const prompt = promptCustom ? promptCustom : promptPredined;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const data = JSON.parse(response.text());

  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
  storage.set(id, JSON.stringify(data));
  addQuizIdToStorage(id);

  return data;
};