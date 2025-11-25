import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the central mainframe AI "MOTHER" of the colony station "Talos-IV". The current year is 1996 (Alternate Timeline). 
The aesthetic is Cassette Futurism: high-tech analog, chunky data tapes, CRT monitors, and neon.
The user is an awakened sleeper agent or crew member. 
Genre: Sci-Fi / Horror / Mystery.

Instructions:
1. Act as a text adventure engine (Dungeon Master).
2. Use a dry, technical, slightly ominous tone. mimic old terminal outputs.
3. Keep descriptions vivid but concise (under 150 words per turn).
4. Use formatting like timestamps [08:42:01] or status codes <STATUS: CRITICAL>.
5. Provide 2-4 actionable choices at the end of your response formatted clearly (e.g., "[1] Check the airlock").
6. Track the player's status (Health, Inventory) internally and mention it if it changes.
7. Language: Simplified Chinese (zh-CN).

Start the game by describing the user waking up from cryosleep with a system error alarm blaring.
`;

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.error("API_KEY is missing from environment");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  startSession(): void {
    this.chat = this.ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });
  }

  async sendMessageStream(message: string): Promise<AsyncIterable<string>> {
    if (!this.chat) {
      this.startSession();
    }
    
    if (!this.chat) throw new Error("Chat session failed to initialize");

    try {
      const result = await this.chat.sendMessageStream({ message });
      
      // Create a generator to yield text chunks
      async function* streamGenerator(responseStream: any) {
        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            yield text;
          }
        }
      }

      return streamGenerator(result);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();