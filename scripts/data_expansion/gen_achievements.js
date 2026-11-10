// scripts/data_expansion/gen_achievements.js
const fs = require('fs');
const path = require('path');

const ACHIEVEMENTS = [
  { id: "ach_streak20", icon: "🔥", title: "勢如破竹", desc: "在挑戰中連續答對 20 題", req: 20 },
  { id: "ach_streak30", icon: "⚡", title: "百戰百勝", desc: "在挑戰中連續答對 30 題", req: 30 },
  { id: "ach_char_75", icon: "👥", title: "雲彩同證", desc: "累計答對 75 位聖經人物題", req: 75 },
  { id: "ach_char_120", icon: "👑", title: "人名博覽宗師", desc: "累計答對 120 位聖經人物題", req: 120 },
  { id: "ach_geo_60", icon: "🗺️", title: "迦南行旅者", desc: "累計答對 60 處聖經地名題", req: 60 },
  { id: "ach_geo_90", icon: "🧭", title: "聖地歷史地理家", desc: "累計答對 90 處聖經地名題", req: 90 },
  { id: "ach_verse_60", icon: "📜", title: "心版銘刻", desc: "累計答對 60 節經典經文填空", req: 60 },
  { id: "ach_verse_100", icon: "💎", title: "精金真道", desc: "累計答對 100 節經典經文填空", req: 100 },
  { id: "ach_quote_20", icon: "💬", title: "名言透徹", desc: "在誰說了這句話中答對 20 題", req: 20 },
  { id: "ach_trivia_20", icon: "🔢", title: "數字密碼通", desc: "在聖經數字與奧祕中答對 20 題", req: 20 },
  { id: "ach_parable_20", icon: "🕊️", title: "神國奧祕明燈", desc: "在比喻與神蹟中答對 20 題", req: 20 },
  { id: "ach_book_20", icon: "📚", title: "六十六卷通達", desc: "在聖經書卷解密中答對 20 題", req: 20 },
  { id: "ach_scramble_10", icon: "🔤", title: "拼圖好手", desc: "經文重組大師通關 10 關", req: 10 },
  { id: "ach_scramble_25", icon: "🧩", title: "字塊拼圖大師", desc: "經文重組大師通關 25 關", req: 25 },
  { id: "ach_match_10", icon: "🔗", title: "聖約連連看達人", desc: "奇妙聖經配對通關 10 關", req: 10 },
  { id: "ach_match_20", icon: "✨", title: "神聖連線宗師", desc: "奇妙聖經配對全通 20 關", req: 20 },
  { id: "ach_cw_20", icon: "🏆", title: "二十關填字全制霸", desc: "完成全部 20 關十字填字字盤", req: 20 },
  { id: "ach_timeline_20", icon: "⏳", title: "救贖歷史泰斗", desc: "完成全部 20 組年代排序挑戰", req: 20 },
  { id: "ach_day_streak14", icon: "🗓️", title: "雙週精進", desc: "連續 14 天完成每日學習目標", req: 14 },
  { id: "ach_day_streak30", icon: "🌙", title: "月光守望者", desc: "連續 30 天完成每日學習目標", req: 30 },
  { id: "ach_total300", icon: "🏛️", title: "真理基石", desc: "全模式累計答對 300 題", req: 300 },
  { id: "ach_total500", icon: "🏰", title: "萬題之殿", desc: "全模式累計答對 500 題", req: 500 },
  { id: "ach_xp10000", icon: "🌟", title: "恩典滿溢", desc: "累計經驗值突破 10,000 XP", req: 10000 },
  { id: "ach_crown", icon: "👑", title: "榮耀冠冕", desc: "累計解鎖 40 款榮譽成就勳章", req: 40 }
];

fs.writeFileSync(path.join(__dirname, 'new_achievements.json'), JSON.stringify(ACHIEVEMENTS, null, 2), 'utf8');
console.log('Successfully wrote new_achievements.json, count:', ACHIEVEMENTS.length);
