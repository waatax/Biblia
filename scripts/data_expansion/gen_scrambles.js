// gen_scrambles.js - Generates 30 Verse Scramble levels
const fs = require('fs');
const path = require('path');

const scrambles = [
  {
    id: "scramble_01",
    level: 1,
    difficulty: 1,
    ref: "詩篇 23:1",
    theme: "信心與牧養",
    tokens: ["耶和華", "是我的牧者，", "我必不致", "缺乏。"],
    fullText: "耶和華是我的牧者，我必不致缺乏。"
  },
  {
    id: "scramble_02",
    level: 2,
    difficulty: 1,
    ref: "創世記 1:1",
    theme: "創造與起源",
    tokens: ["起初，", "神", "創造", "天地。"],
    fullText: "起初，神創造天地。"
  },
  {
    id: "scramble_03",
    level: 3,
    difficulty: 1,
    ref: "腓立比書 4:13",
    theme: "力量與得勝",
    tokens: ["我靠著那", "加給我力量的，", "凡事", "都能做。"],
    fullText: "我靠著那加給我力量的，凡事都能做。"
  },
  {
    id: "scramble_04",
    level: 4,
    difficulty: 1,
    ref: "傳道書 3:1",
    theme: "神聖定時",
    tokens: ["凡事", "都有定期，", "天下萬務", "都有定時。"],
    fullText: "凡事都有定期，天下萬務都有定時。"
  },
  {
    id: "scramble_05",
    level: 5,
    difficulty: 1,
    ref: "詩篇 119:105",
    theme: "神的話語",
    tokens: ["你的話", "是我腳前的燈，", "是我", "路上的光。"],
    fullText: "你的話是我腳前的燈，是我路上的光。"
  },
  {
    id: "scramble_06",
    level: 6,
    difficulty: 1,
    ref: "約翰福音 3:16",
    theme: "救贖福音",
    tokens: ["神愛世人，", "甚至將他的獨生子", "賜給他們，", "叫一切信他的，", "不致滅亡，", "反得永生。"],
    fullText: "神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不致滅亡，反得永生。"
  },
  {
    id: "scramble_07",
    level: 7,
    difficulty: 1,
    ref: "馬太福音 11:28",
    theme: "安息與安慰",
    tokens: ["凡勞苦擔重擔的人", "可以到我這裡來，", "我就使你們", "得安息。"],
    fullText: "凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。"
  },
  {
    id: "scramble_08",
    level: 8,
    difficulty: 1,
    ref: "希伯來書 11:1",
    theme: "信心實底",
    tokens: ["信就是", "所望之事的實底，", "是未見之事的", "確據。"],
    fullText: "信就是所望之事的實底，是未見之事的確據。"
  },
  {
    id: "scramble_09",
    level: 9,
    difficulty: 2,
    ref: "馬太福音 6:33",
    theme: "天國次序",
    tokens: ["你們要先求", "他的國", "和他的義，", "這些東西", "都要加給你們了。"],
    fullText: "你們要先求他的國和他的義，這些東西都要加給你們了。"
  },
  {
    id: "scramble_10",
    level: 10,
    difficulty: 2,
    ref: "約翰福音 14:6",
    theme: "獨一道路",
    tokens: ["耶穌說：", "我就是道路、", "真理、生命；", "若不藉著我，", "沒有人能到", "父那裡去。"],
    fullText: "耶穌說：我就是道路、真理、生命；若不藉著我，沒有人能到父那裡去。"
  },
  {
    id: "scramble_11",
    level: 11,
    difficulty: 2,
    ref: "詩篇 46:1",
    theme: "避難所與力量",
    tokens: ["神是我們的避難所，", "是我們的力量，", "是我們在患難中", "隨時的幫助。"],
    fullText: "神是我們的避難所，是我們的力量，是我們在患難中隨時的幫助。"
  },
  {
    id: "scramble_12",
    level: 12,
    difficulty: 2,
    ref: "約翰一書 4:18",
    theme: "完全的愛",
    tokens: ["愛裡沒有懼怕；", "愛既完全，", "就把懼怕除去，", "因為懼怕裡含著刑罰。"],
    fullText: "愛裡沒有懼怕；愛既完全，就把懼怕除去，因為懼怕裡含著刑罰。"
  },
  {
    id: "scramble_13",
    level: 13,
    difficulty: 2,
    ref: "哥林多前書 13:13",
    theme: "信望愛",
    tokens: ["如今常存的", "有信，", "有望，", "有愛這三樣，", "其中最大的", "是愛。"],
    fullText: "如今常存的有信，有望，有愛這三樣，其中最大的是愛。"
  },
  {
    id: "scramble_14",
    level: 14,
    difficulty: 2,
    ref: "雅各書 1:22",
    theme: "行道與聽道",
    tokens: ["只是你們要行道，", "不要單單聽道，", "自己", "欺哄自己。"],
    fullText: "只是你們要行道，不要單單聽道，自己欺哄自己。"
  },
  {
    id: "scramble_15",
    level: 15,
    difficulty: 2,
    ref: "箴言 3:5-6",
    theme: "專心仰賴",
    tokens: ["你要專心仰賴耶和華，", "不可倚靠自己的聰明，", "在你一切所行的事上", "都要認定他，", "他必指引你的路。"],
    fullText: "你要專心仰賴耶和華，不可倚靠自己的聰明，在你一切所行的事上都要認定他，他必指引你的路。"
  },
  {
    id: "scramble_16",
    level: 16,
    difficulty: 2,
    ref: "約書亞記 1:9",
    theme: "剛強壯膽",
    tokens: ["你當剛強壯膽！", "不要懼怕，", "也不要驚惶；", "因為你無論往哪裡去，", "耶和華你的神", "必與你同在。"],
    fullText: "你當剛強壯膽！不要懼怕，也不要驚惶；因為你無論往哪裡去，耶和華你的神必與你同在。"
  },
  {
    id: "scramble_17",
    level: 17,
    difficulty: 2,
    ref: "加拉太書 2:20",
    theme: "同釘十架",
    tokens: ["我已經與基督同釘十字架，", "現在活著的不再是我，", "乃是基督在我裡面活著；", "並且我如今在肉身活著，", "是因信神的兒子而活。"],
    fullText: "我已經與基督同釘十字架，現在活著的不再是我，乃是基督在我裡面活著；並且我如今在肉身活著，是因信神的兒子而活。"
  },
  {
    id: "scramble_18",
    level: 18,
    difficulty: 2,
    ref: "彌迦書 6:8",
    theme: "行公義好憐憫",
    tokens: ["他向你所要的是什麼呢？", "只要你行公義，", "好憐憫，", "存謙卑的心，", "與你的神同行。"],
    fullText: "他向你所要的是什麼呢？只要你行公義，好憐憫，存謙卑的心，與你的神同行。"
  },
  {
    id: "scramble_19",
    level: 19,
    difficulty: 2,
    ref: "詩篇 121:1-2",
    theme: "向山舉目",
    tokens: ["我要向山舉目；", "我的幫助從何而來？", "我的幫助", "從造天地的", "耶和華而來。"],
    fullText: "我要向山舉目；我的幫助從何而來？我的幫助從造天地的耶和華而來。"
  },
  {
    id: "scramble_20",
    level: 20,
    difficulty: 2,
    ref: "帖撒羅尼迦前書 5:16-18",
    theme: "常常喜樂",
    tokens: ["要常常喜樂，", "不住地禱告，", "凡事謝恩；", "因為這是神在基督耶穌裡", "向你們所定的旨意。"],
    fullText: "要常常喜樂，不住地禱告，凡事謝恩；因為這是神在基督耶穌裡向你們所定的旨意。"
  },
  {
    id: "scramble_21",
    level: 21,
    difficulty: 3,
    ref: "羅馬書 8:28",
    theme: "互相效力",
    tokens: ["我們曉得", "萬事都互相效力，", "叫愛神的人得益處，", "就是按他旨意", "被召的人。"],
    fullText: "我們曉得萬事都互相效力，叫愛神的人得益處，就是按他旨意被召的人。"
  },
  {
    id: "scramble_22",
    level: 22,
    difficulty: 3,
    ref: "以弗所書 2:8-9",
    theme: "本乎恩因著信",
    tokens: ["你們得救是本乎恩，", "也因著信；", "這並不是出於自己，", "乃是神所賜的；", "也不是出於行為，", "免得有人自誇。"],
    fullText: "你們得救是本乎恩，也因著信；這並不是出於自己，乃是神所賜的；也不是出於行為，免得有人自誇。"
  },
  {
    id: "scramble_23",
    level: 23,
    difficulty: 3,
    ref: "申命記 6:4-5",
    theme: "獨一真神",
    tokens: ["以色列啊，你要聽！", "耶和華我們神是獨一的主。", "你要盡心、", "盡性、", "盡力愛耶和華", "你的神。"],
    fullText: "以色列啊，你要聽！耶和華我們神是獨一的主。你要盡心、盡性、盡力愛耶和華你的神。"
  },
  {
    id: "scramble_24",
    level: 24,
    difficulty: 3,
    ref: "提摩太後書 3:16",
    theme: "聖經默示",
    tokens: ["聖經都是神所默示的，", "於教訓、", "督責、", "使人歸正、", "教導人學義", "都是有益的。"],
    fullText: "聖經都是神所默示的，於教訓、督責、使人歸正、教導人學義都是有益的。"
  },
  {
    id: "scramble_25",
    level: 25,
    difficulty: 3,
    ref: "以賽亞書 40:31",
    theme: "如鷹展翅",
    tokens: ["但那等候耶和華的", "必從新得力。", "他們必如鷹展翅上騰；", "他們奔跑卻不困倦，", "行走卻不疲乏。"],
    fullText: "但那等候耶和華的必從新得力。他們必如鷹展翅上騰；他們奔跑卻不困倦，行走卻不疲乏。"
  },
  {
    id: "scramble_26",
    level: 26,
    difficulty: 3,
    ref: "羅馬書 12:2",
    theme: "心意更新",
    tokens: ["不要效法這個世界，", "只要心意更新而變化，", "叫你們察驗", "何為神的善良、", "純全、", "可喜悅的旨意。"],
    fullText: "不要效法這個世界，只要心意更新而變化，叫你們察驗何為神的善良、純全、可喜悅的旨意。"
  },
  {
    id: "scramble_27",
    level: 27,
    difficulty: 3,
    ref: "腓立比書 4:6-7",
    theme: "一無掛慮",
    tokens: ["應當一無掛慮，", "只要凡事藉著禱告、祈求，", "和感謝，", "將你們所要的告訴神。", "神所賜、出人意外的平安", "必在基督耶穌裡", "保守你們的心懷意念。"],
    fullText: "應當一無掛慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。神所賜、出人意外的平安必在基督耶穌裡保守你們的心懷意念。"
  },
  {
    id: "scramble_28",
    level: 28,
    difficulty: 3,
    ref: "詩篇 1:1-2",
    theme: "有福之人",
    tokens: ["不從惡人的計謀，", "不站罪人的道路，", "不坐褻慢人的座位，", "惟喜愛耶和華的律法，", "晝夜思想，", "這人便為有福！"],
    fullText: "不從惡人的計謀，不站罪人的道路，不坐褻慢人的座位，惟喜愛耶和華的律法，晝夜思想，這人便為有福！"
  },
  {
    id: "scramble_29",
    level: 29,
    difficulty: 3,
    ref: "羅馬書 8:38-39",
    theme: "永不隔絕的愛",
    tokens: ["因為我深信", "無論是死，是生，", "是天使，是掌權的，", "是現在的事，是將來的事，", "都不能叫我們", "與神的愛隔絕；", "這愛是在我們的主基督耶穌裡的。"],
    fullText: "因為我深信無論是死，是生，是天使，是掌權的，是現在的事，是將來的事，都不能叫我們與神的愛隔絕；這愛是在我們的主基督耶穌裡的。"
  },
  {
    id: "scramble_30",
    level: 30,
    difficulty: 3,
    ref: "啟示錄 21:4",
    theme: "新天新地擦去眼淚",
    tokens: ["神要擦去他們", "一切的眼淚；", "不再有死亡，", "也不再有悲哀、", "哭號、疼痛，", "因為以前的事", "都過去了。"],
    fullText: "神要擦去他們一切的眼淚；不再有死亡，也不再有悲哀、哭號、疼痛，因為以前的事都過去了。"
  }
];

// Validate that joining tokens equals fullText for each item
scrambles.forEach(s => {
  const joined = s.tokens.join('');
  if (joined !== s.fullText) {
    console.error(`Mismatch in ${s.id}:`);
    console.error(`joined:   ${joined}`);
    console.error(`fullText: ${s.fullText}`);
    process.exit(1);
  }
});

fs.writeFileSync(path.join(__dirname, 'new_scrambles.json'), JSON.stringify(scrambles, null, 2), 'utf8');
console.log(`Successfully wrote new_scrambles.json, count: ${scrambles.length}, all tokens match fullText!`);
