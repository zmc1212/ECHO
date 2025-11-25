import { GoogleGenAI, Chat, Type } from "@google/genai";
import { GameResponse } from "../types";

// Define the response schema for strict JSON output
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The story description, keep it atmospheric and under 150 words.",
    },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "The action text shown on the button" },
          type: { 
            type: Type.STRING, 
            description: "The category of action",
            enum: ["action", "investigate", "danger"] 
          }
        },
        required: ["id", "text"]
      }
    },
    stats_update: {
      type: Type.OBJECT,
      description: "Optional updates to player stats",
      properties: {
        health: { type: Type.NUMBER },
        sanity: { type: Type.NUMBER },
        location: { type: Type.STRING }
      }
    }
  },
  required: ["narrative", "choices"]
};

const SYSTEM_INSTRUCTION = `
You are "MOTHER", the central AI of colony station "Talos-IV" (Year 1996, Alt-Timeline).
Genre: Cassette Futurism / Cosmic Horror.
Language: Simplified Chinese (zh-CN).

Your goal is to run a text adventure.
1. Output MUST be valid JSON matching the schema.
2. Narrative: Dry, technical, atmospheric. 
3. Choices: Provide 2-4 distinct choices.
4. Stats: Update health/sanity if the user takes damage or sees something scary.

Start: The user wakes up in a cryo-pod. Alarms are ringing.
`;

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  startSession(): void {
    this.chat = this.ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
  }

  async sendAction(action: string): Promise<GameResponse> {
    if (!this.chat) {
      this.startSession();
    }
    
    if (!this.chat) throw new Error("Chat session failed to initialize");

    try {
      const result = await this.chat.sendMessage({ message: action });
      const text = result.text;
      if (!text) throw new Error("Empty response");
      
      return JSON.parse(text) as GameResponse;
    } catch (error) {
      console.error("Gemini API Error:", error);
      // Fallback for error handling to keep game alive
      return {
        narrative: "SYSTEM ERROR: DATA CORRUPTION DETECTED. RETRYING...",
        choices: [{ id: "retry", text: "Reboot System", type: "action" }]
      };
    }
  }
}

export const geminiService = new GeminiService();