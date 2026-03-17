import type { EventTemplate } from "@/types";

// --- Spring templates (8) ---

const springTemplates: EventTemplate[] = [
  {
    id: "sp-hanami",
    season: "spring",
    baseTitle: "お花見",
    baseDescription: "桜の木の下でお弁当を広げよう。",
    tileTypes: ["life", "festival"],
    weatherVariants: {
      sunny: { titleSuffix: "（晴天）", effectModifier: { happiness: { nature: 2 } } },
      rainy: { titleSuffix: "（雨天）", descriptionOverride: "雨の中の桜も風情がある。", effectModifier: { happiness: { culture: 1 } } },
      snowy: { titleSuffix: "（雪桜）", descriptionOverride: "珍しい雪と桜の共演だ。", effectModifier: { happiness: { nature: 1, culture: 1 } } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「花より団子だよね！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
      usagi: { dialogueOverride: "ウサミ「桜きれい...」", effectModifier: { affinity: [{ npcId: "usagi", change: 1 }] } },
    },
    choices: [
      { id: "sp-hanami-c1", text: "みんなで歌う", effects: { happiness: { social: 2 } } },
      { id: "sp-hanami-c2", text: "静かに花を眺める", effects: { happiness: { nature: 1, culture: 1 } } },
    ],
  },
  {
    id: "sp-farming-start",
    season: "spring",
    baseTitle: "農作業開始",
    baseDescription: "春の畑を耕して種をまこう。",
    tileTypes: ["life", "choice"],
    weatherVariants: {
      sunny: { titleSuffix: "（好天）", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（恵みの雨）", descriptionOverride: "雨が土を潤してくれる。", effectModifier: { happiness: { nature: 2 } } },
      snowy: { titleSuffix: "（遅霜注意）", descriptionOverride: "まだ寒い...種まきは慎重に。", effectModifier: { fatigue: 1 } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「力仕事なら任せろ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 2 }] } },
    },
    choices: [
      { id: "sp-farm-c1", text: "野菜の種をまく", effects: { happiness: { nature: 2 }, fatigue: 1 } },
      { id: "sp-farm-c2", text: "花の種をまく", effects: { happiness: { nature: 1, culture: 1 } } },
    ],
  },
  {
    id: "sp-greeting",
    season: "spring",
    baseTitle: "引っ越し挨拶",
    baseDescription: "ご近所さんに挨拶回りをしよう。",
    tileTypes: ["life", "romance"],
    weatherVariants: {
      sunny: { titleSuffix: "（爽やかな朝）", effectModifier: { happiness: { social: 1 } } },
      rainy: { titleSuffix: "（雨の中）", descriptionOverride: "傘をさしながらの挨拶回り。", effectModifier: { fatigue: 1 } },
      snowy: { titleSuffix: "（名残雪）", descriptionOverride: "冷たい風の中、温かい出会いが待っている。", effectModifier: { happiness: { social: 1 } } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「ようこそ！この村は最高だよ！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 2 }] } },
      kitsune: { dialogueOverride: "キツネ丸「ふーん、新入りか。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 1 }] } },
      usagi: { dialogueOverride: "ウサミ「よろしくね...えへへ。」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }] } },
      kuma: { dialogueOverride: "クマ太郎「おう！困ったことがあったら言えよ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
    },
    choices: [
      { id: "sp-greet-c1", text: "手作りお菓子を渡す", effects: { happiness: { social: 2 }, fatigue: 1 } },
      { id: "sp-greet-c2", text: "笑顔で自己紹介する", effects: { happiness: { social: 1 } } },
    ],
  },
  {
    id: "sp-spring-cleaning",
    season: "spring",
    baseTitle: "春の大掃除",
    baseDescription: "家を綺麗にして新しい季節を迎えよう。",
    tileTypes: ["life", "rest"],
    weatherVariants: {
      sunny: { titleSuffix: "（日和）", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（室内集中）", descriptionOverride: "外は雨。室内の掃除に集中しよう。", effectModifier: { happiness: { creation: 1 } } },
      snowy: { titleSuffix: "（寒い日）", descriptionOverride: "寒さに負けずに片付ける。", effectModifier: { fatigue: 1 } },
    },
    choices: [
      { id: "sp-clean-c1", text: "徹底的に磨く", effects: { happiness: { creation: 2 }, fatigue: 2 } },
      { id: "sp-clean-c2", text: "ほどほどにする", effects: { happiness: { creation: 1 } } },
    ],
  },
  {
    id: "sp-butterfly",
    season: "spring",
    baseTitle: "蝶々発見",
    baseDescription: "庭に美しい蝶が舞い降りた。",
    tileTypes: ["life", "happening"],
    weatherVariants: {
      sunny: { titleSuffix: "（陽だまり）", effectModifier: { happiness: { nature: 2 } } },
      rainy: { titleSuffix: "（雨宿り蝶）", descriptionOverride: "雨宿りする蝶を軒下で見つけた。", effectModifier: { happiness: { nature: 1 } } },
      snowy: { titleSuffix: "（幻の蝶）", descriptionOverride: "雪の中を舞う蝶...これは珍しい。", effectModifier: { happiness: { nature: 2, culture: 1 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「あの蝶は...伝説の蝶だ。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
    },
    choices: [
      { id: "sp-btfly-c1", text: "スケッチする", effects: { happiness: { creation: 2 } } },
      { id: "sp-btfly-c2", text: "そっと見守る", effects: { happiness: { nature: 1 } } },
    ],
  },
  {
    id: "sp-herb-garden",
    season: "spring",
    baseTitle: "ハーブ園づくり",
    baseDescription: "庭の一角にハーブを植えよう。",
    tileTypes: ["choice", "life"],
    weatherVariants: {
      sunny: { titleSuffix: "（快晴）", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（雨上がり）", descriptionOverride: "雨上がりの土は植え付けに最適。", effectModifier: { happiness: { nature: 2 } } },
      snowy: { titleSuffix: "（室内栽培）", descriptionOverride: "寒いので室内でポット栽培にしよう。", effectModifier: { happiness: { creation: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「ラベンダーが好き...」", effectModifier: { affinity: [{ npcId: "usagi", change: 1 }] } },
    },
    choices: [
      { id: "sp-herb-c1", text: "料理用ハーブを植える", effects: { happiness: { nature: 1, creation: 1 } } },
      { id: "sp-herb-c2", text: "香りのハーブを植える", effects: { happiness: { nature: 2 } } },
    ],
  },
  {
    id: "sp-market",
    season: "spring",
    baseTitle: "春の青空市場",
    baseDescription: "広場に春の市場が開かれた。",
    tileTypes: ["festival", "happening"],
    weatherVariants: {
      sunny: { titleSuffix: "（大盛況）", effectModifier: { happiness: { money: 1, social: 1 } } },
      rainy: { titleSuffix: "（テント下）", descriptionOverride: "テントの下での賑やかな市場。", effectModifier: { happiness: { money: 1 } } },
      snowy: { titleSuffix: "（寒空市場）", descriptionOverride: "寒いけれど温かい飲み物が並ぶ。", effectModifier: { happiness: { money: 1 } } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「お得な掘り出し物があるよ！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
      kuma: { dialogueOverride: "クマ太郎「うまいもん買っていこうぜ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
    },
    choices: [
      { id: "sp-mkt-c1", text: "珍しい種を買う", effects: { happiness: { nature: 1, money: -1 } } },
      { id: "sp-mkt-c2", text: "手作り品を売る", effects: { happiness: { money: 2, creation: 1 } } },
    ],
  },
  {
    id: "sp-rain-walk",
    season: "spring",
    baseTitle: "春雨散歩",
    baseDescription: "しとしと降る春の雨の中を歩く。",
    tileTypes: ["life", "romance"],
    weatherVariants: {
      sunny: { titleSuffix: "（晴れ間）", descriptionOverride: "雨上がりの虹が見えるかも。", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（本降り）", effectModifier: { happiness: { culture: 1 } } },
      snowy: { titleSuffix: "（みぞれ）", descriptionOverride: "雨と雪が混じる不思議な天気。", effectModifier: { happiness: { nature: 1 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「雨の日は不思議なことが起こるんだ。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
      usagi: { dialogueOverride: "ウサミ「相合傘...しない？」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }], romance: { npcId: "usagi", change: 1 } } },
    },
    choices: [
      { id: "sp-rain-c1", text: "水たまりで遊ぶ", effects: { happiness: { nature: 2 }, fatigue: 1 } },
      { id: "sp-rain-c2", text: "カフェで雨宿り", effects: { happiness: { culture: 1, social: 1 } } },
    ],
  },
];

// --- Summer templates (8) ---

const summerTemplates: EventTemplate[] = [
  {
    id: "su-fireworks",
    season: "summer",
    baseTitle: "花火大会",
    baseDescription: "夜空を彩る花火を見に行こう。",
    tileTypes: ["festival", "romance"],
    weatherVariants: {
      sunny: { titleSuffix: "（満天）", effectModifier: { happiness: { social: 2 } } },
      rainy: { titleSuffix: "（延期危機）", descriptionOverride: "雨で中止になるかも...。", effectModifier: { happiness: { social: 1 } } },
      snowy: { titleSuffix: "（真夏の雪？）", descriptionOverride: "異常気象だが花火は決行だ！", effectModifier: { happiness: { social: 1, culture: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「一緒に見よう...？」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }], romance: { npcId: "usagi", change: 1 } } },
      tanuki: { dialogueOverride: "タヌキチ「屋台で焼きそば食べよう！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "su-fw-c1", text: "特等席で見る", effects: { happiness: { social: 2, culture: 1 } } },
      { id: "su-fw-c2", text: "屋台を楽しむ", effects: { happiness: { social: 1, money: -1 } } },
    ],
  },
  {
    id: "su-river",
    season: "summer",
    baseTitle: "川遊び",
    baseDescription: "涼しい川で水遊びをしよう。",
    tileTypes: ["life", "happening"],
    weatherVariants: {
      sunny: { titleSuffix: "（炎天下）", effectModifier: { happiness: { nature: 2 } } },
      rainy: { titleSuffix: "（増水注意）", descriptionOverride: "雨で水かさが増している。気をつけて。", effectModifier: { fatigue: 1 } },
      snowy: { titleSuffix: "（冷水）", descriptionOverride: "冷たい水だが逆に爽快。", effectModifier: { happiness: { nature: 1 } } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「魚を素手で捕まえてやる！」", effectModifier: { affinity: [{ npcId: "kuma", change: 2 }] } },
      tanuki: { dialogueOverride: "タヌキチ「水鉄砲バトルだ！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "su-rv-c1", text: "飛び込む", effects: { happiness: { nature: 2 }, fatigue: 1 } },
      { id: "su-rv-c2", text: "浅瀬で涼む", effects: { happiness: { nature: 1 } } },
    ],
  },
  {
    id: "su-bug-catching",
    season: "summer",
    baseTitle: "虫取り",
    baseDescription: "夏の虫を探しに林へ出かけよう。",
    tileTypes: ["life", "choice"],
    weatherVariants: {
      sunny: { titleSuffix: "（カブトムシ日和）", effectModifier: { happiness: { nature: 2 } } },
      rainy: { titleSuffix: "（雨上がり）", descriptionOverride: "雨上がりは虫が活発になる。", effectModifier: { happiness: { nature: 1 } } },
      snowy: { titleSuffix: "（珍天候）", descriptionOverride: "虫たちはどこに隠れたのだろう。", effectModifier: { happiness: { nature: 1 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「珍しい虫の居場所を知ってるよ。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
    },
    choices: [
      { id: "su-bug-c1", text: "カブトムシを探す", effects: { happiness: { nature: 2 }, fatigue: 1 } },
      { id: "su-bug-c2", text: "蝶々を観察する", effects: { happiness: { nature: 1, culture: 1 } } },
    ],
  },
  {
    id: "su-watermelon",
    season: "summer",
    baseTitle: "スイカ割り",
    baseDescription: "浜辺でスイカ割り大会だ。",
    tileTypes: ["festival", "life"],
    weatherVariants: {
      sunny: { titleSuffix: "（灼熱）", effectModifier: { happiness: { social: 2 } } },
      rainy: { titleSuffix: "（砂浜びしょ濡れ）", descriptionOverride: "雨の中でもスイカ割りは楽しい！", effectModifier: { happiness: { social: 1 } } },
      snowy: { titleSuffix: "（寒中水泳？）", descriptionOverride: "寒い！でも根性で楽しむ。", effectModifier: { fatigue: 1, happiness: { social: 1 } } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「俺に任せろ！一発だ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
      tanuki: { dialogueOverride: "タヌキチ「右！いや左！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "su-wm-c1", text: "全力で割る", effects: { happiness: { social: 2 }, fatigue: 1 } },
      { id: "su-wm-c2", text: "応援に回る", effects: { happiness: { social: 1 } } },
    ],
  },
  {
    id: "su-stargazing",
    season: "summer",
    baseTitle: "星空観察",
    baseDescription: "夏の夜空を見上げよう。",
    tileTypes: ["life", "romance"],
    weatherVariants: {
      sunny: { titleSuffix: "（天の川）", effectModifier: { happiness: { culture: 2 } } },
      rainy: { titleSuffix: "（曇り空）", descriptionOverride: "雲の切れ間から星を探す。", effectModifier: { happiness: { culture: 1 } } },
      snowy: { titleSuffix: "（夏の雪空）", descriptionOverride: "雪雲の向こうに星が瞬く。", effectModifier: { happiness: { culture: 1 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「あの星座には伝説があるんだ。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
      usagi: { dialogueOverride: "ウサミ「流れ星...お願い事しよう。」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }], romance: { npcId: "usagi", change: 1 } } },
    },
    choices: [
      { id: "su-star-c1", text: "望遠鏡で観察", effects: { happiness: { culture: 2, creation: 1 } } },
      { id: "su-star-c2", text: "寝転んで眺める", effects: { happiness: { nature: 1, culture: 1 } } },
    ],
  },
  {
    id: "su-craft",
    season: "summer",
    baseTitle: "夏休み工作",
    baseDescription: "自由研究の工作に取り組もう。",
    tileTypes: ["choice", "life"],
    weatherVariants: {
      sunny: { titleSuffix: "（屋外制作）", effectModifier: { happiness: { creation: 1 } } },
      rainy: { titleSuffix: "（室内制作）", descriptionOverride: "雨の日は集中して作れる。", effectModifier: { happiness: { creation: 2 } } },
      snowy: { titleSuffix: "（涼しい日）", descriptionOverride: "涼しい中での制作は快適。", effectModifier: { happiness: { creation: 1 } } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「木彫りなら得意だぞ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
    },
    choices: [
      { id: "su-craft-c1", text: "大作に挑戦", effects: { happiness: { creation: 3 }, fatigue: 2 } },
      { id: "su-craft-c2", text: "小物を丁寧に作る", effects: { happiness: { creation: 2 } } },
    ],
  },
  {
    id: "su-fishing",
    season: "summer",
    baseTitle: "釣り大会",
    baseDescription: "夏の釣り大会が開催された。",
    tileTypes: ["happening", "festival"],
    weatherVariants: {
      sunny: { titleSuffix: "（快晴）", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（雨釣り）", descriptionOverride: "雨の方が魚は釣れるという噂。", effectModifier: { happiness: { nature: 2 } } },
      snowy: { titleSuffix: "（寒中釣り）", descriptionOverride: "まさかの雪...でも魚は待ってくれない。", effectModifier: { fatigue: 1 } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「秘密の釣りスポットを教えてあげる。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 1 }] } },
    },
    choices: [
      { id: "su-fish-c1", text: "大物を狙う", effects: { happiness: { nature: 2, money: 1 }, fatigue: 2 } },
      { id: "su-fish-c2", text: "のんびり釣る", effects: { happiness: { nature: 1 } } },
    ],
  },
  {
    id: "su-summer-festival",
    season: "summer",
    baseTitle: "夏祭り",
    baseDescription: "浴衣を着て夏祭りに出かけよう。",
    tileTypes: ["festival", "romance"],
    weatherVariants: {
      sunny: { titleSuffix: "（盛り上がり）", effectModifier: { happiness: { social: 2 } } },
      rainy: { titleSuffix: "（にわか雨）", descriptionOverride: "突然の雨で人々が屋根の下に集まる。", effectModifier: { happiness: { social: 1 } } },
      snowy: { titleSuffix: "（異変）", descriptionOverride: "真夏の雪！？それでも祭りは続く。", effectModifier: { happiness: { social: 1, culture: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「浴衣...似合ってるかな...？」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }], romance: { npcId: "usagi", change: 1 } } },
      tanuki: { dialogueOverride: "タヌキチ「金魚すくい対決だ！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "su-fest-c1", text: "盆踊りに参加", effects: { happiness: { social: 2, culture: 1 } } },
      { id: "su-fest-c2", text: "屋台を巡る", effects: { happiness: { social: 1, money: -1 } } },
      {
        id: "su-fest-c3",
        text: "特別な場所へ案内する",
        requiredAffinity: { npcId: "usagi", minLevel: 30 },
        effects: { happiness: { social: 2 }, romance: { npcId: "usagi", change: 2 } },
      },
    ],
  },
];

// --- Autumn templates (8) ---

const autumnTemplates: EventTemplate[] = [
  {
    id: "au-harvest",
    season: "autumn",
    baseTitle: "収穫祭",
    baseDescription: "実りの秋、収穫を祝おう。",
    tileTypes: ["festival", "life"],
    weatherVariants: {
      sunny: { titleSuffix: "（豊作）", effectModifier: { happiness: { nature: 2, money: 1 } } },
      rainy: { titleSuffix: "（雨の収穫）", descriptionOverride: "雨の中でも収穫は待てない。", effectModifier: { happiness: { nature: 1 }, fatigue: 1 } },
      snowy: { titleSuffix: "（初雪収穫）", descriptionOverride: "初雪と共に最後の収穫。", effectModifier: { happiness: { nature: 1, culture: 1 } } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「今年は大収穫だな！」", effectModifier: { affinity: [{ npcId: "kuma", change: 2 }] } },
      tanuki: { dialogueOverride: "タヌキチ「収穫した芋で焼き芋パーティーだ！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "au-harv-c1", text: "力いっぱい収穫する", effects: { happiness: { nature: 2, money: 1 }, fatigue: 2 } },
      { id: "au-harv-c2", text: "料理を振る舞う", effects: { happiness: { social: 2, creation: 1 } } },
    ],
  },
  {
    id: "au-reading",
    season: "autumn",
    baseTitle: "読書の秋",
    baseDescription: "図書館で秋の読書を楽しもう。",
    tileTypes: ["life", "rest"],
    weatherVariants: {
      sunny: { titleSuffix: "（木漏れ日）", effectModifier: { happiness: { culture: 1 } } },
      rainy: { titleSuffix: "（雨音と本）", descriptionOverride: "雨音をBGMに読書に没頭する。", effectModifier: { happiness: { culture: 2 } } },
      snowy: { titleSuffix: "（暖炉の前）", descriptionOverride: "暖炉の前で本を広げる贅沢な時間。", effectModifier: { happiness: { culture: 2 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「この本は...不思議な力がある。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }], insight: 1 } },
    },
    choices: [
      { id: "au-read-c1", text: "難しい本に挑戦", effects: { happiness: { culture: 2 }, insight: 2 } },
      { id: "au-read-c2", text: "絵本を眺める", effects: { happiness: { culture: 1, creation: 1 } } },
    ],
  },
  {
    id: "au-art",
    season: "autumn",
    baseTitle: "芸術の秋",
    baseDescription: "紅葉をモチーフに絵を描こう。",
    tileTypes: ["choice", "life"],
    weatherVariants: {
      sunny: { titleSuffix: "（紅葉日和）", effectModifier: { happiness: { creation: 2 } } },
      rainy: { titleSuffix: "（雨の色彩）", descriptionOverride: "雨に濡れた紅葉は一層鮮やか。", effectModifier: { happiness: { creation: 1, culture: 1 } } },
      snowy: { titleSuffix: "（雪紅葉）", descriptionOverride: "雪をかぶった紅葉という珍しい景色。", effectModifier: { happiness: { creation: 2, culture: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「一緒に絵を描こう？」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }] } },
    },
    choices: [
      { id: "au-art-c1", text: "風景画を描く", effects: { happiness: { creation: 2, nature: 1 } } },
      { id: "au-art-c2", text: "肖像画を描く", requiredAffinity: { npcId: "usagi", minLevel: 20 }, effects: { happiness: { creation: 2, social: 1 } } },
    ],
  },
  {
    id: "au-mushroom",
    season: "autumn",
    baseTitle: "きのこ狩り",
    baseDescription: "山できのこを探そう。",
    tileTypes: ["life", "happening"],
    weatherVariants: {
      sunny: { titleSuffix: "（秋晴れ）", effectModifier: { happiness: { nature: 1 } } },
      rainy: { titleSuffix: "（雨後のきのこ）", descriptionOverride: "雨の後はきのこがたくさん！", effectModifier: { happiness: { nature: 2 } } },
      snowy: { titleSuffix: "（山の冷え込み）", descriptionOverride: "寒いが珍しいきのこが見つかるかも。", effectModifier: { happiness: { nature: 1 }, fatigue: 1 } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「毒きのこには気をつけるんだよ。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 1 }] } },
      kuma: { dialogueOverride: "クマ太郎「きのこ鍋にしようぜ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
    },
    choices: [
      { id: "au-mush-c1", text: "奥深くまで探す", effects: { happiness: { nature: 2 }, fatigue: 2 } },
      { id: "au-mush-c2", text: "近場で楽しむ", effects: { happiness: { nature: 1 } } },
    ],
  },
  {
    id: "au-moon-viewing",
    season: "autumn",
    baseTitle: "お月見",
    baseDescription: "秋の名月を鑑賞しよう。",
    tileTypes: ["festival", "romance"],
    weatherVariants: {
      sunny: { titleSuffix: "（名月）", effectModifier: { happiness: { culture: 2 } } },
      rainy: { titleSuffix: "（雲隠れ）", descriptionOverride: "月は雲の向こうだが、団子はうまい。", effectModifier: { happiness: { culture: 1 } } },
      snowy: { titleSuffix: "（雪月花）", descriptionOverride: "雪と月の幻想的な組み合わせ。", effectModifier: { happiness: { culture: 2, nature: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「月にはうさぎがいるんだよ。」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }] } },
      kitsune: { dialogueOverride: "キツネ丸「満月の夜は不思議なことが起こる。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 1 }] } },
    },
    choices: [
      { id: "au-moon-c1", text: "月見団子を作る", effects: { happiness: { creation: 1, culture: 1 } } },
      { id: "au-moon-c2", text: "月を眺めて俳句を詠む", effects: { happiness: { culture: 2 } } },
    ],
  },
  {
    id: "au-cooking",
    season: "autumn",
    baseTitle: "秋の料理教室",
    baseDescription: "旬の食材で料理を学ぼう。",
    tileTypes: ["choice", "life"],
    weatherVariants: {
      sunny: { titleSuffix: "（秋日和）", effectModifier: { happiness: { creation: 1 } } },
      rainy: { titleSuffix: "（煮込み日和）", descriptionOverride: "雨の日は煮込み料理にぴったり。", effectModifier: { happiness: { creation: 2 } } },
      snowy: { titleSuffix: "（鍋日和）", descriptionOverride: "寒い日は温かい鍋料理を。", effectModifier: { happiness: { creation: 1, social: 1 } } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「味見係は任せてくれ！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "au-cook-c1", text: "創作料理に挑戦", effects: { happiness: { creation: 2 }, fatigue: 1 } },
      { id: "au-cook-c2", text: "伝統料理を学ぶ", effects: { happiness: { culture: 2 } } },
    ],
  },
  {
    id: "au-autumn-leaves",
    season: "autumn",
    baseTitle: "紅葉狩り",
    baseDescription: "山の紅葉を見に行こう。",
    tileTypes: ["life", "romance"],
    weatherVariants: {
      sunny: { titleSuffix: "（錦秋）", effectModifier: { happiness: { nature: 2 } } },
      rainy: { titleSuffix: "（しぐれ紅葉）", descriptionOverride: "雨に濡れた紅葉が光る。", effectModifier: { happiness: { nature: 1, culture: 1 } } },
      snowy: { titleSuffix: "（冬の足音）", descriptionOverride: "紅葉に雪が積もる珍しい景色。", effectModifier: { happiness: { nature: 2, culture: 1 } } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「紅葉のしおり作ろう...」", effectModifier: { affinity: [{ npcId: "usagi", change: 1 }] } },
    },
    choices: [
      { id: "au-leaf-c1", text: "頂上を目指す", effects: { happiness: { nature: 2 }, fatigue: 2 } },
      { id: "au-leaf-c2", text: "途中の茶屋で休む", effects: { happiness: { nature: 1, culture: 1 } } },
    ],
  },
  {
    id: "au-craft-fair",
    season: "autumn",
    baseTitle: "手作り市",
    baseDescription: "手作りの品が並ぶ秋の市場。",
    tileTypes: ["happening", "festival"],
    weatherVariants: {
      sunny: { titleSuffix: "（賑わい）", effectModifier: { happiness: { money: 1, creation: 1 } } },
      rainy: { titleSuffix: "（テント下）", descriptionOverride: "テントの下で作品を並べる。", effectModifier: { happiness: { creation: 1 } } },
      snowy: { titleSuffix: "（冬支度市）", descriptionOverride: "冬に向けた手作り品が並ぶ。", effectModifier: { happiness: { creation: 1, money: 1 } } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「俺の木彫りも出品するぜ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
    },
    choices: [
      { id: "au-fair-c1", text: "自分の作品を売る", effects: { happiness: { money: 2, creation: 1 } } },
      { id: "au-fair-c2", text: "珍しい品を買う", effects: { happiness: { creation: 1, money: -1 } } },
    ],
  },
];

// --- Winter templates (8) ---

const winterTemplates: EventTemplate[] = [
  {
    id: "wi-onsen",
    season: "winter",
    baseTitle: "温泉旅行",
    baseDescription: "冬の温泉で疲れを癒そう。",
    tileTypes: ["rest", "life"],
    weatherVariants: {
      sunny: { titleSuffix: "（露天風呂）", effectModifier: { happiness: { nature: 1 }, fatigue: -2 } },
      rainy: { titleSuffix: "（雨の温泉）", descriptionOverride: "雨音を聞きながらの入浴。", effectModifier: { happiness: { culture: 1 }, fatigue: -2 } },
      snowy: { titleSuffix: "（雪見風呂）", descriptionOverride: "雪景色を眺めながらの贅沢な入浴。", effectModifier: { happiness: { nature: 2, culture: 1 }, fatigue: -3 } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「いい湯だな～♪」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
      kuma: { dialogueOverride: "クマ太郎「温泉卓球で勝負だ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
    },
    choices: [
      { id: "wi-onsen-c1", text: "ゆっくり浸かる", effects: { happiness: { nature: 1 }, fatigue: -3 } },
      { id: "wi-onsen-c2", text: "湯めぐりする", effects: { happiness: { nature: 2, culture: 1 }, fatigue: -1 } },
    ],
  },
  {
    id: "wi-new-year",
    season: "winter",
    baseTitle: "年越し準備",
    baseDescription: "新年を迎える準備をしよう。",
    tileTypes: ["life", "festival"],
    weatherVariants: {
      sunny: { titleSuffix: "（冬晴れ）", effectModifier: { happiness: { social: 1 } } },
      rainy: { titleSuffix: "（冷たい雨）", descriptionOverride: "寒い雨の中、準備を急ぐ。", effectModifier: { fatigue: 1 } },
      snowy: { titleSuffix: "（銀世界）", descriptionOverride: "雪景色の中の年越し準備。", effectModifier: { happiness: { nature: 1, culture: 1 } } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「餅つきしようよ！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
      usagi: { dialogueOverride: "ウサミ「おせち作り...手伝って？」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }] } },
    },
    choices: [
      { id: "wi-ny-c1", text: "おせちを作る", effects: { happiness: { creation: 2, culture: 1 }, fatigue: 1 } },
      { id: "wi-ny-c2", text: "大掃除をする", effects: { happiness: { creation: 1 } } },
    ],
  },
  {
    id: "wi-snow-play",
    season: "winter",
    baseTitle: "雪遊び",
    baseDescription: "積もった雪で遊ぼう。",
    tileTypes: ["life", "happening"],
    weatherVariants: {
      sunny: { titleSuffix: "（快晴銀世界）", effectModifier: { happiness: { nature: 2 } } },
      rainy: { titleSuffix: "（みぞれ）", descriptionOverride: "雪が雨に変わりかけている。", effectModifier: { happiness: { nature: 1 } } },
      snowy: { titleSuffix: "（大雪）", descriptionOverride: "たっぷり積もった雪で思いきり遊べる！", effectModifier: { happiness: { nature: 2, social: 1 } } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「雪合戦だ！容赦しないぞ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 2 }] } },
      tanuki: { dialogueOverride: "タヌキチ「雪だるま作ろう！」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "wi-snow-c1", text: "雪合戦する", effects: { happiness: { social: 2 }, fatigue: 2 } },
      { id: "wi-snow-c2", text: "雪だるまを作る", effects: { happiness: { creation: 2 } } },
    ],
  },
  {
    id: "wi-knitting",
    season: "winter",
    baseTitle: "編み物",
    baseDescription: "冬の夜長に編み物をしよう。",
    tileTypes: ["rest", "choice"],
    weatherVariants: {
      sunny: { titleSuffix: "（日向で）", effectModifier: { happiness: { creation: 1 } } },
      rainy: { titleSuffix: "（雨の夜）", descriptionOverride: "雨音を聞きながら編み物。", effectModifier: { happiness: { creation: 2 } } },
      snowy: { titleSuffix: "（暖炉の前）", descriptionOverride: "暖炉の前で編み物する至福の時間。", effectModifier: { happiness: { creation: 2 }, fatigue: -1 } },
    },
    npcVariants: {
      usagi: { dialogueOverride: "ウサミ「マフラー...誰かにあげるの？」", effectModifier: { affinity: [{ npcId: "usagi", change: 1 }] } },
    },
    choices: [
      { id: "wi-knit-c1", text: "マフラーを編む", effects: { happiness: { creation: 2 } } },
      {
        id: "wi-knit-c2",
        text: "プレゼント用に編む",
        requiredAffinity: { npcId: "usagi", minLevel: 40 },
        effects: { happiness: { creation: 2, social: 1 }, romance: { npcId: "usagi", change: 2 } },
      },
    ],
  },
  {
    id: "wi-kotatsu",
    season: "winter",
    baseTitle: "こたつでまったり",
    baseDescription: "こたつに入ってみかんを食べよう。",
    tileTypes: ["rest", "life"],
    weatherVariants: {
      sunny: { titleSuffix: "（冬の陽射し）", effectModifier: { happiness: { nature: 1 }, fatigue: -1 } },
      rainy: { titleSuffix: "（冷たい雨）", descriptionOverride: "外は冷たい雨。こたつが最高。", effectModifier: { fatigue: -2 } },
      snowy: { titleSuffix: "（吹雪の日）", descriptionOverride: "外は吹雪。こたつから出られない。", effectModifier: { fatigue: -2, happiness: { social: 1 } } },
    },
    npcVariants: {
      tanuki: { dialogueOverride: "タヌキチ「こたつから出られない...」", effectModifier: { affinity: [{ npcId: "tanuki", change: 1 }] } },
    },
    choices: [
      { id: "wi-kot-c1", text: "みんなでゲーム", effects: { happiness: { social: 2 } } },
      { id: "wi-kot-c2", text: "一人でのんびり", effects: { happiness: { culture: 1 }, fatigue: -1 } },
    ],
  },
  {
    id: "wi-winter-market",
    season: "winter",
    baseTitle: "冬の市場",
    baseDescription: "冬の特産品が並ぶ市場に出かけよう。",
    tileTypes: ["happening", "festival"],
    weatherVariants: {
      sunny: { titleSuffix: "（冬晴れ）", effectModifier: { happiness: { money: 1 } } },
      rainy: { titleSuffix: "（寒い雨）", descriptionOverride: "寒い雨の中でも活気ある市場。", effectModifier: { happiness: { money: 1 } } },
      snowy: { titleSuffix: "（雪の市場）", descriptionOverride: "雪の中の幻想的な市場。", effectModifier: { happiness: { money: 1, culture: 1 } } },
    },
    npcVariants: {
      kuma: { dialogueOverride: "クマ太郎「干し柿うまいぞ！」", effectModifier: { affinity: [{ npcId: "kuma", change: 1 }] } },
    },
    choices: [
      { id: "wi-mkt-c1", text: "冬の食材を買い込む", effects: { happiness: { money: -1, creation: 1 } } },
      { id: "wi-mkt-c2", text: "手作り品を売る", effects: { happiness: { money: 2 } } },
    ],
  },
  {
    id: "wi-starry-night",
    season: "winter",
    baseTitle: "冬の星空",
    baseDescription: "冬の澄んだ空に輝く星を見よう。",
    tileTypes: ["life", "romance"],
    weatherVariants: {
      sunny: { titleSuffix: "（満天の星）", effectModifier: { happiness: { culture: 2 } } },
      rainy: { titleSuffix: "（雲間の星）", descriptionOverride: "雲の切れ間から一等星が見える。", effectModifier: { happiness: { culture: 1 } } },
      snowy: { titleSuffix: "（雪と星）", descriptionOverride: "雪の合間に見える冬の星座。", effectModifier: { happiness: { culture: 1, nature: 1 } } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「冬の星座には秘密がある。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
      usagi: { dialogueOverride: "ウサミ「寒いけど...隣にいると温かい。」", effectModifier: { affinity: [{ npcId: "usagi", change: 2 }], romance: { npcId: "usagi", change: 1 } } },
    },
    choices: [
      { id: "wi-star-c1", text: "星座の物語を語る", effects: { happiness: { culture: 2 } } },
      { id: "wi-star-c2", text: "温かい飲み物を持って眺める", effects: { happiness: { nature: 1, social: 1 } } },
    ],
  },
  {
    id: "wi-reflection",
    season: "winter",
    baseTitle: "一年の振り返り",
    baseDescription: "今年一年を振り返ろう。",
    tileTypes: ["life", "rest"],
    weatherVariants: {
      sunny: { titleSuffix: "（穏やかな日）", effectModifier: { happiness: { culture: 1 } } },
      rainy: { titleSuffix: "（しんみり）", descriptionOverride: "雨音と共に思い出を辿る。", effectModifier: { happiness: { culture: 1 }, insight: 1 } },
      snowy: { titleSuffix: "（雪の日記）", descriptionOverride: "雪を見ながら日記を書く。", effectModifier: { happiness: { culture: 2 }, insight: 1 } },
    },
    npcVariants: {
      kitsune: { dialogueOverride: "キツネ丸「一年の終わりに...大切なことを伝えたい。」", effectModifier: { affinity: [{ npcId: "kitsune", change: 2 }] } },
    },
    choices: [
      { id: "wi-ref-c1", text: "来年の目標を立てる", effects: { happiness: { creation: 1, culture: 1 }, insight: 2 } },
      { id: "wi-ref-c2", text: "感謝の手紙を書く", effects: { happiness: { social: 2 } } },
      {
        id: "wi-ref-c3",
        text: "特別な人への想いを綴る",
        requiredTitle: "friendship_master",
        effects: { happiness: { social: 2, culture: 1 } },
      },
    ],
  },
];

export const EVENT_TEMPLATES: EventTemplate[] = [
  ...springTemplates,
  ...summerTemplates,
  ...autumnTemplates,
  ...winterTemplates,
];
