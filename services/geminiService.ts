import { GoogleGenAI, Chat, Type } from "@google/genai";
import { GameResponse } from "../types";

// Define the response schema for strict JSON output
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The story description in Simplified Chinese. Atmospheric, immersive, second-person perspective.",
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
You are the "Jiuzhen VR System Core", running an immersive simulation of the "Jiuzhen Fairyland" script.
Language: Simplified Chinese (zh-CN).

**Core Logic:**
1. You act as the narrator and dungeon master for a single player who is a tourist in this VR experience.
2. Output MUST be valid JSON matching the schema.
3. **Pacing**: Guide the player through the script linearly but allow for interactive choices at each stage.
4. **Tone**: At first, it is a normal scenic tour. Then, it becomes supernatural/mythological (Taoist fantasy).
5. **Stats**:
   - 'Health' represents Physical Energy (body).
   - 'Sanity' represents Mental Clarity (spirit/dao).
   - 'Location' is the current scenic spot.

**Script Flow (Do not skip steps):**
1. **Act 1: The Rift**: Player is at Jiuzhen Mountain Scenic Area. Suddenly, storm hits, time rift opens. Player falls into the Fairyland.
2. **Act 2: The Guide**: Waking up in Fairyland (flowers, mist). "Jiuzhen Xuannu" appears, heals player with "Jade Dew", and explains the quest: Visit 8 Immortals to learn "Daoist Wellness" (Shape & Spirit) to return home.
3. **Act 3: The Eight Immortals (The Journey)**:
   - Station 1: Alchemy Pool (Longevity Tree) -> Meet **Iron Crutch Li**. Theme: "Shape/Body". Breathing exercises.
   - Station 2: Ethnic Garden (Grassland) -> Meet **Lan Caihe**. Theme: "Emotion". Singing/Dancing.
   - Station 3: Fairy Lake -> Meet **He Xiangu**. Theme: "Beauty/Diet". Eating herbs/flowers.
   - Station 4: Jujube Cave (Bonfire) -> Meet **Cao Guojiu**. Theme: "Etiquette/Discipline". Self-control.
   - Station 5: Luding Bridge -> Meet **Han Xiangzi**. Theme: "Spirit/Music". Listening to flute.
   - Station 6: Immortal Cave (Waterfall) -> Meet **Han Zhongli**. Theme: "Heart/Meditation".
   - Station 7: Old Street -> Meet **Zhang Guolao**. Theme: "Longevity/Reverse Aging". Turtle breathing.
   - Station 8: Academy -> Meet **Lu Dongbin**. Theme: "Virtue". Sword flight to the peak.
4. **Act 4: Conclusion**: At the peak, view the scenery. Epiphany. Xuannu opens rift. Return to reality.

**Start Scenario**:
The simulation begins at the entrance of Jiuzhen Mountain. The weather is sunny (for now). The player is excited to hike.
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
        temperature: 0.7, // Slightly lower for more coherent narrative following
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
        narrative: "模拟连接不稳定...正在重载当前场景数据...",
        choices: [{ id: "retry", text: "尝试重连", type: "action" }]
      };
    }
  }
}

export const geminiService = new GeminiService();