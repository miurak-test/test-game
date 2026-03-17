import type { NPC } from "@/types";

export const NPCS: NPC[] = [
  {
    id: "tanuki",
    name: "タヌキチ",
    spriteKey: "npc_tanuki",
    personality: "cheerful",
    giftPreferences: ["food"],
  },
  {
    id: "kitsune",
    name: "キツネ丸",
    spriteKey: "npc_kitsune",
    personality: "mysterious",
    giftPreferences: ["book"],
  },
  {
    id: "usagi",
    name: "ウサミ",
    spriteKey: "npc_usagi",
    personality: "gentle",
    giftPreferences: ["flower"],
  },
  {
    id: "kuma",
    name: "クマ太郎",
    spriteKey: "npc_kuma",
    personality: "bold",
    giftPreferences: ["craft"],
  },
];
