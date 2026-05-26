import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../data/mockData";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuiz(subjectName: string, difficulty: string): Promise<{ title: string, questions: Question[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

export async function generateQuizWithParams(
  subjectName: string,
  topic: string,
  questionType: 'mcq' | 'true_false' | 'mix',
  difficulty: string,
  numQuestions: number
): Promise<{ title: string, questions: Question[] }> {
  try {
    const typeDescription = questionType === 'mcq' 
      ? 'multiple choice questions with exactly 4 options'
      : questionType === 'true_false'
      ? 'true or false questions with exactly 2 options: ["True", "False"]'
      : 'a mix of multiple choice questions (4 options) and true/false questions (2 options: ["True", "False"])';

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a highly educational and challenging quiz for the subject: ${subjectName}. 
      Topic: ${topic}.
      Difficulty level: ${difficulty}. 
      Question type: ${typeDescription}.
      Please generate exactly ${numQuestions} questions of this format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "questions"],
          properties: {
            title: {
              type: Type.STRING,
              description: "The title of the generated quiz. e.g., 'Grade VI Quiz: Linear Equations - Advanced'.",
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["text", "options", "correctAnswer"],
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The question text, clear and concise.",
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Options. Multiple choice must have 4 options. True/False must have exactly 2 options: ['True', 'False'].",
                  },
                  correctAnswer: {
                    type: Type.INTEGER,
                    description: "The 0-based index of the correct option.",
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
      title: result.title || `${topic} Quiz (${difficulty})`,
      questions: (result.questions || []).map((q: any, i: number) => ({
        id: `ai-gen-${Date.now()}-${i}`,
        text: q.text,
        options: q.options || [],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0
      }))
    };
  } catch (error) {
    console.error("Error generating quiz with params:", error);
    throw new Error("Failed to generate quiz with params. Please check parameters and your connection.");
  }
}
