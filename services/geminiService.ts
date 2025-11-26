import { GoogleGenAI, Chat, Type } from "@google/genai";
import { GameResponse, PlayerStats, InventoryItem } from "../types";

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
    scene_objects: {
      type: Type.ARRAY,
      description: "Interactive environmental elements, items, or clues visible in the current scene.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: "Name of the object" },
          type: { type: Type.STRING, enum: ['item', 'clue', 'default'], description: "Type of interaction expected" }
        }
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
      description: "Items added (positive qty) or removed/used (negative qty)",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: "Item name in Chinese" },
          quantity: { type: Type.NUMBER, description: "Positive to add, Negative to use/remove" }
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
5. **Interactive Objects**: ALWAYS provide 1-3 'scene_objects' in the JSON response representing things the player can see or investigate in the current environment.

**Handling User Actions:**
- **Standard Action**: Advance story based on choice.
- **Scan/Investigate**: If action is "系统扫描目标：[Name]", describe it.
- **Item Usage**: If action starts with "使用道具：[Name]", determine the effect based on the item and context:
    - **Healing/Consumable**: Recover HP/Sanity and consume the item (return 'item_update' with negative quantity).
    - **Key Item**: If it solves a puzzle or helps the NPC, trigger a positive outcome.
    - **Irrelevant**: If the item has no use here, describe the failure but do not consume it (unless it's a one-time use thing that was wasted).

**Stats & Inventory Context:**
- You will receive the player's current status and inventory in the prompt. USE THIS to determine if they can actually perform actions or if specific dialogue options should appear.
- **Health**: Physical Energy. If reckless, REDUCE it.
- **Sanity**: Mental Clarity.
- **Item Updates**: To remove an item (used), send negative quantity (e.g., -1). To add, send positive.

**Script Flow (Do not skip steps):**
1. **Act 1: The Rift**: Jiuzhen Mountain -> Storm -> Rift.
2. **Act 2: The Guide**: Fairyland -> Xuannu -> Jade Dew (Heals).
3. **Act 3: The Eight Immortals**:
   - Iron Crutch Li (Body/Breath)
   - Lan Caihe (Emotion/Song)
   - He Xiangu (Diet/Beauty)
   - Cao Guojiu (Discipline)
   - Han Xiangzi (Music)
   - Han Zhongli (Meditation)
   - Zhang Guolao (Reverse Aging)
   - Lu Dongbin (Virtue/Flight)
4. **Act 4: Conclusion**: Peak -> Epiphany -> Return.

**Start Scenario**:
The simulation begins at the entrance of Jiuzhen Mountain. Sunny weather.
`;

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
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

  async sendAction(action: string, context?: { stats: PlayerStats, inventory: InventoryItem[] }): Promise<GameResponse> {
    if (!this.chat) {
      this.startSession();
    }
    
    if (!this.chat) throw new Error("Chat session failed to initialize");

    let finalPrompt = action;
    if (context) {
        // We invisibly append the context to the user message so Gemini knows the state
        // This helps it validate item usage or generate context-aware choices
        const inventoryStr = context.inventory.map(i => `${i.name} x${i.quantity}`).join(', ');
        finalPrompt = `${action}\n\n[SYSTEM DATA - Current State]\nLocation: ${context.stats.location}\nHealth: ${context.stats.health}\nSanity: ${context.stats.sanity}\nInventory: [${inventoryStr}]`;
    }

    try {
      const result = await this.chat.sendMessage({ message: finalPrompt });
      const text = result.text;
      if (!text) throw new Error("Empty response");
      
      return JSON.parse(text) as GameResponse;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        narrative: "模拟连接不稳定...正在重载当前场景数据...",
        choices: [{ id: "retry", text: "尝试重连", type: "action" }]
      };
    }
  }
}

export const geminiService = new GeminiService();