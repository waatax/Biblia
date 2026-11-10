// scripts/data_expansion/gen_crosswords.js
const fs = require('fs');
const path = require('path');

function verifyGrid(level) {
  const cells = {};
  for (const w of level.words) {
    for (let k = 0; k < w.answer.length; k++) {
      const r = w.dir === 'down' ? w.r + k : w.r;
      const c = w.dir === 'across' ? w.c + k : w.c;
      const key = `${r}_${c}`;
      const ch = w.answer.charAt(k);
      if (r >= level.rows || c >= level.cols || r < 0 || c < 0) {
        throw new Error(`Out of bounds in ${level.id}: word "${w.answer}" at (${r},${c}) on ${level.rows}x${level.cols}`);
      }
      if (cells[key] && cells[key] !== ch) {
        throw new Error(`Conflict in ${level.id} at (${r},${c}): "${cells[key]}" vs "${ch}" in word "${w.answer}"`);
      }
      cells[key] = ch;
    }
  }
  return true;
}

const CROSSWORDS = [
  {
    id: "cw_11",
    title: "第十一關：士師時代與信心勇士",
    desc: "從俄陀聶、基甸、底波拉到參孫，認識士師黑暗時代神施行的奇妙拯救",
    rows: 7,
    cols: 7,
    words: [
      {
        answer: "底波拉",
        r: 0,
        c: 1,
        dir: "across",
        clue: "在棕樹下判斷以色列事、與巴拉同行的女先知兼士師",
        info: "士師記 4–5 章；作詩歌頌神使大地震動、基順河沖沒敵軍。"
      },
      {
        answer: "波阿斯",
        r: 0,
        c: 2,
        dir: "down",
        clue: "伯利恆的大富戶，恩待摩押女子路得並娶她為妻的至親救贖者",
        info: "路得記 2–4 章；大衛王的曾祖父。"
      },
      {
        answer: "參孫",
        r: 2,
        c: 0,
        dir: "across",
        clue: "力大無窮的拿細耳人士師，曾用驢腮骨擊殺一千非利士人",
        info: "士師記 13–16 章；死時抱倒大袞廟柱子殺敵甚多。"
      },
      {
        answer: "孫",
        r: 2,
        c: 1,
        dir: "down",
        clue: "單字格（參孫次字）",
        info: "士師名"
      },
      {
        answer: "基甸",
        r: 4,
        c: 1,
        dir: "across",
        clue: "率領三百勇士持號角火把擊潰米甸十萬大軍的士師",
        info: "士師記 6–8 章；又名耶路巴力。"
      },
      {
        answer: "拉哈伯",
        r: 0,
        c: 3,
        dir: "down",
        clue: "又名喇合，耶利哥城信靠神接待探子的婦人",
        info: "約書亞記 2 章；列入基督家譜。"
      },
      {
        answer: "哈拿",
        r: 1,
        c: 3,
        dir: "across",
        clue: "撒母耳的母親，痛哭祈禱後蒙神賜子獻給神",
        info: "撒母耳記上 1–2 章；發表哈拿頌讚歌。"
      }
    ]
  }
];

// Let's refine and programmatically verify complete 10 puzzles!
