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
}

export interface GameResponse {
  narrative: string;
  choices: Array<{
    id: string;
    text: string;
    type?: 'action' | 'investigate' | 'danger'; 
  }>;
  stats_update?: Partial<PlayerStats>;
  item_update?: InventoryItem[];
}