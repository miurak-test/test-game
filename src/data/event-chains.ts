import type { EventTemplate } from "@/types";

// --- Spring chain: 迷い猫チェーン ---

const springChain: EventTemplate[] = [
  {
    id: "chain-spring-cat-1",
    season: "spring",
    baseTitle: "迷い猫発見",
    baseDescription: "道端で小さな猫を見つけた。お腹が空いているようだ。",
    tileTypes: ["life", "happening"],
    chainId: "spring-cat",
    chainStep: 1,
    weatherVariants: {
      sunny: { titleSuffix: "（陽だまりで）", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（雨の中で）", descriptionOverride: "雨に濡れた子猫を見つけた。", effectModifier: { happiness: { nature: 1, social: 1 } } },
      snowy: { titleSuffix: "（雪の中で）", descriptionOverride: "雪の中で凍えている子猫を発見。", effectModifier: { happiness: { nature: 1, social: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「かわいい...保護しなきゃ。」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }] } },
    },
    choices: [
      { id: "chain-sp-cat-1a", text: "ご飯をあげる", effects: { happiness: { nature: 1, social: 1 }, chainNext: "chain-spring-cat-2" } },
      { id: "chain-sp-cat-1b", text: "そっと見守る", effects: { happiness: { nature: 1 } } },
    ],
  },
  {
    id: "chain-spring-cat-2",
    season: "spring",
    baseTitle: "猫の名付け",
    baseDescription: "猫が懐いてきた。名前をつけてあげよう。",
    tileTypes: ["life", "choice"],
    chainId: "spring-cat",
    chainStep: 2,
    weatherVariants: {
      sunny: { titleSuffix: "（日向ぼっこ）", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（雨宿り）", descriptionOverride: "雨宿りしながら名前を考える。", effectModifier: { happiness: { creation: 1 } } },
      snowy: { titleSuffix: "（室内で）", descriptionOverride: "温かい部屋で猫と過ごす。", effectModifier: { happiness: { nature: 1 } } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「ポンタがいいよ！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "chain-sp-cat-2a", text: "花の名前をつける", effects: { happiness: { nature: 1, creation: 1 }, chainNext: "chain-spring-cat-3" } },
      { id: "chain-sp-cat-2b", text: "食べ物の名前をつける", effects: { happiness: { social: 1, creation: 1 }, chainNext: "chain-spring-cat-3" } },
    ],
  },
  {
    id: "chain-spring-cat-3",
    season: "spring",
    baseTitle: "猫カフェ計画",
    baseDescription: "猫と一緒にカフェを開きたいという夢が芽生えた。",
    tileTypes: ["life", "choice"],
    chainId: "spring-cat",
    chainStep: 3,
    weatherVariants: {
      sunny: { titleSuffix: "（開業日和）", effectModifier: { happiness: { creation: 2 } } },
      rainy: { titleSuffix: "（内装設計）", descriptionOverride: "雨の日に内装を考える。", effectModifier: { happiness: { creation: 1, money: 1 } } },
      snowy: { titleSuffix: "（温かいカフェ）", descriptionOverride: "雪の日に温かいカフェの構想を練る。", effectModifier: { happiness: { creation: 2 } } },
    },
    choices: [
      { id: "chain-sp-cat-3a", text: "本格的に計画する", effects: { happiness: { creation: 2, money: 1 }, title: "cat_lover" } },
      { id: "chain-sp-cat-3b", text: "まずは小さく始める", effects: { happiness: { creation: 1, social: 1 } } },
    ],
  },
];

// --- Summer chain: 秘密の洞窟チェーン ---

const summerChain: EventTemplate[] = [
  {
    id: "chain-summer-cave-1",
    season: "summer",
    baseTitle: "秘密の洞窟発見",
    baseDescription: "山の奥で不思議な洞窟を見つけた。",
    tileTypes: ["life", "happening"],
    chainId: "summer-cave",
    chainStep: 1,
    weatherVariants: {
      sunny: { titleSuffix: "（冒険日和）", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（雨宿り中に）", descriptionOverride: "雨宿りした先に洞窟が。", effectModifier: { happiness: { nature: 1 } } },
      snowy: { titleSuffix: "（涼しい入口）", descriptionOverride: "涼しい風が洞窟から吹いてくる。", effectModifier: { happiness: { nature: 1 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「この洞窟は...何か感じる。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
    },
    choices: [
      { id: "chain-su-cave-1a", text: "中に入る", effects: { happiness: { nature: 2 }, fatigue: 1, chainNext: "chain-summer-cave-2" } },
      { id: "chain-su-cave-1b", text: "入口だけ調べる", effects: { happiness: { nature: 1 } } },
    ],
  },
  {
    id: "chain-summer-cave-2",
    season: "summer",
    baseTitle: "洞窟探検",
    baseDescription: "洞窟の奥には地底湖が広がっていた。",
    tileTypes: ["life", "happening"],
    chainId: "summer-cave",
    chainStep: 2,
    weatherVariants: {
      sunny: { titleSuffix: "（地底の光）", effectModifier: { happiness: { nature: 2 } } },
      rainy: { titleSuffix: "（水滴の音）", descriptionOverride: "雨水が洞窟内に反響する。", effectModifier: { happiness: { nature: 1, culture: 1 } } },
      snowy: { titleSuffix: "（氷の洞窟）", descriptionOverride: "洞窟内に氷柱ができている。", effectModifier: { happiness: { nature: 2, culture: 1 } } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「ここは俺に任せろ！先に行くぜ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 2 }] } },
    },
    choices: [
      { id: "chain-su-cave-2a", text: "さらに奥へ進む", effects: { happiness: { nature: 2 }, fatigue: 2, chainNext: "chain-summer-cave-3" } },
      { id: "chain-su-cave-2b", text: "地底湖で休む", effects: { happiness: { nature: 1 }, fatigue: -1 } },
    ],
  },
  {
    id: "chain-summer-cave-3",
    season: "summer",
    baseTitle: "洞窟の宝物",
    baseDescription: "洞窟の最深部で不思議な光る石を見つけた。",
    tileTypes: ["life", "happening"],
    chainId: "summer-cave",
    chainStep: 3,
    weatherVariants: {
      sunny: { titleSuffix: "（輝く発見）", effectModifier: { happiness: { nature: 2, culture: 1 } } },
      rainy: { titleSuffix: "（雨の奥で）", descriptionOverride: "雨音の奥で石が輝く。", effectModifier: { happiness: { nature: 1, culture: 2 } } },
      snowy: { titleSuffix: "（氷の宝石）", descriptionOverride: "氷の中に光る石が封じられている。", effectModifier: { happiness: { nature: 2, culture: 2 } } },
    },
    choices: [
      { id: "chain-su-cave-3a", text: "持ち帰って研究する", effects: { happiness: { culture: 2, creation: 1 }, title: "explorer" } },
      { id: "chain-su-cave-3b", text: "そっと元に戻す", effects: { happiness: { nature: 2 }, insight: 2 } },
    ],
  },
];

// --- Autumn chain: 収穫祭チェーン ---

const autumnChain: EventTemplate[] = [
  {
    id: "chain-autumn-festival-1",
    season: "autumn",
    baseTitle: "収穫祭の準備",
    baseDescription: "村の収穫祭の準備が始まった。手伝おう。",
    tileTypes: ["life", "festival"],
    chainId: "autumn-festival",
    chainStep: 1,
    weatherVariants: {
      sunny: { titleSuffix: "（準備日和）", effectModifier: { happiness: { social: 1 } } },
      rainy: { titleSuffix: "（雨の中の準備）", descriptionOverride: "雨でも準備は止められない。", effectModifier: { fatigue: 1 } },
      snowy: { titleSuffix: "（寒空の準備）", descriptionOverride: "寒さの中で準備を進める。", effectModifier: { fatigue: 1 } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「飾り付けは任せて！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
      kuma: { dialogueOverride: "クマ太郎「力仕事は俺の出番だ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
    },
    choices: [
      { id: "chain-au-fest-1a", text: "飾り付けを担当する", effects: { happiness: { creation: 2, social: 1 }, chainNext: "chain-autumn-festival-2" } },
      { id: "chain-au-fest-1b", text: "料理の準備をする", effects: { happiness: { creation: 1, social: 1 }, chainNext: "chain-autumn-festival-2" } },
    ],
  },
  {
    id: "chain-autumn-festival-2",
    season: "autumn",
    baseTitle: "収穫祭開催",
    baseDescription: "いよいよ収穫祭当日！みんなで楽しもう。",
    tileTypes: ["festival", "life"],
    chainId: "autumn-festival",
    chainStep: 2,
    weatherVariants: {
      sunny: { titleSuffix: "（大盛況）", effectModifier: { happiness: { social: 2 } } },
      rainy: { titleSuffix: "（室内開催）", descriptionOverride: "雨で室内に変更だが盛り上がりは変わらない。", effectModifier: { happiness: { social: 1 } } },
      snowy: { titleSuffix: "（雪の収穫祭）", descriptionOverride: "雪の中の幻想的な収穫祭。", effectModifier: { happiness: { social: 2, culture: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「みんな楽しそう...嬉しい。」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }] } },
    },
    choices: [
      { id: "chain-au-fest-2a", text: "ステージで歌う", effects: { happiness: { social: 2, culture: 1 }, chainNext: "chain-autumn-festival-3" } },
      { id: "chain-au-fest-2b", text: "裏方でサポート", effects: { happiness: { social: 1, creation: 1 }, chainNext: "chain-autumn-festival-3" } },
    ],
  },
  {
    id: "chain-autumn-festival-3",
    season: "autumn",
    baseTitle: "収穫祭・大成功",
    baseDescription: "収穫祭は大成功に終わった。みんなの笑顔が最高の報酬だ。",
    tileTypes: ["festival", "life"],
    chainId: "autumn-festival",
    chainStep: 3,
    weatherVariants: {
      sunny: { titleSuffix: "（感動のフィナーレ）", effectModifier: { happiness: { social: 2, culture: 1 } } },
      rainy: { titleSuffix: "（雨上がりの虹）", descriptionOverride: "雨が上がり虹が出た。最高のフィナーレ。", effectModifier: { happiness: { social: 2, nature: 1 } } },
      snowy: { titleSuffix: "（雪の祝福）", descriptionOverride: "雪が祝福のように降り注ぐ。", effectModifier: { happiness: { social: 2, culture: 1 } } },
    },
    choices: [
      { id: "chain-au-fest-3a", text: "みんなにスピーチする", effects: { happiness: { social: 3 }, title: "festival_hero" } },
      { id: "chain-au-fest-3b", text: "静かに余韻に浸る", effects: { happiness: { culture: 2, social: 1 } } },
    ],
  },
];

// --- Winter chain: 年越しチェーン ---

const winterChain: EventTemplate[] = [
  {
    id: "chain-winter-newyear-1",
    season: "winter",
    baseTitle: "年越しの準備",
    baseDescription: "大晦日に向けて準備を始めよう。",
    tileTypes: ["life", "festival"],
    chainId: "winter-newyear",
    chainStep: 1,
    weatherVariants: {
      sunny: { titleSuffix: "（冬晴れ）", effectModifier: { happiness: { social: 1 } } },
      rainy: { titleSuffix: "（冷たい雨）", descriptionOverride: "寒い雨だが心は温かい。", effectModifier: { happiness: { social: 1 } } },
      snowy: { titleSuffix: "（雪支度）", descriptionOverride: "雪の中、年越しの買い出しに。", effectModifier: { happiness: { social: 1, nature: 1 } } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「年越しそばの具材買いに行こう！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "chain-wi-ny-1a", text: "みんなを招待する", effects: { happiness: { social: 2 }, chainNext: "chain-winter-newyear-2" } },
      { id: "chain-wi-ny-1b", text: "静かに過ごす", effects: { happiness: { culture: 1 }, chainNext: "chain-winter-newyear-2" } },
    ],
  },
  {
    id: "chain-winter-newyear-2",
    season: "winter",
    baseTitle: "カウントダウン",
    baseDescription: "新年まであと少し。みんなで集まってカウントダウン。",
    tileTypes: ["festival", "life"],
    chainId: "winter-newyear",
    chainStep: 2,
    weatherVariants: {
      sunny: { titleSuffix: "（星空の下で）", effectModifier: { happiness: { social: 2 } } },
      rainy: { titleSuffix: "（室内で）", descriptionOverride: "室内で温かくカウントダウン。", effectModifier: { happiness: { social: 1 } } },
      snowy: { titleSuffix: "（雪の中で）", descriptionOverride: "雪が舞う中でのカウントダウン。", effectModifier: { happiness: { social: 2, nature: 1 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「今年もいろいろあったね...」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
      usagi: { dialogueOverride: "ウサミ「来年も...一緒にいてね。」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }], romance: { npcId: "usagi", change: 1 } } },
    },
    choices: [
      { id: "chain-wi-ny-2a", text: "花火を上げる", effects: { happiness: { social: 2, culture: 1 }, chainNext: "chain-winter-newyear-3" } },
      { id: "chain-wi-ny-2b", text: "除夜の鐘を聞く", effects: { happiness: { culture: 2 }, chainNext: "chain-winter-newyear-3" } },
    ],
  },
  {
    id: "chain-winter-newyear-3",
    season: "winter",
    baseTitle: "新年の抱負",
    baseDescription: "新年を迎えた。今年の抱負を決めよう。",
    tileTypes: ["life", "festival"],
    chainId: "winter-newyear",
    chainStep: 3,
    weatherVariants: {
      sunny: { titleSuffix: "（初日の出）", effectModifier: { happiness: { nature: 2, culture: 1 } } },
      rainy: { titleSuffix: "（雨の元旦）", descriptionOverride: "雨でも新年は新年。前を向こう。", effectModifier: { happiness: { culture: 1 } } },
      snowy: { titleSuffix: "（銀世界の元旦）", descriptionOverride: "一面の雪景色。清々しい新年の朝。", effectModifier: { happiness: { nature: 2, culture: 1 } } },
    },
    choices: [
      { id: "chain-wi-ny-3a", text: "大きな夢を掲げる", effects: { happiness: { creation: 2, culture: 1 }, insight: 2, title: "dreamer" } },
      { id: "chain-wi-ny-3b", text: "日々を大切にする", effects: { happiness: { nature: 1, social: 1, culture: 1 } } },
    ],
  },
];

export const EVENT_CHAINS: EventTemplate[] = [
  ...springChain,
  ...summerChain,
  ...autumnChain,
  ...winterChain,
];
