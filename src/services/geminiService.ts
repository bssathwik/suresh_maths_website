import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../data/mockData";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuiz(subjectName: string, difficulty: string): Promise<{ title: string, questions: Question[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a challenging and educational quiz for the subject: ${subjectName}. 
      The difficulty level should be: ${difficulty}. 
      Provide 5 multiple-choice questions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "questions"],
          properties: {
            title: {
              type: Type.STRING,
              description: "The title of the generated quiz.",
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["text", "options", "correctAnswer"],
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The question text.",
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options for the question.",
                  },
                  correctAnswer: {
                    type: Type.INTEGER,
                    description: "The index of the correct option (0-3).",
                  },
                },
              },
            },
          },
        },
      },
    });

    const result = JSON.parse(response.text);
    
    // Map to include IDs
    return {
      title: result.title,
      questions: result.questions.map((q: any, i: number) => ({
        id: `ai-gen-${Date.now()}-${i}`,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz. Please check your API key and connection.");
  }
}
