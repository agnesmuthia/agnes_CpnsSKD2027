/* Sesi ujian: komposisi soal, pengacakan, penyimpanan, dan penilaian ala SKD BKN. */
(function (root) {
  'use strict';
  const CPNS = root.CPNS;
  const { util, bank } = CPNS;

  // Komposisi SKD: 30 TWK + 35 TIU + 45 TKP = 110 soal, 100 menit.
  const BLUEPRINT = {
    TWK: { 'twk-nasionalisme': 6, 'twk-integritas': 6, 'twk-belanegara': 6, 'twk-pilar': 7, 'twk-bahasa': 5 },
    TIU: {
      'ver-analogi': 2, 'ver-logika': 3, 'ver-analitis': 2, 'ver-argumen': 6,
      'num-deret': 2, 'num-tabel': 5, 'num-cerita': 5, 'num-kecukupan': 5,
      'fig-serial': 5
    },
    TKP: { 'tkp-pelayanan': 8, 'tkp-jejaring': 7, 'tkp-sosbud': 8, 'tkp-tik': 7, 'tkp-profesional': 8, 'tkp-radikal': 7 }
  };
  const GROUP_LABEL = {
    'twk-nasionalisme': 'Nasionalisme', 'twk-integritas': 'Integritas', 'twk-belanegara': 'Bela Negara', 'twk-pilar': 'Pilar Negara', 'twk-bahasa': 'Bahasa Negara',
    'ver-analogi': 'Verbal – Analogi', 'ver-logika': 'Verbal – Silogisme & Logika', 'ver-analitis': 'Verbal – Analitis', 'ver-argumen': 'Verbal – Logika Argumen',
    'num-deret': 'Numerik – Deret Angka', 'num-tabel': 'Numerik – Pola Bilangan Tabel', 'num-cerita': 'Numerik – Soal Cerita', 'num-kecukupan': 'Numerik – Kecukupan Pernyataan',
    'fig-serial': 'Figural – Serial Gambar',
    'tkp-pelayanan': 'Pelayanan Publik', 'tkp-jejaring': 'Jejaring Kerja', 'tkp-sosbud': 'Sosial Budaya', 'tkp-tik': 'Teknologi Informasi & Komunikasi', 'tkp-profesional': 'Profesionalisme', 'tkp-radikal': 'Anti Radikalisme'
  };
  // Nilai ambang batas (passing grade) SKD — KepmenPANRB No. 321 Tahun 2024
  const RULES = {
    TWK: { n: 30, max: 150, pg: 65, name: 'Tes Wawasan Kebangsaan' },
    TIU: { n: 35, max: 175, pg: 80, name: 'Tes Intelegensia Umum' },
    TKP: { n: 45, max: 225, pg: 166, name: 'Tes Karakteristik Pribadi' }
  };
  const DURATION = 100 * 60;

  /* ---------- penyimpanan lokal ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cpns27.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('cpns27.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem('cpns27.' + k); } catch (e) { /* abaikan */ } }
  };

  const today = (d) => {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  function groupPool(group) {
    const out = [];
    for (const k of bank.order) if (bank.gens[k].group === group) out.push(...bank.ids(k));
    return out;
  }

  // Ambil n soal dari pool: utamakan yang belum pernah muncul; jika habis, putaran baru dimulai.
  function draw(r, pool, n, seen, exclude) {
    const fresh = pool.filter(id => !seen[id] && !exclude.has(id));
    let chosen = util.sample(r, fresh, n);
    if (chosen.length < n) {
      for (const id of pool) delete seen[id]; // reset rotasi untuk pool ini
      const rest = pool.filter(id => !exclude.has(id) && chosen.indexOf(id) < 0);
      chosen = chosen.concat(util.sample(r, rest, n - chosen.length));
    }
    chosen.forEach(id => exclude.add(id));
    return chosen;
  }

  function numericKey(html) {
    const t = String(html).replace(/<[^>]+>/g, '').replace(/−/g, '-');
    const m = t.match(/-?[\d.]+(,\d+)?/);
    if (!m) return NaN;
    return parseFloat(m[0].replace(/\./g, '').replace(',', '.'));
  }

  function makeOrder(r, q) {
    const idx = [0, 1, 2, 3, 4];
    if (q.fixed) return idx;
    if (q.numeric) {
      const keys = q.o.map(numericKey);
      if (keys.every(k => !isNaN(k)) && new Set(keys).size === 5) return idx.sort((a, b) => keys[a] - keys[b]);
    }
    return util.shuffle(r, idx);
  }

  function build(opts) {
    const seed = util.hash(opts.seed);
    const r = util.rng(seed);
    const seen = store.get('seen', {});
    const exclude = new Set();
    let ids = [];
    if (opts.groups) {
      for (const cat of ['TWK', 'TIU', 'TKP']) {
        const part = [];
        for (const g in BLUEPRINT[cat]) {
          if (opts.groups[g] == null) continue;
          part.push(...draw(r, groupPool(g), opts.groups[g], seen, exclude));
        }
        ids.push(...(opts.keepOrder ? part : util.shuffle(r, part)));
      }
    } else if (opts.keys) {
      let pool = [];
      opts.keys.forEach(k => { pool = pool.concat(bank.ids(k)); });
      ids = draw(r, pool, Math.min(opts.n, pool.length), seen, exclude);
    }
    store.set('seen', seen); // simpan reset rotasi bila ada
    const orders = ids.map(id => makeOrder(r, bank.get(id)));
    return {
      id: 's' + Date.now().toString(36) + (seed % 1000).toString(36),
      mode: opts.mode, title: opts.title, date: today(), seed: opts.seed,
      ids, orders, answers: {}, flags: {}, cur: 0,
      start: Date.now(), duration: opts.duration || 0, learn: !!opts.learn
    };
  }

  function fullBlueprint() {
    const g = {};
    for (const cat in BLUEPRINT) Object.assign(g, BLUEPRINT[cat]);
    return g;
  }

  /* ---------- penilaian ---------- */
  function scoreOf(q, displayIdx, order) {
    if (displayIdx == null) return 0;
    const orig = order[displayIdx];
    if (q.cat === 'TKP') return q.scores[orig];
    return orig === q.ans ? 5 : 0;
  }

  function grade(s) {
    const res = { TWK: { score: 0, correct: 0, n: 0, blank: 0 }, TIU: { score: 0, correct: 0, n: 0, blank: 0 }, TKP: { score: 0, correct: 0, n: 0, blank: 0 } };
    const byGroup = {};
    s.ids.forEach((id, i) => {
      const q = bank.get(id);
      const a = s.answers[i];
      const sc = scoreOf(q, a, s.orders[i]);
      const c = res[q.cat];
      c.n++; c.score += sc;
      if (a == null) c.blank++;
      else if (q.cat !== 'TKP' && sc === 5) c.correct++;
      else if (q.cat === 'TKP' && sc === 5) c.correct++;
      const g = byGroup[q.group] = byGroup[q.group] || { cat: q.cat, label: GROUP_LABEL[q.group] || q.group, n: 0, score: 0, max: 0 };
      g.n++; g.score += sc; g.max += 5;
    });
    let total = 0;
    let allPass = true;
    const full = s.mode !== 'topik';
    for (const cat in res) {
      const c = res[cat];
      c.max = c.n * 5;
      total += c.score;
      c.pg = full ? RULES[cat].pg : Math.round(RULES[cat].pg / RULES[cat].max * c.max);
      c.pass = c.n === 0 ? null : c.score >= c.pg;
      if (c.n && !c.pass) allPass = false;
    }
    return { cats: res, total, max: s.ids.length * 5, pass: allPass, byGroup };
  }

  /* ---------- riwayat & statistik ---------- */
  function finish(s) {
    s.end = Date.now();
    const g = grade(s);
    const seen = store.get('seen', {});
    s.ids.forEach(id => { seen[id] = 1; });
    store.set('seen', seen);
    const hist = store.get('history', []);
    hist.unshift({
      id: s.id, mode: s.mode, title: s.title, date: s.date, seed: s.seed, start: s.start, end: s.end, learn: s.learn,
      ids: s.ids, orders: s.orders, answers: s.answers, flags: s.flags,
      sum: { TWK: g.cats.TWK.score, TIU: g.cats.TIU.score, TKP: g.cats.TKP.score, total: g.total, max: g.max, pass: g.pass }
    });
    while (hist.length > 80) hist.pop();
    if (!store.set('history', hist)) { hist.length = 30; store.set('history', hist); }
    store.del('active');
    return g;
  }

  function streak() {
    const days = new Set(store.get('history', []).filter(h => h.mode === 'harian').map(h => h.date));
    let n = 0;
    const d = new Date();
    if (!days.has(today(d))) d.setDate(d.getDate() - 1);
    while (days.has(today(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  CPNS.session = {
    BLUEPRINT, RULES, DURATION, GROUP_LABEL, store, today,
    daily(variant) {
      const date = today();
      return build({ mode: 'harian', title: 'Latihan Harian ' + date, seed: 'harian-' + date + (variant ? '-' + variant : ''), groups: fullBlueprint(), duration: DURATION });
    },
    simulasi() {
      return build({ mode: 'simulasi', title: 'Simulasi CAT SKD', seed: 'sim-' + Date.now(), groups: fullBlueprint(), duration: DURATION });
    },
    topic(keys, n, title, timed) {
      return build({ mode: 'topik', title, seed: 'topik-' + keys.join(',') + Date.now(), keys, n, learn: !timed, duration: timed ? Math.round(n * 100 * 60 / 110) : 0 });
    },
    section(cat) {
      const g = Object.assign({}, BLUEPRINT[cat]);
      return build({ mode: 'topik', title: 'Simulasi ' + cat + ' (' + RULES[cat].n + ' soal)', seed: 'sec-' + cat + Date.now(), groups: g, duration: Math.round(RULES[cat].n * DURATION / 110) });
    },
    groupDrill(group, n) {
      const g = {}; g[group] = n;
      return build({ mode: 'topik', title: 'Latihan ' + (GROUP_LABEL[group] || group), seed: 'grp-' + group + Date.now(), groups: g, learn: true });
    },
    grade, finish, scoreOf, streak, groupPool
  };
})(typeof window !== 'undefined' ? window : globalThis);
