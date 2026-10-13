/* Inti: RNG deterministik, utilitas, dan registri bank soal. */
(function (root) {
  'use strict';
  const CPNS = root.CPNS = root.CPNS || {};

  const util = {};

  util.hash = function (str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };

  // mulberry32
  util.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  util.ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  util.pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  util.shuffle = (r, arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  util.sample = (r, arr, n) => util.shuffle(r, arr).slice(0, n);
  util.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

  // Format angka gaya Indonesia: 1.900 ; 2,5
  util.fmt = function (n) {
    if (typeof n !== 'number') return String(n);
    const neg = n < 0;
    n = Math.abs(n);
    let s;
    if (Number.isInteger(n)) {
      s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else {
      const fixed = (Math.round(n * 100) / 100).toString();
      const [ip, dp] = fixed.split('.');
      s = ip.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (dp ? ',' + dp : '');
    }
    return (neg ? '−' : '') + s;
  };
  util.rp = n => 'Rp' + util.fmt(n);

  // Pecahan sederhana a/b dalam HTML
  util.frac = function (a, b) {
    const g = util.gcd(a, b) || 1;
    a /= g; b /= g;
    if (b === 1) return String(a);
    return `<span class="frac"><sup>${a}</sup>&frasl;<sub>${b}</sub></span>`;
  };

  // Opsi numerik: [benar, 4 pengecoh] — semua berbeda, masuk akal.
  util.numOpts = function (r, c, opt) {
    opt = opt || {};
    const step = opt.step || Math.max(1, Math.round(Math.abs(c) * 0.08));
    const allowNeg = !!opt.allowNeg;
    const set = [c];
    const base = [c + step, c - step, c + 2 * step, c - 2 * step, c + 3 * step, c - 3 * step];
    if (step < 10) base.push(c + 1, c - 1, c + 2, c - 2);
    const cands = util.shuffle(r, base);
    if (opt.extra) cands.unshift(...util.shuffle(r, opt.extra));
    for (const v of cands) {
      if (set.length >= 5) break;
      if (!allowNeg && v <= 0 && c > 0) continue;
      if (set.indexOf(v) === -1 && Number.isFinite(v)) set.push(v);
    }
    let k = 4;
    while (set.length < 5) { const v = c + k * step; if (set.indexOf(v) === -1) set.push(v); k++; }
    return set;
  };

  util.esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  CPNS.util = util;

  /* ---------------- Registri bank soal ----------------
   * Setiap generator: { key, cat:'TWK'|'TIU'|'TKP', group, label, count, make(r, i) }
   * make() mengembalikan { q, o:[5 opsi], e, fixed?, numeric?, tkp? }
   *  - TWK/TIU : o[0] adalah jawaban benar (urutan diacak saat ditampilkan)
   *  - TKP     : o[0..4] berurutan skor 5,4,3,2,1
   *  - fixed   : opsi tidak diacak (mis. kecukupan data)
   *  - numeric : opsi diurutkan menaik (gaya soal numerik CAT)
   */
  const gens = {};
  const order = [];
  const cache = new Map();

  const bank = {
    gens, order,
    register(def) {
      if (gens[def.key]) throw new Error('Duplikat generator ' + def.key);
      gens[def.key] = def;
      order.push(def.key);
    },
    // Daftar dari array statis
    registerList(base, list) {
      bank.register(Object.assign({}, base, {
        count: list.length,
        make: (r, i) => list[i]
      }));
    },
    ids(key) {
      const g = gens[key];
      const out = new Array(g.count);
      for (let i = 0; i < g.count; i++) out[i] = key + '#' + i;
      return out;
    },
    get(id) {
      if (cache.has(id)) return cache.get(id);
      const hashPos = id.lastIndexOf('#');
      const key = id.slice(0, hashPos);
      const i = parseInt(id.slice(hashPos + 1), 10);
      const g = gens[key];
      if (!g || !(i >= 0 && i < g.count)) return null;
      const raw = g.make(util.rng(util.hash(id)), i);
      const q = {
        id, key, cat: g.cat, group: g.group, label: raw.label || g.label,
        q: raw.q, o: raw.o.slice(), e: raw.e || '',
        fixed: !!(raw.fixed || g.fixed), numeric: !!(raw.numeric || g.numeric),
        scores: g.cat === 'TKP' ? [5, 4, 3, 2, 1] : null,
        ans: g.cat === 'TKP' ? null : (raw.ans != null ? raw.ans : 0)
      };
      if (cache.size > 3000) cache.clear();
      cache.set(id, q);
      return q;
    },
    total() { return order.reduce((s, k) => s + gens[k].count, 0); },
    countBy(cat) { return order.filter(k => gens[k].cat === cat).reduce((s, k) => s + gens[k].count, 0); }
  };

  CPNS.bank = bank;
})(typeof window !== 'undefined' ? window : globalThis);
