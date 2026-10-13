/* TIU Figural: serial gambar (SVG dibangkitkan). */
(function (root) {
  'use strict';
  const { util, bank } = root.CPNS;
  const { ri, pick, shuffle } = util;
  const S = 64;
  const svg = inner => `<svg class="fig" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img"><rect x="1" y="1" width="${S - 2}" height="${S - 2}" fill="none" stroke="currentColor" stroke-width="1.5"/>${inner}</svg>`;
  const mod = (a, n) => ((a % n) + n) % n;

  /* --- Tipe A: panah berputar + titik sudut + lingkaran tengah --- */
  const CORNERS = [[12, 12], [52, 12], [52, 52], [12, 52]];
  function drawA(st) {
    const ang = st.a * 45 * Math.PI / 180;
    const x2 = 32 + 21 * Math.sin(ang), y2 = 32 - 21 * Math.cos(ang);
    const hx = 32 + 14 * Math.sin(ang), hy = 32 - 14 * Math.cos(ang);
    const px = Math.cos(ang) * 5, py = Math.sin(ang) * 5;
    const [cx, cy] = CORNERS[st.c];
    return svg(
      `<line x1="32" y1="32" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="currentColor" stroke-width="2.5"/>` +
      `<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${(hx + px).toFixed(1)},${(hy + py).toFixed(1)} ${(hx - px).toFixed(1)},${(hy - py).toFixed(1)}" fill="currentColor"/>` +
      `<circle cx="${cx}" cy="${cy}" r="4.5" fill="currentColor"/>` +
      `<circle cx="32" cy="32" r="6" fill="${st.f ? 'currentColor' : 'var(--bg-card, #fff)'}" stroke="currentColor" stroke-width="2"/>`
    );
  }
  function figA(r) {
    const rs = pick(r, [1, 2, 3]) * pick(r, [1, -1]);
    const cs = pick(r, [1, -1, 2]);
    const alt = r() < 0.6;
    const a0 = ri(r, 0, 7), c0 = ri(r, 0, 3), f0 = ri(r, 0, 1);
    const st = t => ({ a: mod(a0 + t * rs, 8), c: mod(c0 + t * cs, 4), f: alt ? (f0 + t) % 2 : f0 });
    const ans = st(4);
    const key = s => s.a + '-' + s.c + '-' + s.f;
    const pool = shuffle(r, [
      { a: mod(ans.a + 1, 8), c: ans.c, f: ans.f }, { a: mod(ans.a - 1, 8), c: ans.c, f: ans.f }, { a: mod(ans.a + 4, 8), c: ans.c, f: ans.f },
      { a: ans.a, c: mod(ans.c + 1, 4), f: ans.f }, { a: ans.a, c: mod(ans.c + 2, 4), f: ans.f }, { a: ans.a, c: ans.c, f: 1 - ans.f },
      { a: mod(ans.a + 2, 8), c: mod(ans.c - 1, 4), f: ans.f }, { a: mod(ans.a - 2, 8), c: ans.c, f: 1 - ans.f }, st(3)
    ]);
    const opts = [ans]; const seen = new Set([key(ans)]);
    for (const p of pool) { if (opts.length < 5 && !seen.has(key(p))) { seen.add(key(p)); opts.push(p); } }
    const deg = Math.abs(rs) * 45, dirTxt = rs > 0 ? 'searah' : 'berlawanan arah';
    const cTxt = cs === 2 ? 'melompat ke sudut seberangnya (2 langkah)' : `berpindah 1 sudut ${cs > 0 ? 'searah' : 'berlawanan arah'} jarum jam`;
    return {
      q: `Gambar yang tepat untuk melanjutkan pola berikut adalah ….<div class="figrow">${[0, 1, 2, 3].map(t => drawA(st(t))).join('')}<div class="figq">?</div></div>`,
      o: opts.map(drawA),
      e: `Tiga aturan berjalan bersamaan: (1) panah berputar ${deg}° ${dirTxt} jarum jam; (2) titik hitam ${cTxt}; (3) lingkaran tengah ${alt ? 'berganti hitam ↔ putih' : 'tetap ' + (f0 ? 'hitam' : 'putih')}. Periksa ketiga aturan pada gambar ke-5.`,
      figural: true
    };
  }

  /* --- Tipe B: grid 3×3, kotak hitam & lingkaran bergerak di tepi --- */
  const PERIM = [0, 1, 2, 5, 8, 7, 6, 3];
  function drawB(st) {
    let inner = '';
    for (let k = 1; k < 3; k++) {
      inner += `<line x1="${1 + k * 62 / 3}" y1="1" x2="${1 + k * 62 / 3}" y2="63" stroke="currentColor" stroke-width="0.8"/>`;
      inner += `<line x1="1" y1="${1 + k * 62 / 3}" x2="63" y2="${1 + k * 62 / 3}" stroke="currentColor" stroke-width="0.8"/>`;
    }
    const cell = i => [1 + (i % 3) * 62 / 3, 1 + Math.floor(i / 3) * 62 / 3];
    const [sx, sy] = cell(PERIM[st.s]);
    inner += `<rect x="${(sx + 3).toFixed(1)}" y="${(sy + 3).toFixed(1)}" width="${(62 / 3 - 6).toFixed(1)}" height="${(62 / 3 - 6).toFixed(1)}" fill="currentColor"/>`;
    const [dx, dy] = cell(PERIM[st.d]);
    const same = st.s === st.d;
    inner += `<circle cx="${(dx + 31 / 3).toFixed(1)}" cy="${(dy + 31 / 3).toFixed(1)}" r="4" fill="${same ? 'var(--bg-card, #fff)' : 'none'}" stroke="${same ? 'var(--bg-card, #fff)' : 'currentColor'}" stroke-width="2"/>`;
    return svg(inner);
  }
  function figB(r) {
    const ss = pick(r, [1, 2, 3]), ds = -pick(r, [1, 2]);
    const s0 = ri(r, 0, 7), d0 = ri(r, 0, 7);
    const st = t => ({ s: mod(s0 + t * ss, 8), d: mod(d0 + t * ds, 8) });
    const ans = st(4);
    const key = s => s.s + '-' + s.d;
    const pool = shuffle(r, [
      { s: mod(ans.s + 1, 8), d: ans.d }, { s: mod(ans.s - 1, 8), d: ans.d }, { s: ans.s, d: mod(ans.d + 1, 8) }, { s: ans.s, d: mod(ans.d - 1, 8) },
      { s: mod(ans.s + 2, 8), d: mod(ans.d + 2, 8) }, { s: ans.d, d: ans.s }, st(3), st(5)
    ]);
    const opts = [ans]; const seen = new Set([key(ans)]);
    for (const p of pool) { if (opts.length < 5 && !seen.has(key(p))) { seen.add(key(p)); opts.push(p); } }
    return {
      q: `Gambar yang tepat untuk melanjutkan pola berikut adalah ….<div class="figrow">${[0, 1, 2, 3].map(t => drawB(st(t))).join('')}<div class="figq">?</div></div>`,
      o: opts.map(drawB),
      e: `Kotak hitam bergerak ${ss} petak searah jarum jam mengelilingi tepi grid, sedangkan lingkaran bergerak ${-ds} petak berlawanan arah jarum jam. Terapkan kedua langkah pada gambar ke-4.`,
      figural: true
    };
  }

  /* --- Tipe C: segi-n bertambah sisi & jumlah titik --- */
  function drawC(st) {
    const n = st.n, pts = [];
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + k * 2 * Math.PI / n;
      pts.push((32 + 24 * Math.cos(a)).toFixed(1) + ',' + (32 + 24 * Math.sin(a)).toFixed(1));
    }
    let inner = `<polygon points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="2"/>`;
    const dots = st.d;
    for (let k = 0; k < dots; k++) {
      const row = Math.floor(k / 3), col = k % 3;
      const rowCount = Math.min(3, dots - row * 3);
      const x = 32 + (col - (rowCount - 1) / 2) * 8, y = 32 + (row - (Math.ceil(dots / 3) - 1) / 2) * 8;
      inner += `<circle cx="${x}" cy="${y}" r="2.6" fill="currentColor"/>`;
    }
    return svg(inner);
  }
  function figC(r) {
    const n0 = pick(r, [3, 4]), inc = 1;
    const dmode = ri(r, 0, 2);
    const d0 = dmode === 0 ? ri(r, 0, 3) : dmode === 1 ? ri(r, 5, 7) : ri(r, 1, 4);
    const dd = dmode === 0 ? 1 : dmode === 1 ? -1 : 0;
    const st = t => ({ n: n0 + t * inc, d: dmode === 2 ? (t % 2 ? d0 + 2 : d0) : d0 + t * dd });
    const ans = st(4);
    const key = s => s.n + '-' + s.d;
    const pool = shuffle(r, [
      { n: ans.n + 1, d: ans.d }, { n: ans.n - 1, d: ans.d }, { n: ans.n, d: ans.d + 1 }, { n: ans.n, d: Math.max(0, ans.d - 1) }, { n: ans.n + 1, d: ans.d + 1 }, { n: ans.n - 2, d: ans.d }
    ]);
    const opts = [ans]; const seen = new Set([key(ans)]);
    for (const p of pool) { if (opts.length < 5 && !seen.has(key(p)) && p.d >= 0) { seen.add(key(p)); opts.push(p); } }
    const dTxt = dmode === 0 ? 'bertambah 1' : dmode === 1 ? 'berkurang 1' : `bergantian ${d0} dan ${d0 + 2}`;
    return {
      q: `Gambar yang tepat untuk melanjutkan pola berikut adalah ….<div class="figrow">${[0, 1, 2, 3].map(t => drawC(st(t))).join('')}<div class="figq">?</div></div>`,
      o: opts.map(drawC),
      e: `Jumlah sisi bangun bertambah 1 setiap langkah (${n0} → ${n0 + 1} → ${n0 + 2} → ${n0 + 3}), sedangkan jumlah titik ${dTxt}. Gambar ke-5: segi-${ans.n} dengan ${ans.d} titik.`,
      figural: true
    };
  }

  function figural(r, i) {
    const k = i % 10;
    if (k <= 4) return figA(r);
    if (k <= 8) return figB(r);
    return figC(r);
  }

  bank.register({ key: 'tiu-figural', cat: 'TIU', group: 'fig-serial', label: 'Figural (Serial Gambar)', count: 400, make: figural });
})(typeof window !== 'undefined' ? window : globalThis);
