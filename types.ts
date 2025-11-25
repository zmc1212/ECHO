export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  isTyping?: boolean;
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