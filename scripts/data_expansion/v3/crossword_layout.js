/* 中文填字自動排版
 * 先把主題詞交叉排進格子（共用同一個字才能交叉）；接不上的主題詞，從橋接詞庫找一個
 * 「同時和格子、和該主題詞共用字」的詞先放進去當橋樑。多次隨機嘗試，取放進最多主題詞、版面最緊湊的結果。 */
class Grid {
  constructor() { this.cells = new Map(); this.placed = []; }
  key(r, c) { return r + ',' + c; }
  get(r, c) { return this.cells.get(this.key(r, c)); }
  can(w, r, c, dir) {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    let cross = 0;
    if (this.get(r - dr, c - dc) || this.get(r + dr * w.length, c + dc * w.length)) return false;
    for (let i = 0; i < w.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      const cur = this.get(rr, cc);
      if (cur) {
        if (cur.ch !== w[i] || cur.dirs.includes(dir)) return false;
        cross++;
      } else if (this.get(rr + dc, cc + dr) || this.get(rr - dc, cc - dr)) {
        return false;
      }
    }
    return this.placed.length === 0 || cross > 0;
  }
  put(w, r, c, dir, bridge) {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    for (let i = 0; i < w.length; i++) {
      const k = this.key(r + dr * i, c + dc * i);
      const cur = this.cells.get(k);
      if (cur) cur.dirs.push(dir);
      else this.cells.set(k, { ch: w[i], dirs: [dir] });
    }
    this.placed.push({ answer: w, r, c, dir, bridge: !!bridge });
  }
  pop() {
    const p = this.placed.pop();
    const dr = p.dir === 'down' ? 1 : 0;
    const dc = p.dir === 'across' ? 1 : 0;
    for (let i = 0; i < p.answer.length; i++) {
      const k = this.key(p.r + dr * i, p.c + dc * i);
      const cur = this.cells.get(k);
      if (cur.dirs.length > 1) cur.dirs.pop();
      else this.cells.delete(k);
    }
  }
  bounds() {
    let r0 = 1e9, r1 = -1e9, c0 = 1e9, c1 = -1e9;
    this.placed.forEach((p) => {
      const er = p.r + (p.dir === 'down' ? p.answer.length - 1 : 0);
      const ec = p.c + (p.dir === 'across' ? p.answer.length - 1 : 0);
      r0 = Math.min(r0, p.r); r1 = Math.max(r1, er);
      c0 = Math.min(c0, p.c); c1 = Math.max(c1, ec);
    });
    return { r0, r1, c0, c1, rows: r1 - r0 + 1, cols: c1 - c0 + 1 };
  }
  candidates(w) {
    const out = [];
    this.placed.forEach((p) => {
      for (let i = 0; i < p.answer.length; i++) {
        for (let j = 0; j < w.length; j++) {
          if (p.answer[i] !== w[j]) continue;
          const dir = p.dir === 'across' ? 'down' : 'across';
          const r = p.dir === 'across' ? p.r - j : p.r + i;
          const c = p.dir === 'across' ? p.c + i : p.c - j;
          if (this.can(w, r, c, dir)) out.push({ r, c, dir });
        }
      }
    });
    return out;
  }
  // 放到讓版面最緊湊（寬度優先，手機畫面窄）的位置；放不下回傳 false
  placeBest(w, rnd, bridge, maxCols) {
    let best = null;
    let bs = 1e9;
    this.candidates(w).forEach((cd) => {
      this.put(w, cd.r, cd.c, cd.dir, bridge);
      const b = this.bounds();
      this.pop();
      if (b.cols > maxCols) return;
      const sc = b.cols * 1.6 + b.rows + rnd() * 1.5;
      if (sc < bs) { bs = sc; best = cd; }
    });
    if (!best) return false;
    this.put(w, best.r, best.c, best.dir, bridge);
    return true;
  }
}

const shares = (a, b) => [...a].some((ch) => b.includes(ch));

function attempt(words, bridges, rnd, maxCols, maxBridges) {
  const g = new Grid();
  const rest = words.slice();
  const first = rest.shift();
  if (rnd() < 0.5) g.put(first, 0, 0, 'across'); else g.put(first, 0, 0, 'down');
  let used = 0;
  let progress = true;
  while (rest.length && progress) {
    progress = false;
    for (let i = 0; i < rest.length; i++) {
      if (g.placeBest(rest[i], rnd, false, maxCols)) { rest.splice(i, 1); progress = true; break; }
    }
    if (progress || used >= maxBridges) continue;
    // 找橋接詞：同時能接上格子、又與某個未放的主題詞共用字
    const inGrid = new Set(g.placed.map((p) => p.answer));
    const pool = bridges.filter((b) => !inGrid.has(b) && !rest.includes(b)).sort(() => rnd() - 0.5);
    outer:
    for (const w of rest) {
      for (const b of pool) {
        if (!shares(b, w)) continue;
        if (!g.placeBest(b, rnd, true, maxCols)) continue;
        if (g.placeBest(w, rnd, false, maxCols)) { rest.splice(rest.indexOf(w), 1); used++; progress = true; break outer; }
        g.pop();
      }
    }
    if (progress || used + 1 >= maxBridges) continue;
    // 兩步橋接：格子 ─ b1 ─ b2 ─ 主題詞
    outer2:
    for (const w of rest) {
      const near = pool.filter((b) => shares(b, w)).slice(0, 12);
      for (const b1 of pool) {
        const via = near.filter((b2) => b2 !== b1 && shares(b1, b2));
        if (!via.length) continue;
        if (!g.placeBest(b1, rnd, true, maxCols)) continue;
        for (const b2 of via) {
          if (!g.placeBest(b2, rnd, true, maxCols)) continue;
          if (g.placeBest(w, rnd, false, maxCols)) { rest.splice(rest.indexOf(w), 1); used += 2; progress = true; break outer2; }
          g.pop();
        }
        g.pop();
      }
    }
  }
  const b = g.bounds();
  return {
    words: g.placed.map((p) => ({ answer: p.answer, r: p.r - b.r0, c: p.c - b.c0, dir: p.dir, bridge: p.bridge })),
    rows: b.rows,
    cols: b.cols,
    unplaced: rest
  };
}

function layout(words, bridges, opts) {
  const o = Object.assign({ tries: 300, maxCols: 10, maxBridges: 8 }, opts || {});
  let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  let best = null;
  for (let t = 0; t < o.tries; t++) {
    const order = t % 2 ? words.slice().sort(() => rnd() - 0.5) : words.slice().sort((a, b) => b.length - a.length + (rnd() - 0.5) * 4);
    const g = attempt(order, bridges || [], rnd, o.maxCols, o.maxBridges);
    const nb = g.words.filter((w) => w.bridge).length;
    const score = g.unplaced.length * 1000 + nb * 40 + g.cols * 3 + g.rows;
    if (!best || score < best.score) best = Object.assign(g, { score });
  }
  best.words.sort((a, b) => a.r - b.r || a.c - b.c);
  return best;
}

module.exports = { layout };
