import { GoogleGenAI, Chat, Type } from "@google/genai";
import { GameResponse } from "../types";

// Define the response schema for strict JSON output
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The story description in Simplified Chinese. Keep it atmospheric, sci-fi/horror, max 100 words.",
    },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "Action text on button (Chinese)" },
          type: { 
            type: Type.STRING, 
            description: "Action category",
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
        location: { type: Type.STRING, description: "Current location name in Chinese" }
      }
    },
    item_update: {
      type: Type.ARRAY,
      description: "Items added to inventory",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: "Item name in Chinese" },
          quantity: { type: Type.NUMBER }
        }
      }
    }
  },
  required: ["narrative", "choices"]
};

const SYSTEM_INSTRUCTION = `
You are "MOTHER", the central AI of colony station "Talos-IV" (Year 1996, Alt-Timeline).
Genre: Cassette Futurism / Cosmic Horror.
Language: Simplified Chinese (zh-CN).

Your goal is to run a text adventure game.
1. Output MUST be valid JSON matching the schema.
2. Narrative: Use 'Noto Serif SC' style formal but atmospheric Chinese. Dry, technical, yet unsettling.
3. Choices: Provide 2-4 distinct choices in Chinese.
4. Items: If player finds something, include it in item_update with a Chinese name (e.g., "旧式磁带", "生锈的撬棍", "加密数据盘").
5. Stats: Update health/sanity if damage taken or horror witnessed. Update location name in Chinese.

Start Scenario: The user wakes up in a cryo-pod. Alarms are ringing. Cold mist everywhere.
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
        temperature: 0.8,
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
      // Fallback for error handling
      return {
        narrative: "系统错误：数据流中断。正在尝试重建连接...",
        choices: [{ id: "retry", text: "重启系统", type: "action" }]
      };
    }
  }
}

export const geminiService = new GeminiService();