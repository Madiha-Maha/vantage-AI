import { GoogleGenAI, Type } from "@google/genai";
import { InterviewConfig, InterviewQuestion, QuestionAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiService {
  static async generateQuestions(config: InterviewConfig, count: number = 5): Promise<InterviewQuestion[]> {
    const prompt = `Generate ${count} interview questions for a ${config.role} position in the ${config.industry} industry at ${config.difficulty} difficulty level. 
    Return the result as a JSON array of objects with an 'id' and 'text' field.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
            },
            required: ["id", "text"],
          },
        },
      },
    });

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Failed to parse questions", e);
      return [];
    }
  }

  static async analyzeAnswer(
    question: string,
    transcript: string,
    durationSeconds: number,
    role: string
  ): Promise<QuestionAnalysis> {
    const wordCount = transcript.split(/\s+/).length;
    const speakingSpeed = Math.round((wordCount / durationSeconds) * 60);

    const prompt = `Analyze the following interview answer for a ${role} position.
    Question: "${question}"
    Answer Transcript: "${transcript}"
    Speaking Speed: ${speakingSpeed} words per minute.

    Provide a detailed analysis including:
    1. A score from 0-100 based on relevance and quality.
    2. A confidence score from 0-100 (estimated from tone and word choice).
    3. Keywords found that are relevant to the role.
    4. 3 specific improvement tips.
    5. An estimated eye contact score from 0-100 (since we can't see the video here, base it on the clarity and directness of the speech).

    Return as JSON matching the QuestionAnalysis interface.
    CRITICAL: In your tips and analysis, do NOT refer to yourself as an AI, bot, or machine. Provide feedback as a professional assessor.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            speakingSpeed: { type: Type.NUMBER },
            keywordsFound: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            eyeContactScore: { type: Type.NUMBER },
          },
          required: ["score", "confidence", "speakingSpeed", "keywordsFound", "tips", "eyeContactScore"],
        },
      },
    });

    try {
      const analysis = JSON.parse(response.text);
      // Ensure speaking speed is what we calculated or what the engine adjusted
      return { ...analysis, speakingSpeed };
    } catch (e) {
      console.error("Failed to parse analysis", e);
      return {
        score: 0,
        confidence: 0,
        speakingSpeed,
        keywordsFound: [],
        tips: ["Could not analyze answer. Please try again."],
        eyeContactScore: 0,
      };
    }
  }

  static async askMentor(question: string, userQuery: string, role: string, industry: string): Promise<string> {
    const prompt = `
      You are an elite career coach and expert interviewer. 
      The candidate is practicing for a ${role} role in the ${industry} industry.
      
      Current Interview Question: "${question}"
      Candidate's Question to you: "${userQuery}"
      
      Provide a highly professional, encouraging, and tactical response. If they ask for a hint, give them structural points (e.g., "Mention your experience with X"). If they ask for a sample answer, provide a concise high-impact response.
      
      Keep the response professional, concise, and insightful.
      CRITICAL: Do NOT mention that you are an AI, bot, machine, or large language model. Speak from the perspective of a senior human mentor or career coach.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text || "Focus on the STAR method (Situation, Task, Action, Result) to structure your response.";
    } catch (error) {
      return "I'm having trouble connecting to my neural network. Try focusing on your core value proposition.";
    }
  }
}
