import type { TitleDefinition } from "@/types";

export const TITLE_DEFINITIONS: TitleDefinition[] = [
  {
    id: "balance_award",
    name: "バランス賞",
    description: "3軸すべてが均等に高い",
    condition: { type: "axis_balance", minEach: 8 },
  },
  {
    id: "culture_award",
    name: "文化人賞",
    description: "文化の幸福が特に高い",
    condition: { type: "pillar_threshold", pillar: "culture", min: 15 },
    unlocksEvents: ["rare_culture_festival"],
  },
  {
    id: "friendship_master",
    name: "友情の達人",
    description: "全NPCと高い好感度",
    condition: { type: "affinity_count", minLevel: 50, count: 4 },
    unlocksEvents: ["rare_group_event"],
  },
  {
    id: "nature_lover",
    name: "自然愛好家",
    description: "自然の幸福が特に高い",
    condition: { type: "pillar_threshold", pillar: "nature", min: 15 },
  },
  {
    id: "merchant",
    name: "商売上手",
    description: "お金の幸福が特に高い",
    condition: { type: "pillar_threshold", pillar: "money", min: 15 },
  },
  {
    id: "social_butterfly",
    name: "社交の蝶",
    description: "社交の幸福が特に高い",
    condition: { type: "pillar_threshold", pillar: "social", min: 15 },
  },
  {
    id: "creator",
    name: "クリエイター",
    description: "創作の幸福が特に高い",
    condition: { type: "pillar_threshold", pillar: "creation", min: 15 },
  },
  {
    id: "adventurer",
    name: "冒険家",
    description: "多くのイベントを経験",
    condition: { type: "event_count", count: 15 },
  },
];
