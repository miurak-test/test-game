export type Gender = "male" | "female";

export interface PlayerCharacter {
  name: string;
  gender: Gender;
  spriteKey: string;
}

export interface NPC {
  id: string;
  name: string;
  spriteKey: string;
  personality: string;
  giftPreferences: string[];
}

export interface NPCAffinity {
  npcId: string;
  level: number; // 0-100
  romanceLevel: number; // 0-100
}
