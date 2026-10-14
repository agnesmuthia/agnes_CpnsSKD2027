/* Antarmuka aplikasi: beranda, ujian CAT, hasil & pembahasan, latihan topik, riwayat, kisi-kisi. */
(function () {
  'use strict';
  const { bank, session: S, util } = window.CPNS;
  const $ = s => document.querySelector(s);
  const app = $('#app');
  const modal = $('#modal');
  const L = 'ABCDE';
  const CATS = ['TWK', 'TIU', 'TKP'];
  let active = null;
  let timerId = null;
  let showNav = false;

  /* ---------------- tema ---------------- */
  const theme = S.store.get('theme', null);
  if (theme) document.documentElement.dataset.theme = theme;
  $('#themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme ||
      (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    S.store.set('theme', next);
  });

  /* ---------------- util tampilan ---------------- */
  const fmtDate = (d, opt) => new Date(d).toLocaleDateString('id-ID', opt || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtTime = sec => {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  };
  const history = () => S.store.get('history', []);
  const fullSessions = () => history().filter(h => h.mode !== 'topik');

  function openModal(html) {
    modal.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${html}</div>`;
    modal.hidden = false;
    const first = modal.querySelector('button');
    if (first) first.focus();
  }
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; }
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  function meter(score, max, pg) {
    const w = max ? Math.max(0, Math.min(100, score / max * 100)) : 0;
    const p = max && pg != null ? pg / max * 100 : null;
    return `<div class="meter" role="img" aria-label="Skor ${score} dari ${max}${pg != null ? ', ambang ' + pg : ''}">
      <div class="meter-fill ${pg != null && score >= pg ? 'ok' : ''}" style="width:${w}%"></div>
      ${p != null ? `<div class="meter-pg" style="left:${p}%"><span>${pg}</span></div>` : ''}
    </div>`;
  }

  /* ---------------- router ---------------- */
  function route() {
    clearInterval(timerId);
    closeModal();
    const h = location.hash.replace(/^#\/?/, '');
    const [page, arg] = h.split('/');
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + (page || '')));
    document.body.classList.toggle('exam-mode', page === 'ujian');
    window.scrollTo(0, 0);
    if (page === 'ujian') return viewExam();
    if (page === 'hasil') return viewResult(arg);
    if (page === 'topik') return viewTopic();
    if (page === 'riwayat') return viewHistory();
    if (page === 'kisi') return viewKisi();
    return viewHome();
  }
  window.addEventListener('hashchange', route);

  function startSession(s) {
    active = s;
    S.store.set('active', s);
    location.hash = '#/ujian';
    if (location.hash === '#/ujian') route();
  }

  /* ================= BERANDA ================= */
  function viewHome() {
    const hist = history();
    const today = S.today();
    const doneToday = hist.filter(h => h.mode === 'harian' && h.date === today);
    const saved = S.store.get('active', null);
    const full = fullSessions();
    const totals = full.map(h => h.sum.total);
    const best = totals.length ? Math.max(...totals) : null;
    const avg = totals.length ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : null;
    const passCount = full.filter(h => h.sum.pass).length;
    const recent = full.slice(0, 5);
    const catAvg = {};
    CATS.forEach(c => { catAvg[c] = recent.length ? Math.round(recent.reduce((a, h) => a + h.sum[c], 0) / recent.length) : null; });

    app.innerHTML = `
      ${saved ? `<div class="banner">
        <div><b>Sesi belum selesai:</b> ${util.esc(saved.title)} — ${Object.keys(saved.answers).length}/${saved.ids.length} terjawab.</div>
        <div class="row"><button class="btn primary" id="resume">Lanjutkan</button><button class="btn ghost" id="discard">Buang</button></div>
      </div>` : ''}
      <section class="hero">
        <div class="hero-main">
          <p class="eyebrow">${fmtDate(Date.now())}</p>
          <h1>Latihan Harian SKD</h1>
          <p class="lead">110 soal · 100 menit · komposisi CAT BKN: <b>30 TWK</b>, <b>35 TIU</b> (model terbaru 2026), <b>45 TKP</b>. Soal diacak setiap hari dan diprioritaskan yang belum pernah Anda kerjakan.</p>
          ${doneToday.length ? `
            <div class="done-today">
              <span class="chip ${doneToday[0].sum.pass ? 'ok' : 'warn'}">${doneToday[0].sum.pass ? '✓ Memenuhi passing grade' : 'Belum memenuhi passing grade'}</span>
              <span>Skor hari ini: <b class="num">${doneToday[0].sum.total}</b> / 550</span>
            </div>
            <div class="row">
              <a class="btn" href="#/hasil/${doneToday[0].id}">Lihat pembahasan</a>
              <button class="btn primary" id="startDaily">Latihan tambahan (set baru)</button>
            </div>` : `
            <div class="row"><button class="btn primary big" id="startDaily">Mulai latihan hari ini →</button></div>`}
        </div>
        <div class="hero-side">
          <div class="streak"><span class="streak-n num">${S.streak()}</span><span>hari beruntun</span></div>
          <p class="muted small">Kerjakan satu set harian setiap hari untuk menjaga rangkaian.</p>
        </div>
      </section>

      <section class="tiles">
        <div class="tile"><span class="tile-k">Bank soal</span><span class="tile-v num">${util.fmt(bank.total())}</span><span class="tile-s">TWK ${bank.countBy('TWK')} · TIU ${util.fmt(bank.countBy('TIU'))} · TKP ${bank.countBy('TKP')}</span></div>
        <div class="tile"><span class="tile-k">Simulasi selesai</span><span class="tile-v num">${full.length}</span><span class="tile-s">${passCount} memenuhi passing grade</span></div>
        <div class="tile"><span class="tile-k">Skor tertinggi</span><span class="tile-v num">${best ?? '–'}</span><span class="tile-s">dari 550</span></div>
        <div class="tile"><span class="tile-k">Rata-rata skor</span><span class="tile-v num">${avg ?? '–'}</span><span class="tile-s">seluruh simulasi</span></div>
      </section>

      <section class="grid2">
        <div class="card">
          <h2>Perkembangan skor total</h2>
          <p class="muted small">Garis putus-putus: jumlah minimal passing grade (65 + 80 + 166 = 311). Lolos SKD tetap mensyaratkan <i>setiap</i> komponen memenuhi ambangnya.</p>
          ${chartHistory(full.slice(0, 20).reverse())}
        </div>
        <div class="card">
          <h2>Rata-rata 5 simulasi terakhir</h2>
          ${recent.length ? CATS.map(c => `
            <div class="catline">
              <div class="catline-h"><b>${c}</b><span class="num">${catAvg[c]} / ${S.RULES[c].max}</span></div>
              ${meter(catAvg[c], S.RULES[c].max, S.RULES[c].pg)}
            </div>`).join('') : '<p class="muted">Belum ada data. Selesaikan latihan harian pertama Anda.</p>'}
        </div>
      </section>

      <section class="card">
        <h2>Pilihan latihan lain</h2>
        <div class="options3">
          <button class="opt-card" id="startSim"><b>Simulasi CAT acak</b><span>110 soal, 100 menit, set acak baru.</span></button>
          <a class="opt-card" href="#/topik"><b>Latihan per topik</b><span>Fokus satu materi dengan pembahasan langsung.</span></a>
          <a class="opt-card" href="#/kisi"><b>Kisi-kisi & penilaian</b><span>Komposisi soal, passing grade, model TIU 2026.</span></a>
        </div>
      </section>`;

    const sd = $('#startDaily');
    if (sd) sd.onclick = () => confirmStart(() => S.daily(doneToday.length ? String(doneToday.length + 1) + '-' + Date.now() : ''));
    $('#startSim').onclick = () => confirmStart(() => S.simulasi());
    if (saved) {
      $('#resume').onclick = () => startSession(saved);
      $('#discard').onclick = () => { S.store.del('active'); route(); };
    }
    bindChart();
  }

  function confirmStart(make) {
    if (S.store.get('active', null)) {
      openModal(`<h3>Ganti sesi?</h3><p>Sesi yang belum selesai akan dibuang.</p>
        <div class="row end"><button class="btn ghost" id="mNo">Batal</button><button class="btn primary" id="mYes">Mulai sesi baru</button></div>`);
      $('#mNo').onclick = closeModal;
      $('#mYes').onclick = () => { closeModal(); startSession(make()); };
    } else startSession(make());
  }

  function chartHistory(list) {
    if (list.length < 1) return '<div class="empty-chart">Grafik muncul setelah simulasi pertama selesai.</div>';
    const W = 600, H = 220, pl = 36, pr = 12, pt = 12, pb = 26;
    const max = 550;
    const n = list.length;
    const x = i => n === 1 ? (pl + (W - pl - pr) / 2) : pl + i * (W - pl - pr) / (n - 1);
    const y = v => pt + (1 - v / max) * (H - pt - pb);
    const pts = list.map((h, i) => [x(i), y(h.sum.total)]);
    const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const grid = [0, 110, 220, 330, 440, 550].map(v => `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="${pl - 6}" y="${y(v) + 4}" class="ax" text-anchor="end">${v}</text>`).join('');
    const hits = list.map((h, i) => {
      const w = n === 1 ? 60 : (W - pl - pr) / (n - 1);
      return `<rect class="hit" x="${x(i) - w / 2}" y="${pt}" width="${w}" height="${H - pt - pb}" data-i="${i}"
        data-tip="${fmtDate(h.end, { day: 'numeric', month: 'short' })} · ${h.title.replace(/"/g, '')}|Total ${h.sum.total} · TWK ${h.sum.TWK} · TIU ${h.sum.TIU} · TKP ${h.sum.TKP}"/>`;
    }).join('');
    return `<div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Grafik skor total per sesi">
      ${grid}
      <line x1="${pl}" x2="${W - pr}" y1="${y(311)}" y2="${y(311)}" class="pgline"/>
      <text x="${W - pr}" y="${y(311) - 5}" class="ax" text-anchor="end">311</text>
      <path d="${path}" class="ln"/>
      ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" class="dot ${list[i].sum.pass ? 'ok' : ''}" data-i="${i}"/>`).join('')}
      <line class="xh" x1="0" x2="0" y1="${pt}" y2="${H - pb}" style="display:none"/>
      ${hits}
    </svg><div class="tip" hidden></div></div>`;
  }
  function bindChart() {
    const wrap = document.querySelector('.chart-wrap');
    if (!wrap) return;
    const tip = wrap.querySelector('.tip');
    const xh = wrap.querySelector('.xh');
    wrap.querySelectorAll('.hit').forEach(r => {
      r.addEventListener('pointerenter', () => {
        const [a, b] = r.dataset.tip.split('|');
        tip.innerHTML = `<b>${a}</b><br>${b}`;
        tip.hidden = false;
        const dot = wrap.querySelector(`.dot[data-i="${r.dataset.i}"]`);
        const svg = wrap.querySelector('svg');
        const box = svg.getBoundingClientRect();
        const sx = box.width / 600, sy = box.height / 220;
        const cx = +dot.getAttribute('cx'), cy = +dot.getAttribute('cy');
        xh.setAttribute('x1', cx); xh.setAttribute('x2', cx); xh.style.display = '';
        wrap.querySelectorAll('.dot').forEach(d => d.classList.toggle('hl', d === dot));
        tip.style.left = Math.min(box.width - 10, Math.max(10, cx * sx)) + 'px';
        tip.style.top = (cy * sy) + 'px';
      });
    });
    wrap.addEventListener('pointerleave', () => {
      tip.hidden = true; xh.style.display = 'none';
      wrap.querySelectorAll('.dot').forEach(d => d.classList.remove('hl'));
    });
  }

  /* ================= UJIAN ================= */
  function viewExam() {
    active = active || S.store.get('active', null);
    if (!active) { location.hash = '#/'; return; }
    renderExam();
    if (active.duration) {
      timerId = setInterval(() => {
        const left = remaining();
        const el = $('#timer');
        if (el) { el.textContent = fmtTime(left); el.classList.toggle('low', left < 300); }
        if (left <= 0) { clearInterval(timerId); submit(true); }
      }, 1000);
    }
  }
  const remaining = () => active.duration - (Date.now() - active.start) / 1000;
  const save = () => S.store.set('active', active);

  function renderExam() {
    const s = active;
    const i = s.cur;
    const q = bank.get(s.ids[i]);
    const order = s.orders[i];
    const ans = s.answers[i];
    const answered = Object.keys(s.answers).length;
    const locked = s.learn && ans != null;
    const catStart = {};
    s.ids.forEach((id, k) => { const c = bank.get(id).cat; if (catStart[c] == null) catStart[c] = k; });

    const optHtml = order.map((orig, d) => {
      let cls = ans === d ? 'sel' : '';
      let badge = '';
      if (locked) {
        if (q.cat === 'TKP') { badge = `<span class="sc">${q.scores[orig]}</span>`; if (q.scores[orig] === 5) cls += ' right'; }
        else if (orig === q.ans) cls += ' right';
        else if (ans === d) cls += ' wrong';
      }
      return `<button class="opt ${cls}" data-d="${d}" ${locked ? 'disabled' : ''}><span class="opt-l">${L[d]}</span><span class="opt-t">${q.o[orig]}</span>${badge}</button>`;
    }).join('');

    let feedback = '';
    if (locked) {
      const sc = S.scoreOf(q, ans, order);
      feedback = `<div class="feedback ${q.cat === 'TKP' ? 'tkp' : sc ? 'ok' : 'bad'}">
        <b>${q.cat === 'TKP' ? `Skor pilihan Anda: ${sc} dari 5` : sc ? 'Benar (+5)' : `Kurang tepat — jawaban: ${L[order.indexOf(q.ans)]}`}</b>
        <div class="exp">${q.e}</div></div>`;
    }

    const navGrid = CATS.filter(c => catStart[c] != null).map(c => {
      const end = CATS.slice(CATS.indexOf(c) + 1).map(x => catStart[x]).filter(v => v != null)[0] ?? s.ids.length;
      let cells = '';
      for (let k = catStart[c]; k < end; k++) {
        const st = s.flags[k] ? 'flag' : s.answers[k] != null ? 'done' : '';
        cells += `<button class="nb ${st} ${k === i ? 'cur' : ''}" data-k="${k}">${k + 1}</button>`;
      }
      return `<div class="nav-sec"><div class="nav-h">${c}</div><div class="nav-grid">${cells}</div></div>`;
    }).join('');

    app.innerHTML = `
      <div class="exam">
        <div class="exam-bar">
          <div class="exam-title"><b>${util.esc(s.title)}</b><span class="muted small">${answered}/${s.ids.length} terjawab${s.learn ? ' · mode belajar' : ''}</span></div>
          ${s.duration ? `<div class="timer num" id="timer" aria-live="off">${fmtTime(remaining())}</div>` : ''}
          <button class="btn ghost only-mobile" id="toggleNav">Daftar soal</button>
          <button class="btn primary" id="submit">Selesai</button>
        </div>
        <div class="exam-body">
          <article class="qcard">
            <div class="qhead">
              <span class="qnum">Soal ${i + 1}</span>
              <span class="tag t-${q.cat}">${q.cat}</span>
              <span class="muted small">${util.esc(q.label)}</span>
            </div>
            <div class="qtext">${q.q}</div>
            <div class="opts">${optHtml}</div>
            ${feedback}
            <div class="qfoot">
              <button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>←<span class="hide-sm"> Sebelumnya</span></button>
              <button class="btn ${s.flags[i] ? 'warn' : 'ghost'}" id="flag">${s.flags[i] ? '★ Ragu-ragu' : '☆ Ragu-ragu'}</button>
              <button class="btn ${i === s.ids.length - 1 ? 'primary' : ''}" id="next">${i === s.ids.length - 1 ? 'Selesai' : '<span class="hide-sm">Berikutnya </span>→'}</button>
            </div>
          </article>
          <aside class="qnav ${showNav ? 'open' : ''}">
            <div class="legend small"><span><i class="lg done"></i>Terjawab</span><span><i class="lg flag"></i>Ragu-ragu</span><span><i class="lg"></i>Kosong</span></div>
            ${navGrid}
          </aside>
        </div>
      </div>`;

    app.querySelectorAll('.opt').forEach(b => b.onclick = () => choose(+b.dataset.d));
    app.querySelectorAll('.nb').forEach(b => b.onclick = () => { s.cur = +b.dataset.k; showNav = false; save(); renderExam(); window.scrollTo(0, 0); });
    $('#prev').onclick = () => go(-1);
    $('#next').onclick = () => (i === s.ids.length - 1 ? submit(false) : go(1));
    $('#flag').onclick = () => { if (s.flags[i]) delete s.flags[i]; else s.flags[i] = 1; save(); renderExam(); };
    $('#submit').onclick = () => submit(false);
    $('#toggleNav').onclick = () => { showNav = !showNav; app.querySelector('.qnav').classList.toggle('open', showNav); };
  }

  function choose(d) {
    const s = active;
    if (s.learn && s.answers[s.cur] != null) return;
    if (s.answers[s.cur] === d && !s.learn) delete s.answers[s.cur]; // klik ulang = batal pilih
    else s.answers[s.cur] = d;
    save();
    renderExam();
  }
  function go(step) {
    const s = active;
    s.cur = Math.max(0, Math.min(s.ids.length - 1, s.cur + step));
    save(); renderExam(); window.scrollTo(0, 0);
  }

  function submit(timeUp) {
    const s = active;
    const blank = s.ids.length - Object.keys(s.answers).length;
    const flags = Object.keys(s.flags).length;
    const doIt = () => {
      clearInterval(timerId);
      S.finish(s);
      const id = s.id;
      active = null;
      closeModal();
      location.hash = '#/hasil/' + id;
    };
    if (timeUp) {
      openModal(`<h3>Waktu habis</h3><p>Jawaban Anda telah disimpan dan dinilai otomatis.</p><div class="row end"><button class="btn primary" id="mOk">Lihat hasil</button></div>`);
      $('#mOk').onclick = doIt;
      return;
    }
    openModal(`<h3>Akhiri sesi?</h3>
      <p>${blank ? `<b>${blank}</b> soal belum dijawab (bernilai 0). ` : 'Semua soal sudah dijawab. '}${flags ? `<b>${flags}</b> soal ditandai ragu-ragu.` : ''}</p>
      <div class="row end"><button class="btn ghost" id="mNo">Kembali</button><button class="btn primary" id="mYes">Selesai & nilai</button></div>`);
    $('#mNo').onclick = closeModal;
    $('#mYes').onclick = doIt;
  }

  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('exam-mode') || !active || !modal.hidden) return;
    if (e.target.closest && e.target.closest('input,textarea')) return;
    const k = e.key.toLowerCase();
    const idx = 'abcde'.indexOf(k) >= 0 ? 'abcde'.indexOf(k) : '12345'.indexOf(k);
    if (idx >= 0 && k.length === 1) { choose(idx); e.preventDefault(); }
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  });

  /* ================= HASIL ================= */
  function viewResult(id) {
    const h = history().find(x => x.id === id);
    if (!h) { app.innerHTML = '<div class="card"><p>Hasil tidak ditemukan.</p><a class="btn" href="#/">Kembali</a></div>'; return; }
    const g = S.grade(h);
    // Bila isi soal berubah sejak sesi ini dikerjakan, pakai skor tersimpan dan beri peringatan.
    const stale = h.chk != null && h.chk !== S.fingerprint(h.ids);
    if (stale && h.sum) {
      CATS.forEach(c => { if (g.cats[c].n) { g.cats[c].score = h.sum[c]; g.cats[c].pass = g.cats[c].score >= g.cats[c].pg; } });
      g.total = h.sum.total;
      g.pass = CATS.every(c => !g.cats[c].n || g.cats[c].pass);
    }
    const isFull = h.mode !== 'topik';
    const dur = Math.round((h.end - h.start) / 60000);
    const cats = CATS.filter(c => g.cats[c].n);
    const groups = Object.values(g.byGroup);

    app.innerHTML = `
      <section class="result-head card">
        <div>
          <p class="eyebrow">${util.esc(h.title)} · ${fmtDate(h.end, { day: 'numeric', month: 'long', year: 'numeric' })} · ${dur} menit</p>
          <div class="total"><span class="num">${g.total}</span><span class="of">/ ${g.max}</span></div>
          ${cats.length > 1 || isFull ? `<span class="chip big ${g.pass ? 'ok' : 'warn'}">${g.pass ? '✓ MEMENUHI SYARAT (MS) — semua passing grade terpenuhi' : '✕ TIDAK MEMENUHI SYARAT (TMS) — ada komponen di bawah passing grade'}</span>` : ''}
        </div>
        <div class="row"><a class="btn" href="#/">Beranda</a><a class="btn" href="#/riwayat">Riwayat</a></div>
      </section>

      ${stale ? `<div class="banner"><div><b>Soal telah diperbarui.</b> Sebagian soal pada sesi ini berubah sejak Anda mengerjakannya, sehingga rincian per materi dan pembahasan di bawah mungkin tidak cocok dengan jawaban Anda. Skor total dan skor per komponen di atas tetap dari saat Anda mengerjakan.</div></div>` : ''}

      <section class="cat-cards">
        ${cats.map(c => {
          const r = g.cats[c];
          return `<div class="card catcard">
            <div class="catcard-h"><span class="tag t-${c}">${c}</span><span class="muted small">${S.RULES[c].name}</span></div>
            <div class="catcard-score"><span class="num">${r.score}</span><span class="of">/ ${r.max}</span></div>
            ${meter(r.score, r.max, r.pg)}
            <div class="catcard-f small">
              <span>Passing grade: <b>${r.pg}</b></span>
              <span class="chip ${r.pass ? 'ok' : 'warn'}">${r.pass ? 'MS' : 'TMS'}</span>
            </div>
            <div class="muted small">${c === 'TKP' ? `${r.correct} jawaban bernilai 5 · ${r.blank} kosong` : `${r.correct} benar · ${r.n - r.correct - r.blank} salah · ${r.blank} kosong`}</div>
          </div>`;
        }).join('')}
      </section>

      <section class="card">
        <h2>Analisis per materi</h2>
        <p class="muted small">Persentase skor yang diperoleh per materi. Prioritaskan latihan topik pada baris dengan persentase terendah.</p>
        <table class="tbl">
          <thead><tr><th>Materi</th><th>Soal</th><th>Skor</th><th style="width:40%">Capaian</th><th></th></tr></thead>
          <tbody>${groups.sort((a, b) => a.score / a.max - b.score / b.max).map(x => `
            <tr><td><span class="tag t-${x.cat} sm">${x.cat}</span> ${x.label}</td><td class="num">${x.n}</td><td class="num">${x.score}/${x.max}</td>
            <td>${meter(x.score, x.max, null)}</td>
            <td><button class="btn sm ghost drill" data-g="${Object.keys(g.byGroup).find(k => g.byGroup[k] === x)}">Latih</button></td></tr>`).join('')}
          </tbody>
        </table>
      </section>

      <section class="card">
        <div class="review-h">
          <h2>Pembahasan</h2>
          <div class="chips" id="filters">
            <button class="chip-btn on" data-f="all">Semua</button>
            <button class="chip-btn" data-f="wrong">Salah / skor &lt; 5</button>
            <button class="chip-btn" data-f="blank">Kosong</button>
            <button class="chip-btn" data-f="flag">Ragu-ragu</button>
            ${cats.map(c => `<button class="chip-btn" data-f="${c}">${c}</button>`).join('')}
          </div>
        </div>
        <div class="pills" id="pills"></div>
        <div id="review"></div>
      </section>`;

    app.querySelectorAll('.drill').forEach(b => b.onclick = () => confirmStart(() => S.groupDrill(b.dataset.g, 10)));

    const items = h.ids.map((qid, i) => {
      const q = bank.get(qid);
      const a = h.answers[i];
      const sc = S.scoreOf(q, a, h.orders[i]);
      return { i, q, a, sc, order: h.orders[i], flag: !!(h.flags && h.flags[i]) };
    });
    const pills = $('#pills');
    pills.innerHTML = items.map(it => {
      const st = it.a == null ? 'blank' : it.q.cat === 'TKP' ? 'tkp s' + it.sc : it.sc ? 'right' : 'wrong';
      return `<a class="pill ${st}" href="javascript:void 0" data-i="${it.i}" title="Soal ${it.i + 1}">${it.i + 1}</a>`;
    }).join('');
    const renderReview = f => {
      const list = items.filter(it => f === 'all' ? true : f === 'wrong' ? it.a != null && it.sc < 5 : f === 'blank' ? it.a == null : f === 'flag' ? it.flag : it.q.cat === f);
      $('#review').innerHTML = list.length ? list.map(reviewItem).join('') : '<p class="muted">Tidak ada soal pada filter ini.</p>';
    };
    renderReview('all');
    $('#filters').addEventListener('click', e => {
      const b = e.target.closest('.chip-btn');
      if (!b) return;
      $('#filters').querySelectorAll('.chip-btn').forEach(x => x.classList.toggle('on', x === b));
      renderReview(b.dataset.f);
    });
    pills.addEventListener('click', e => {
      const p = e.target.closest('.pill');
      if (!p) return;
      $('#filters').querySelectorAll('.chip-btn').forEach(x => x.classList.toggle('on', x.dataset.f === 'all'));
      renderReview('all');
      const el = document.getElementById('rv' + p.dataset.i);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function reviewItem(it) {
    const { q, a, order } = it;
    const opts = order.map((orig, d) => {
      const best = q.cat === 'TKP' ? q.scores[orig] === 5 : orig === q.ans;
      let cls = best ? 'right' : '';
      if (a === d) cls += (q.cat !== 'TKP' && !best) ? ' mine wrong' : ' mine';
      return `<div class="ropt ${cls}"><span class="opt-l">${L[d]}</span><span class="opt-t">${q.o[orig]}</span>${q.cat === 'TKP' ? `<span class="sc">${q.scores[orig]}</span>` : ''}${a === d ? '<span class="you">jawaban Anda</span>' : ''}</div>`;
    }).join('');
    const verdict = a == null ? '<span class="chip">Tidak dijawab · 0</span>' :
      q.cat === 'TKP' ? `<span class="chip ${it.sc >= 4 ? 'ok' : 'warn'}">Skor ${it.sc}</span>` :
        it.sc ? '<span class="chip ok">Benar · +5</span>' : '<span class="chip warn">Salah · 0</span>';
    return `<article class="ritem" id="rv${it.i}">
      <div class="qhead"><span class="qnum">Soal ${it.i + 1}</span><span class="tag t-${q.cat}">${q.cat}</span><span class="muted small">${util.esc(q.label)}</span>${verdict}${it.flag ? '<span class="chip">ragu-ragu</span>' : ''}</div>
      <div class="qtext">${q.q}</div>
      <div class="ropts">${opts}</div>
      <div class="exp"><b>Pembahasan:</b> ${q.cat === 'TKP' ? '' : `Jawaban <b>${L[order.indexOf(q.ans)]}</b>. `}${q.e}</div>
    </article>`;
  }

  /* ================= LATIHAN TOPIK ================= */
  function viewTopic() {
    const groupsByCat = { TWK: [], TIU: [], TKP: [] };
    for (const c in S.BLUEPRINT) for (const g in S.BLUEPRINT[c]) groupsByCat[c].push(g);
    const countOf = g => S.groupPool(g).length;
    app.innerHTML = `
      <section class="card">
        <h1>Latihan per Topik</h1>
        <p class="muted">Mode belajar: jawaban dan pembahasan langsung tampil setelah Anda memilih. Soal yang sudah pernah keluar akan muncul paling akhir.</p>
      </section>
      <section class="card">
        <h2>Simulasi per komponen (berwaktu)</h2>
        <div class="options3">
          ${CATS.map(c => `<button class="opt-card sec" data-c="${c}"><b>${c} — ${S.RULES[c].n} soal</b><span>${Math.round(S.RULES[c].n * 100 / 110)} menit · passing grade ${S.RULES[c].pg}/${S.RULES[c].max}</span></button>`).join('')}
        </div>
      </section>
      ${CATS.map(c => `
        <section class="card">
          <h2><span class="tag t-${c}">${c}</span> ${S.RULES[c].name}</h2>
          <div class="topics">
            ${groupsByCat[c].map(g => `
              <div class="topic">
                <div><b>${S.GROUP_LABEL[g]}</b><div class="muted small">${util.fmt(countOf(g))} soal · ${S.BLUEPRINT[c][g]} soal per simulasi</div></div>
                <div class="row"><button class="btn sm" data-g="${g}" data-n="10">10 soal</button><button class="btn sm" data-g="${g}" data-n="20">20 soal</button></div>
              </div>`).join('')}
          </div>
        </section>`).join('')}`;
    app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => confirmStart(() => S.groupDrill(b.dataset.g, +b.dataset.n)));
    app.querySelectorAll('.sec').forEach(b => b.onclick = () => confirmStart(() => S.section(b.dataset.c)));
  }

  /* ================= RIWAYAT ================= */
  function viewHistory() {
    const hist = history();
    app.innerHTML = `
      <section class="card">
        <div class="review-h"><h1>Riwayat Latihan</h1>${hist.length ? '<button class="btn ghost sm" id="clear">Hapus riwayat</button>' : ''}</div>
        ${hist.length ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Tanggal</th><th>Sesi</th><th>TWK</th><th>TIU</th><th>TKP</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>${hist.map(h => `<tr>
            <td>${fmtDate(h.end, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td>${util.esc(h.title)}</td>
            <td class="num">${h.sum.TWK}</td><td class="num">${h.sum.TIU}</td><td class="num">${h.sum.TKP}</td>
            <td class="num"><b>${h.sum.total}</b>/${h.sum.max}</td>
            <td>${h.mode === 'topik' && h.ids.length < 110 ? '<span class="chip">latihan</span>' : `<span class="chip ${h.sum.pass ? 'ok' : 'warn'}">${h.sum.pass ? 'MS' : 'TMS'}</span>`}</td>
            <td><a class="btn sm" href="#/hasil/${h.id}">Pembahasan</a></td></tr>`).join('')}
          </tbody></table></div>` : '<p class="muted">Belum ada riwayat. <a href="#/">Mulai latihan harian</a>.</p>'}
      </section>`;
    const c = $('#clear');
    if (c) c.onclick = () => {
      openModal(`<h3>Hapus semua riwayat?</h3><p>Skor, pembahasan, dan rangkaian harian akan dihapus dari perangkat ini. Rotasi soal juga diulang dari awal.</p>
        <div class="row end"><button class="btn ghost" id="mNo">Batal</button><button class="btn primary" id="mYes">Hapus</button></div>`);
      $('#mNo').onclick = closeModal;
      $('#mYes').onclick = () => { S.store.del('history'); S.store.del('seen'); closeModal(); route(); };
    };
  }

  /* ================= KISI-KISI ================= */
  function viewKisi() {
    const R = S.RULES;
    app.innerHTML = `
      <section class="card prose">
        <h1>Kisi-kisi & Sistem Penilaian SKD</h1>
        <p>SKD (Seleksi Kompetensi Dasar) dikerjakan dengan sistem CAT BKN: <b>110 soal dalam 100 menit</b> (rata-rata ±55 detik per soal). Aplikasi ini mengikuti komposisi dan penilaian tersebut.</p>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Komponen</th><th>Jumlah soal</th><th>Penilaian</th><th>Nilai maksimal</th><th>Passing grade*</th></tr></thead>
          <tbody>
            <tr><td><b>TWK</b> — ${R.TWK.name}</td><td class="num">30</td><td>Benar 5, salah/kosong 0</td><td class="num">150</td><td class="num">65</td></tr>
            <tr><td><b>TIU</b> — ${R.TIU.name}</td><td class="num">35</td><td>Benar 5, salah/kosong 0</td><td class="num">175</td><td class="num">80</td></tr>
            <tr><td><b>TKP</b> — ${R.TKP.name}</td><td class="num">45</td><td>Setiap opsi bernilai 1–5, kosong 0</td><td class="num">225</td><td class="num">166</td></tr>
            <tr><td><b>Total</b></td><td class="num">110</td><td></td><td class="num">550</td><td>harus lolos ketiganya</td></tr>
          </tbody></table></div>
        <p class="small muted">*Mengacu KepmenPANRB No. 321 Tahun 2024 untuk formasi umum. Nilai ambang batas CPNS 2027 ditetapkan melalui keputusan MenPANRB yang baru; pantau pengumuman resmi di sscasn.bkn.go.id. Tidak ada pengurangan nilai untuk jawaban salah, jadi <b>jangan biarkan soal kosong</b>.</p>
        <p>Peserta dinyatakan <b>Memenuhi Syarat (MS)</b> jika skor TWK, TIU, dan TKP masing-masing mencapai passing grade. Peserta MS kemudian diperingkat berdasarkan nilai total; bila sama, urutan prioritas adalah nilai TKP, lalu TIU, lalu TWK. Peserta yang lanjut ke SKB umumnya maksimal 3× jumlah kebutuhan formasi.</p>

        <h2>TWK (30 soal)</h2>
        <ul>
          <li><b>Nasionalisme</b> — sejarah pergerakan, Wawasan Nusantara, sikap menjaga persatuan dalam keberagaman.</li>
          <li><b>Integritas</b> — kejujuran, penolakan gratifikasi, konflik kepentingan, akuntabilitas.</li>
          <li><b>Bela Negara</b> — nilai dasar bela negara (UU 23/2019), ancaman militer &amp; nonmiliter, keamanan siber.</li>
          <li><b>Pilar Negara</b> — Pancasila (butir pengamalan, ideologi terbuka), UUD NRI 1945 hasil amandemen, NKRI, Bhinneka Tunggal Ika.</li>
          <li><b>Bahasa Negara</b> — kedudukan bahasa Indonesia (UU 24/2009), EYD, kalimat efektif, lambang negara.</li>
        </ul>
        <p>Soal TWK terbaru banyak berbentuk <b>skenario (HOTS)</b>: pilih tindakan yang paling mencerminkan nilai kebangsaan, bukan sekadar hafalan.</p>

        <h2>TIU (35 soal) — model terbaru 2026</h2>
        <p>Berdasarkan laporan peserta SKD 2026, TIU bergeser ke penalaran tingkat tinggi. Bentuk yang perlu dikuasai dan tersedia di aplikasi ini:</p>
        <ul>
          <li><b>Logika Argumen</b> — pernyataan yang PALING MEMPERKUAT / PALING MEMPERLEMAH / TIDAK MEMPERKUAT sebuah klaim, asumsi, dan simpulan. Kuncinya: cari bukti yang menyentuh <i>hubungan sebab-akibat</i>, pembanding yang setara, atau penjelasan alternatif.</li>
          <li><b>Pola Bilangan Tabel Tipe I</b> — tabel 3×3 dengan aturan per baris atau per kolom (mis. kolom 3 = kolom 1 + kolom 2; baris 3 = baris 1 × baris 2).</li>
          <li><b>Pola Bilangan Tabel Tipe II</b> — tabel No.–Nilai: gunakan Uₙ = U₁ + (n − 1)b, cek dengan baris terakhir.</li>
          <li><b>Kecukupan Pernyataan</b> — tentukan apakah pernyataan (1), (2), keduanya, atau tidak satu pun cukup untuk menjawab. Waspadai pernyataan yang hanya mengulang data tabel.</li>
          <li><b>Silogisme &amp; logika</b>, <b>penalaran analitis</b> (posisi/urutan), <b>analogi</b>, <b>deret</b>, <b>soal cerita</b> aritmetika, dan <b>figural</b> (serial gambar).</li>
        </ul>

        <h2>TKP (45 soal)</h2>
        <p>Enam aspek: Pelayanan Publik, Jejaring Kerja, Sosial Budaya, Teknologi Informasi &amp; Komunikasi, Profesionalisme, dan Anti Radikalisme. Opsi bernilai 5 umumnya <b>proaktif, solutif, sesuai aturan, mengutamakan kepentingan publik/organisasi</b>; opsi bernilai 1 bersifat menghindar, melanggar aturan, atau merugikan pihak lain. Passing grade TKP (166 dari 225) berarti rata-rata ±3,7 per soal — usahakan selalu memilih opsi terbaik.</p>

        <h2>Strategi latihan harian</h2>
        <ol>
          <li>Kerjakan <b>Latihan Harian</b> 110 soal sekali sehari dengan disiplin waktu 100 menit.</li>
          <li>Buka <b>Pembahasan</b> dan filter "Salah" — pahami pola kesalahan, bukan hanya kuncinya.</li>
          <li>Pada tabel <b>Analisis per materi</b>, tekan "Latih" untuk materi dengan capaian terendah.</li>
          <li>Kerjakan TKP dan TWK lebih dulu jika TIU membuat Anda terburu-buru; tandai soal sulit dengan <b>Ragu-ragu</b> lalu kembali.</li>
        </ol>
        <p class="small muted">Data latihan tersimpan di peramban (localStorage) perangkat ini saja. Menghapus data peramban akan menghapus riwayat.</p>
      </section>`;
  }

  route();
})();
