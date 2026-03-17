import type { EventTemplate } from "@/types";

export const RARE_EVENTS: EventTemplate[] = [
  {
    id: "rare-shooting-star",
    season: "summer",
    baseTitle: "流れ星",
    baseDescription: "夜空に大きな流れ星が流れた！願い事を！",
    tileTypes: ["life", "romance", "happening"],
    isRare: true,
    weatherVariants: {
      sunny: { titleSuffix: "（満天の夜空）", effectModifier: { happiness: { culture: 3 } } },
      rainy: { titleSuffix: "（雲の切れ間から）", descriptionOverride: "一瞬の雲の切れ間に流れ星が見えた。", effectModifier: { happiness: { culture: 2 } } },
      snowy: { titleSuffix: "（雪と流星）", descriptionOverride: "雪と流れ星の幻想的な光景。", effectModifier: { happiness: { culture: 3, nature: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「お願い事...した？」", effectModifier: { affinity: [{ npcId: "usagi", change: 3 }] } },
    },
    choices: [
      { id: "rare-ss-c1", text: "友情を願う", effects: { happiness: { social: 3 } } },
      { id: "rare-ss-c2", text: "成長を願う", effects: { happiness: { creation: 2, culture: 1 }, insight: 2 } },
    ],
  },
  {
    id: "rare-rainbow",
    season: "spring",
    baseTitle: "二重虹",
    baseDescription: "空に珍しい二重の虹がかかった！",
    tileTypes: ["life", "festival", "happening"],
    isRare: true,
    weatherVariants: {
      sunny: { titleSuffix: "（雨上がり）", effectModifier: { happiness: { nature: 3 } } },
      rainy: { titleSuffix: "（虹の架け橋）", descriptionOverride: "雨が止む瞬間、二重の虹が現れた。", effectModifier: { happiness: { nature: 3, culture: 1 } } },
      snowy: { titleSuffix: "（白い虹）", descriptionOverride: "珍しい白い虹（霧虹）が出た。", effectModifier: { happiness: { nature: 2, culture: 2 } } },
    },
    choices: [
      { id: "rare-rb-c1", text: "写真に収める", effects: { happiness: { creation: 2, nature: 1 } } },
      { id: "rare-rb-c2", text: "みんなに知らせる", effects: { happiness: { social: 3 } } },
    ],
  },
  {
    id: "rare-four-leaf",
    season: "spring",
    baseTitle: "四つ葉のクローバー",
    baseDescription: "草原で四つ葉のクローバーを見つけた！",
    tileTypes: ["life", "romance"],
    isRare: true,
    weatherVariants: {
      sunny: { titleSuffix: "（幸運の象徴）", effectModifier: { happiness: { nature: 2 } } },
      rainy: { titleSuffix: "（雨粒の宝石）", descriptionOverride: "雨に濡れた四つ葉が光っている。", effectModifier: { happiness: { nature: 2 } } },
      snowy: { titleSuffix: "（雪の下から）", descriptionOverride: "雪をかき分けたら四つ葉が。", effectModifier: { happiness: { nature: 3 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「幸せのおすそわけ...ほしいな。」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }], romance: { npcId: "usagi", change: 1 } } },
    },
    choices: [
      { id: "rare-fl-c1", text: "しおりにする", effects: { happiness: { nature: 1, creation: 1 }, title: "lucky_finder" } },
      { id: "rare-fl-c2", text: "誰かにプレゼントする", effects: { happiness: { social: 2, nature: 1 } } },
    ],
  },
  {
    id: "rare-aurora",
    season: "winter",
    baseTitle: "オーロラ",
    baseDescription: "空に美しいオーロラが出現した！この地域では極めて珍しい。",
    tileTypes: ["life", "romance", "happening"],
    isRare: true,
    weatherVariants: {
      sunny: { titleSuffix: "（澄んだ夜空）", effectModifier: { happiness: { nature: 3, culture: 2 } } },
      rainy: { titleSuffix: "（雲間のオーロラ）", descriptionOverride: "雲の切れ間から一瞬だけオーロラが見えた。", effectModifier: { happiness: { nature: 2, culture: 1 } } },
      snowy: { titleSuffix: "（雪とオーロラ）", descriptionOverride: "雪原に反射するオーロラの光。", effectModifier: { happiness: { nature: 3, culture: 3 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「これは...百年に一度の現象だ。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 3 }] } },
    },
    choices: [
      { id: "rare-au-c1", text: "時間を忘れて見入る", effects: { happiness: { nature: 3, culture: 2 } } },
      { id: "rare-au-c2", text: "絵に描き留める", effects: { happiness: { creation: 3, culture: 1 } } },
    ],
  },
  {
    id: "rare-golden-fish",
    season: "summer",
    baseTitle: "金色の魚",
    baseDescription: "川で金色に輝く不思議な魚を見かけた。",
    tileTypes: ["life", "happening"],
    isRare: true,
    weatherVariants: {
      sunny: { titleSuffix: "（きらめく水面）", effectModifier: { happiness: { nature: 2, money: 1 } } },
      rainy: { titleSuffix: "（雨の川面）", descriptionOverride: "雨の中、川面が金色に光った。", effectModifier: { happiness: { nature: 2 } } },
      snowy: { titleSuffix: "（冷たい水の中）", descriptionOverride: "冷たい水の中で金色の魚が泳いでいる。", effectModifier: { happiness: { nature: 2 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「あれは伝説の...いや、何でもない。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
    },
    choices: [
      { id: "rare-gf-c1", text: "捕まえてみる", effects: { happiness: { nature: 2, money: 2 }, fatigue: 1 } },
      { id: "rare-gf-c2", text: "眺めて楽しむ", effects: { happiness: { nature: 2, culture: 1 } } },
    ],
  },
  {
    id: "rare-ancient-tree",
    season: "autumn",
    baseTitle: "千年樹の目覚め",
    baseDescription: "村の外れの古木が、突然花を咲かせた。",
    tileTypes: ["life", "happening", "festival"],
    isRare: true,
    weatherVariants: {
      sunny: { titleSuffix: "（黄金の花）", effectModifier: { happiness: { nature: 3, culture: 1 } } },
      rainy: { titleSuffix: "（雨中の開花）", descriptionOverride: "雨の中で千年樹が花を開く。", effectModifier: { happiness: { nature: 2, culture: 2 } } },
      snowy: { titleSuffix: "（雪中花）", descriptionOverride: "雪の中で花を咲かせる千年樹。", effectModifier: { happiness: { nature: 3, culture: 2 } } },
    },
    choices: [
      { id: "rare-at-c1", text: "花びらを集める", effects: { happiness: { nature: 2, creation: 1 }, title: "nature_guardian" } },
      { id: "rare-at-c2", text: "木の下で瞑想する", effects: { happiness: { nature: 2, culture: 1 }, insight: 3 } },
    ],
  },
  {
    id: "rare-crystal-snow",
    season: "winter",
    baseTitle: "結晶の雪",
    baseDescription: "完璧な六角形の結晶の雪が降ってきた。",
    tileTypes: ["life", "rest", "happening"],
    isRare: true,
    weatherVariants: {
      sunny: { titleSuffix: "（陽光の結晶）", descriptionOverride: "日差しに輝く結晶の雪。", effectModifier: { happiness: { nature: 2, creation: 1 } } },
      rainy: { titleSuffix: "（みぞれ結晶）", descriptionOverride: "雨と雪の中に結晶が混じる。", effectModifier: { happiness: { nature: 1, creation: 1 } } },
      snowy: { titleSuffix: "（降り注ぐ結晶）", effectModifier: { happiness: { nature: 3, creation: 2 } } },
    },
    choices: [
      { id: "rare-cs-c1", text: "顕微鏡で観察する", effects: { happiness: { creation: 2, culture: 1 }, insight: 2 } },
      { id: "rare-cs-c2", text: "雪の結晶アートを作る", effects: { happiness: { creation: 3 } } },
    ],
  },
  {
    id: "rare-firefly-dance",
    season: "summer",
    baseTitle: "蛍の大群舞",
    baseDescription: "川沿いに数百匹の蛍が舞い踊っている。",
    tileTypes: ["life", "romance", "happening"],
    isRare: true,
    weatherVariants: {
      sunny: { titleSuffix: "（初夏の夜）", effectModifier: { happiness: { nature: 3 } } },
      rainy: { titleSuffix: "（雨上がりの光）", descriptionOverride: "雨上がりの湿った空気の中で蛍が舞う。", effectModifier: { happiness: { nature: 2, culture: 1 } } },
      snowy: { titleSuffix: "（幻の蛍）", descriptionOverride: "寒さの中で光る蛍...幻かもしれない。", effectModifier: { happiness: { nature: 2, culture: 2 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「きれい...夢みたい...」", effectModifier: { affinity: [{ npcId: "usagi", change: 3 }], romance: { npcId: "usagi", change: 1 } } },
      kitsune: { dialogueOverride: "キツネ丸「この光には不思議な力がある。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
    },
    choices: [
      { id: "rare-ff-c1", text: "光の中を歩く", effects: { happiness: { nature: 3, culture: 1 } } },
      { id: "rare-ff-c2", text: "写真を撮って記録する", effects: { happiness: { creation: 2, nature: 1 } } },
    ],
  },
];
