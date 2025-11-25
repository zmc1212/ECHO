export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}

export enum GameStatus {
  BOOTING,
  RUNNING,
  TERMINATED
}

export interface PlayerStats {
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