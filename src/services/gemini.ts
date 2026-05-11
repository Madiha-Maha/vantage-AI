import { GoogleGenAI, Type } from "@google/genai";
import { InterviewConfig, InterviewQuestion, QuestionAnalysis } from "../types";

let aiInstance: any = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please provide it in the settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const MODEL_NAME = "gemini-1.5-flash";

const extractJson = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.warn("JSON extraction failed", e);
    return null;
  }
};

export class GeminiService {
  static async generateQuestions(config: InterviewConfig, count: number = 5): Promise<InterviewQuestion[]> {
    const prompt = `Role: ${config.role}, Difficulty: ${config.difficulty}, Industry: ${config.industry}. Generate ${count} interview questions.`;

    try {
      const model = getAI().getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["id", "text"]
            }
          }
        }
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      return extractJson(text) || [
        { id: "1", text: "Tell me about your career highlights." },
        { id: "2", text: "How do you handle difficult workplace challenges?" }
      ];
    } catch (e) {
      console.error("Fast Question Generation Failed", e);
      return [
        { id: "1", text: "Tell me about your career highlights." },
        { id: "2", text: "How do you handle difficult workplace challenges?" }
      ];
    }
  }

  static async analyzeAnswer(
    question: string,
    transcript: string,
    durationSeconds: number,
    role: string
  ): Promise<QuestionAnalysis> {
    const wordCount = (transcript || "").split(/\s+/).length;
    const speakingSpeed = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

    const prompt = `Role: ${role}. Q: "${question}". A: "${transcript}". Speed: ${speakingSpeed}wpm.`;

    try {
      const model = getAI().getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              keywordsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } },
              eyeContactScore: { type: Type.NUMBER }
            },
            required: ["score", "confidence", "keywordsFound", "tips", "eyeContactScore"]
          }
        }
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      const analysis = extractJson(text);
      if (!analysis) throw new Error("Could not parse analysis");
      return { ...analysis, speakingSpeed };
    } catch (e) {
      console.error("Failed to parse analysis", e);
      return {
        score: 75,
        confidence: 80,
        speakingSpeed,
        keywordsFound: [],
        tips: ["Consider using the STAR method for more structure.", "Maintain steady pacing throughout your response.", "Try to use more industry-specific terminology."],
        eyeContactScore: 85,
      };
    }
  }

  static async askMentor(question: string, userQuery: string, role: string, industry: string): Promise<string> {
    const prompt = `
      You are an elite career coach and expert interviewer. 
      The candidate is practicing for a ${role} role in the ${industry} industry.
      
      Current Interview Question: "${question}"
      Candidate's Question to you: "${userQuery}"
      
      Provide a professional, encouraging response. 
      Keep it tactical and concise.
      
      CRITICAL: Speak as a human human mentor. Never mention being an AI.
    `;

    try {
      const model = getAI().getGenerativeModel({ model: MODEL_NAME });
      const response = await model.generateContent(prompt);
      return response.response.text() || "Focus on the STAR method (Situation, Task, Action, Result) to structure your response.";
    } catch (error) {
      return "I'm having trouble connecting (Neural Link Down). Try focusing on your core value proposition.";
    }
  }

  static async askMentorStream(
    question: string, 
    userQuery: string, 
    role: string, 
    industry: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const prompt = `
      You are an elite career coach and expert interviewer. 
      The candidate is practicing for a ${role} role in the ${industry} industry.
      
      Current Interview Question: "${question}"
      Candidate's Question to you: "${userQuery}"
      
      Provide a highly professional, encouraging, and tactical response. If they ask for a hint, give them structural points. If they ask for a sample answer, provide a concise high-impact response.
      
      Keep the response professional, concise, and insightful.
      CRITICAL: Do NOT mention that you are an AI, bot, machine, or large language model. Speak from the perspective of a senior human mentor or career coach.
    `;

    try {
      const model = getAI().getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) onChunk(text);
      }
    } catch (error) {
      console.error("Streaming error:", error);
      throw error;
    }
  }
}
