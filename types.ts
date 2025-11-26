
export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}

export enum GameStatus {
  CHARACTER_SELECT,
  BOOTING,
  RUNNING,
  TERMINATED
}

export interface PlayerStats {
  name: string;
  role: string;
  health: number;
  sanity: number;
  credits: number;
  location: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export interface CharacterPreset {
  id: string;
  name: string;
  role: string;
  description: string;
  stats: Partial<PlayerStats>;
  inventory: InventoryItem[];
  color: string;
  lore?: string[]; // Optional random lore snippets
}

export interface SceneObject {
  id: string;
  name: string;
  type: 'item' | 'clue' | 'default';
  description?: string; // Optional pre-fetched description
}

export interface GameResponse {
  narrative: string;
  choices: Array<{
    id: string;
    text: string;
    type?: 'action' | 'investigate' | 'danger' | 'use_item'; 
  }>;
  scene_objects?: SceneObject[];
  stats_update?: Partial<PlayerStats>;
  item_update?: InventoryItem[];
}
