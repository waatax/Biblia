/* 中文填字自動排版：把一組詞交叉排進格子（共用同一個字才能交叉），多次隨機嘗試取最緊湊的版面 */
function tryLayout(words, rnd) {
  const grid = new Map();
  const placed = [];
  const key = (r, c) => r + ',' + c;
  const get = (r, c) => grid.get(key(r, c));

  function can(w, r, c, dir) {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    let cross = 0;
    if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return false;
    for (let i = 0; i < w.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      const cur = get(rr, cc);
      if (cur) {
        if (cur.ch !== w[i] || cur.dirs.includes(dir)) return false;
        cross++;
      } else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) {
        return false;
      }
    }
    return placed.length === 0 || cross > 0;
  }

  function put(w, r, c, dir) {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    for (let i = 0; i < w.length; i++) {
      const k = key(r + dr * i, c + dc * i);
      const cur = grid.get(k);
      if (cur) cur.dirs.push(dir);
      else grid.set(k, { ch: w[i], dirs: [dir] });
    }
    placed.push({ answer: w, r, c, dir });
  }

  function unput() {
    const p = placed.pop();
    const dr = p.dir === 'down' ? 1 : 0;
    const dc = p.dir === 'across' ? 1 : 0;
    for (let i = 0; i < p.answer.length; i++) {
      const k = key(p.r + dr * i, p.c + dc * i);
      const cur = grid.get(k);
      if (cur.dirs.length > 1) cur.dirs.pop();
      else grid.delete(k);
    }
  }

  function bounds() {
    let r0 = 1e9, r1 = -1e9, c0 = 1e9, c1 = -1e9;
    placed.forEach((p) => {
      const er = p.r + (p.dir === 'down' ? p.answer.length - 1 : 0);
      const ec = p.c + (p.dir === 'across' ? p.answer.length - 1 : 0);
      r0 = Math.min(r0, p.r); r1 = Math.max(r1, er);
      c0 = Math.min(c0, p.c); c1 = Math.max(c1, ec);
    });
    return { r0, r1, c0, c1 };
  }

  const rest = words.slice();
  put(rest.shift(), 0, 0, rnd() < 0.5 ? 'across' : 'down');
  let progress = true;
  while (rest.length && progress) {
    progress = false;
    for (let wi = 0; wi < rest.length; wi++) {
      const w = rest[wi];
      const cands = [];
      placed.forEach((p) => {
        for (let i = 0; i < p.answer.length; i++) {
          for (let j = 0; j < w.length; j++) {
            if (p.answer[i] !== w[j]) continue;
            const dir = p.dir === 'across' ? 'down' : 'across';
            const r = p.dir === 'across' ? p.r - j : p.r + i;
            const c = p.dir === 'across' ? p.c + i : p.c - j;
            if (can(w, r, c, dir)) cands.push({ r, c, dir });
          }
        }
      });
      if (!cands.length) continue;
      let best = null;
      let bs = 1e9;
      cands.forEach((cd) => {
        put(w, cd.r, cd.c, cd.dir);
        const b = bounds();
        const sc = (b.c1 - b.c0 + 1) * 1.6 + (b.r1 - b.r0 + 1) + rnd() * 1.5;
        unput();
        if (sc < bs) { bs = sc; best = cd; }
      });
      put(w, best.r, best.c, best.dir);
      rest.splice(wi, 1);
      progress = true;
      break;
    }
  }
  const b = bounds();
  return {
    words: placed.map((p) => ({ answer: p.answer, r: p.r - b.r0, c: p.c - b.c0, dir: p.dir })),
    rows: b.r1 - b.r0 + 1,
    cols: b.c1 - b.c0 + 1,
    unplaced: rest
  };
}

function layout(words) {
  let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  let best = null;
  for (let t = 0; t < 600; t++) {
    const order = words.slice().sort((a, b) => b.length - a.length + (rnd() - 0.5) * 3);
    const g = tryLayout(order, rnd);
    const score = g.unplaced.length * 1000 + Math.max(0, g.cols - 9) * 60 + g.cols * 1.5 + g.rows;
    if (!best || score < best.score) best = Object.assign(g, { score });
  }
  best.words.sort((a, b) => a.r - b.r || a.c - b.c);
  return best;
}

module.exports = { layout };
