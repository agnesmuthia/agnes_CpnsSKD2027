/* TIU Numerik: deret, pola bilangan tabel (Tipe I & II), soal cerita HOTS, kecukupan pernyataan. */
(function (root) {
  'use strict';
  const { util, bank } = root.CPNS;
  const { ri, pick, shuffle, fmt, rp, numOpts } = util;
  const R = (r, a, b) => ri(r, a, b);

  /* ============ DERET ANGKA ============ */
  function deret(r) {
    const type = R(r, 0, 7);
    let terms, ans, exp, step, missingAt = -1;
    switch (type) {
      case 0: { // bertingkat
        const a = R(r, 2, 25), d = R(r, 1, 6), dd = R(r, 1, 4);
        terms = [a];
        for (let k = 0; k < 6; k++) terms.push(terms[k] + d + k * dd);
        ans = terms.pop();
        const diffs = terms.slice(1).map((v, k) => v - terms[k]);
        exp = `Selisih antarsuku: ${diffs.join(', ')} (bertambah ${dd}). Selisih berikutnya ${d + 5 * dd}, maka ${fmt(terms[5])} + ${d + 5 * dd} = ${fmt(ans)}.`;
        step = dd;
        break;
      }
      case 1: { // ×k + c
        const a = R(r, 1, 6), k = pick(r, [2, 3]), c = pick(r, [-2, -1, 1, 2, 3]);
        terms = [a];
        for (let j = 0; j < 5; j++) terms.push(terms[j] * k + c);
        ans = terms.pop();
        exp = `Pola: suku berikutnya = suku sebelumnya × ${k} ${c < 0 ? '− ' + (-c) : '+ ' + c}. Maka ${fmt(terms[4])} × ${k} ${c < 0 ? '− ' + (-c) : '+ ' + c} = ${fmt(ans)}.`;
        step = k;
        break;
      }
      case 2: { // dua deret selang-seling
        const a = R(r, 2, 20), p = R(r, 2, 7), b = R(r, 1, 5), mode = R(r, 0, 1), q = R(r, 2, 6);
        const A = [a, a + p, a + 2 * p, a + 3 * p];
        const B = mode ? [b, b * 2, b * 4, b * 8] : [b + 10, b + 10 + q, b + 10 + 2 * q, b + 10 + 3 * q];
        terms = [A[0], B[0], A[1], B[1], A[2], B[2], A[3]];
        ans = B[3];
        exp = `Ada dua deret yang berselang-seling. Suku ganjil: ${A.join(', ')} (+${p}). Suku genap: ${B.slice(0, 3).join(', ')} (${mode ? '×2' : '+' + q}). Suku berikutnya adalah suku genap: ${ans}.`;
        step = mode ? b : q;
        break;
      }
      case 3: { // fibonacci-like
        const a = R(r, 1, 6), b = R(r, 2, 8), c = pick(r, [0, 0, 1, -1]);
        terms = [a, b];
        for (let j = 2; j < 7; j++) terms.push(terms[j - 1] + terms[j - 2] + c);
        ans = terms.pop();
        exp = `Setiap suku = jumlah dua suku sebelumnya${c ? (c > 0 ? ' + 1' : ' − 1') : ''}. Maka ${terms[4]} + ${terms[5]}${c ? (c > 0 ? ' + 1' : ' − 1') : ''} = ${ans}.`;
        step = 2;
        break;
      }
      case 4: { // kuadrat/kubik + c
        const n0 = R(r, 1, 6), c = R(r, -3, 5), cube = r() < 0.3;
        const f = n => (cube ? n * n * n : n * n) + c;
        terms = [];
        for (let j = 0; j < 6; j++) terms.push(f(n0 + j));
        ans = terms.pop();
        exp = `Pola: n${cube ? '³' : '²'} ${c < 0 ? '− ' + (-c) : '+ ' + c} untuk n = ${n0}, ${n0 + 1}, ${n0 + 2}, … Suku berikutnya n = ${n0 + 5}: ${(n0 + 5)}${cube ? '³' : '²'} ${c < 0 ? '− ' + (-c) : '+ ' + c} = ${fmt(ans)}.`;
        step = 2 * (n0 + 5) - 1;
        break;
      }
      case 5: { // +a, ×b bergantian
        const s = R(r, 2, 9), a = R(r, 2, 6), b = pick(r, [2, 2, 3]);
        terms = [s];
        for (let j = 0; j < 6; j++) terms.push(j % 2 === 0 ? terms[j] + a : terms[j] * b);
        ans = terms.pop();
        exp = `Operasi bergantian: +${a}, ×${b}, +${a}, ×${b}, … Suku berikutnya: ${fmt(terms[5])} + ${a} = ${fmt(ans)}.`;
        step = a;
        break;
      }
      case 6: { // suku hilang di tengah (bertingkat)
        const a = R(r, 3, 30), d = R(r, 2, 7), dd = R(r, 1, 3);
        terms = [a];
        for (let k = 0; k < 6; k++) terms.push(terms[k] + d + k * dd);
        missingAt = R(r, 2, 4);
        ans = terms[missingAt];
        exp = `Selisih antarsuku bertambah ${dd}: ${terms.slice(1).map((v, k) => v - terms[k]).join(', ')}. Suku yang hilang = ${fmt(terms[missingAt - 1])} + ${terms[missingAt] - terms[missingAt - 1]} = ${fmt(ans)}.`;
        step = dd + 1;
        break;
      }
      default: { // selisih membentuk deret geometri
        const a = R(r, 1, 15), d = R(r, 1, 3), m = pick(r, [2, 3]);
        terms = [a];
        let diff = d;
        for (let k = 0; k < 6; k++) { terms.push(terms[k] + diff); diff *= m; }
        ans = terms.pop();
        exp = `Selisih antarsuku: ${terms.slice(1).map((v, k) => v - terms[k]).join(', ')} (dikali ${m}). Selisih berikutnya ${fmt(d * Math.pow(m, 5))}, maka ${fmt(terms[5])} + ${fmt(d * Math.pow(m, 5))} = ${fmt(ans)}.`;
        step = d * Math.pow(m, 4);
      }
    }
    let shown;
    if (missingAt >= 0) shown = terms.map((v, k) => k === missingAt ? '<b>?</b>' : fmt(v)).join(', ');
    else shown = terms.map(fmt).join(', ') + ', <b>…</b>';
    const qtext = missingAt >= 0
      ? `Bilangan yang tepat untuk menggantikan tanda <b>?</b> pada deret berikut adalah ….<div class="seq">${shown}</div>`
      : `Suku berikutnya dari deret bilangan berikut adalah ….<div class="seq">${shown}</div>`;
    return { q: qtext, o: numOpts(r, ans, { step: Math.max(1, step) }), e: exp, numeric: true };
  }

  /* ============ POLA BILANGAN TABEL TIPE I (grid 3×3) ============ */
  const gridRules = [
    { f: (a, b) => a * a - b * b, d: '(kolom 1)² − (kolom 2)²', ra: [6, 15], rb: [1, 5] },
    { f: (a, b) => a * b + a + b, d: 'kolom 1 × kolom 2 + kolom 1 + kolom 2', ra: [2, 8], rb: [2, 8] },
    { f: (a, b) => 3 * a + 2 * b, d: '3 × kolom 1 + 2 × kolom 2', ra: [2, 25], rb: [2, 20] },
    { f: (a, b) => a * b - b, d: 'kolom 1 × kolom 2 − kolom 2', ra: [3, 12], rb: [2, 9] },
    { f: (a, b) => (a - b) * 2, d: '(kolom 1 − kolom 2) × 2', ra: [10, 30], rb: [1, 9] },
    { f: (a, b) => (a + b) * (a - b), d: '(kolom 1 + kolom 2) × (kolom 1 − kolom 2)', ra: [6, 14], rb: [1, 5] },
    { f: (a, b) => a + b, d: 'kolom 1 + kolom 2', ra: [5, 40], rb: [5, 40] },
    { f: (a, b) => a * b, d: 'kolom 1 × kolom 2', ra: [2, 9], rb: [2, 9] },
    { f: (a, b) => (a + b) * (a + b), d: '(kolom 1 + kolom 2)²', ra: [1, 7], rb: [1, 7] },
    { f: (a, b) => a + 2 * b, d: 'kolom 1 + 2 × kolom 2', ra: [3, 30], rb: [2, 20] },
    { f: (a, b) => a * b - 2, d: 'kolom 1 × kolom 2 − 2', ra: [2, 9], rb: [2, 9] },
    { f: (a, b) => a * b + 3, d: 'kolom 1 × kolom 2 + 3', ra: [2, 9], rb: [2, 9] },
    { f: (a, b) => (a + b) * 2, d: '(kolom 1 + kolom 2) × 2', ra: [2, 20], rb: [2, 20] },
    { f: (a, b) => (a + b) * 3, d: '(kolom 1 + kolom 2) × 3', ra: [2, 15], rb: [2, 15] },
    { f: (a, b) => a * a - b, d: '(kolom 1)² − kolom 2', ra: [3, 11], rb: [1, 9] },
    { f: (a, b) => a * a + b, d: '(kolom 1)² + kolom 2', ra: [2, 10], rb: [1, 12] },
    { f: (a, b) => a * 2 + b, d: '2 × kolom 1 + kolom 2', ra: [2, 25], rb: [1, 20] },
    { f: (a, b) => a * 3 - b, d: '3 × kolom 1 − kolom 2', ra: [4, 20], rb: [1, 10] },
    { f: (a, b) => a * b + a, d: 'kolom 1 × kolom 2 + kolom 1', ra: [2, 9], rb: [2, 9] },
    { f: (a, b) => (a - b) * (a - b), d: '(kolom 1 − kolom 2)²', ra: [8, 16], rb: [1, 7] },
    { f: (a, b) => a * b - a - b, d: 'kolom 1 × kolom 2 − (kolom 1 + kolom 2)', ra: [3, 10], rb: [3, 10] },
    { f: (a, b) => a * a + b * b, d: '(kolom 1)² + (kolom 2)²', ra: [1, 9], rb: [1, 9] }
  ];
  function polaTabel1(r) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const rule = pick(r, gridRules);
      const rows = [];
      const used = new Set();
      while (rows.length < 3) {
        const a = R(r, rule.ra[0], rule.ra[1]), b = R(r, rule.rb[0], rule.rb[1]);
        const c = rule.f(a, b);
        const key = a + ',' + b;
        if (c <= 0 || c > 400 || used.has(key)) continue;
        used.add(key);
        rows.push([a, b, c]);
      }
      // pastikan pola tidak ambigu dengan aturan lain yang cocok untuk semua baris
      const others = gridRules.filter(g => g !== rule && rows.every(([a, b, c]) => g.f(a, b) === c));
      if (others.length) continue;
      const rowIdx = R(r, 0, 2);
      const colIdx = r() < 0.6 ? 2 : R(r, 0, 1);
      const truth = rows[rowIdx][colIdx];
      // cek keunikan nilai yang hilang
      let sols = 0;
      for (let v = 1; v <= 2000 && sols < 2; v++) {
        const t = rows[rowIdx].slice(); t[colIdx] = v;
        if (rule.f(t[0], t[1]) === t[2]) sols++;
      }
      if (sols !== 1) continue;
      const transpose = r() < 0.35;
      const cell = (i, j) => (i === rowIdx && j === colIdx) ? '<b>?</b>' : fmt(rows[i][j]);
      let html = '<table class="grid">';
      for (let i = 0; i < 3; i++) {
        html += '<tr>';
        for (let j = 0; j < 3; j++) html += '<td>' + (transpose ? cell(j, i) : cell(i, j)) + '</td>';
        html += '</tr>';
      }
      html += '</table>';
      const desc = transpose ? rule.d.replace(/kolom (\d)/g, 'baris $1') : rule.d;
      const target = transpose ? 'kolom' : 'baris';
      const pos = transpose ? 'baris 3' : 'kolom 3';
      const sample = rows[(rowIdx + 1) % 3];
      return {
        q: 'Perhatikan tabel berikut!' + html + 'Nilai yang tepat untuk menggantikan tanda <b>?</b> adalah ….',
        o: numOpts(r, truth, { step: Math.max(1, Math.round(truth * 0.1)) }),
        e: `Pola setiap ${target}: ${pos} = ${desc}. Contoh: ${sample[0]}, ${sample[1]} → ${sample[2]}. Pada ${target} ke-${rowIdx + 1} (${rows[rowIdx].map((v, j) => j === colIdx ? '?' : v).join(', ')}), nilai yang memenuhi adalah ${fmt(truth)}.`,
        numeric: true
      };
    }
    return deret(r);
  }

  /* ============ POLA BILANGAN TABEL TIPE II (No. – Nilai) ============ */
  function tableNo(rows) {
    let html = '<table class="notable"><thead><tr><th>No.</th><th>Nilai</th></tr></thead><tbody>';
    for (const [n, v] of rows) html += `<tr><td>${n}</td><td>${v}</td></tr>`;
    return html + '</tbody></table>';
  }
  function polaTabel2(r) {
    const type = R(r, 0, 6);
    if (type <= 1) { // aritmetika naik/turun, tanya Uk
      const down = type === 1;
      const b = down ? -pick(r, [2, 3, 4, 5, 6, 7, 8, 9]) : pick(r, [3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 25, 45]);
      const N = R(r, 9, 16);
      let a = down ? R(r, -b * (N - 1) + 5, -b * (N - 1) + 80) : pick(r, [R(r, 2, 30), R(r, 2, 12) * 5]);
      const U = n => a + (n - 1) * b;
      const k = R(r, 5, N - 1);
      const ans = U(k);
      return {
        q: 'Perhatikan tabel berikut!' + tableNo([[1, U(1)], [2, U(2)], [3, U(3)], ['⋮', '⋮'], [k, '<b>?</b>'], ['⋮', '⋮'], [N, fmt(U(N))]]) +
          'Nilai yang tepat untuk menggantikan tanda <b>?</b> adalah ….',
        o: numOpts(r, ans, { step: Math.abs(b) }),
        e: `Barisan aritmetika dengan U₁ = ${a} dan beda b = ${b}. Cek: U${N} = ${a} + ${N - 1}×(${b}) = ${U(N)} ✔. Maka U${k} = ${a} + ${k - 1}×(${b}) = ${fmt(ans)}.`,
        numeric: true
      };
    }
    if (type === 2) { // tanya nomor
      const b = pick(r, [3, 4, 5, 6, 7, 8, 12, 15]);
      const a = R(r, 2, 40);
      const U = n => a + (n - 1) * b;
      const N = R(r, 14, 25);
      const k = R(r, 6, N - 2);
      return {
        q: 'Perhatikan tabel berikut!' + tableNo([[1, U(1)], [2, U(2)], [3, U(3)], ['⋮', '⋮'], ['<b>?</b>', fmt(U(k))], ['⋮', '⋮'], [N, fmt(U(N))]]) +
          'Nomor yang tepat untuk menggantikan tanda <b>?</b> adalah ….',
        o: numOpts(r, k, { step: 1 }),
        e: `U₁ = ${a}, b = ${b}. Uₙ = ${a} + (n − 1)×${b} = ${U(k)} ⇒ n − 1 = ${(U(k) - a) / b} ⇒ n = ${k}.`,
        numeric: true
      };
    }
    if (type === 3) { // geometri
      const ratio = pick(r, [2, 2, 3]);
      const a = R(r, 1, 7);
      const N = ratio === 2 ? R(r, 8, 10) : R(r, 6, 7);
      const U = n => a * Math.pow(ratio, n - 1);
      const k = R(r, 5, N - 1);
      const ans = U(k);
      return {
        q: 'Perhatikan tabel berikut!' + tableNo([[1, U(1)], [2, U(2)], [3, U(3)], ['⋮', '⋮'], [k, '<b>?</b>'], ['⋮', '⋮'], [N, fmt(U(N))]]) +
          'Nilai yang tepat untuk menggantikan tanda <b>?</b> adalah ….',
        o: numOpts(r, ans, { step: U(k - 1), extra: [U(k - 1) + U(k - 2), ans + a, ans - a] }),
        e: `Barisan geometri dengan U₁ = ${a} dan rasio ${ratio}. Uₙ = ${a} × ${ratio}ⁿ⁻¹, sehingga U${k} = ${a} × ${ratio}^${k - 1} = ${fmt(ans)}.`,
        numeric: true
      };
    }
    if (type === 5) { // tabel tidak dimulai dari No. 1
      const b = pick(r, [3, 4, 5, 6, 7, 8, 9, 12, 15, 25]), a = R(r, 2, 40);
      const U = n => a + (n - 1) * b;
      const st = R(r, 3, 6), k = R(r, 12, 20);
      return {
        q: 'Perhatikan tabel berikut!' + tableNo([[st, U(st)], [st + 1, U(st + 1)], [st + 2, U(st + 2)], ['⋮', '⋮'], [k, '<b>?</b>']]) +
          'Nilai yang tepat untuk menggantikan tanda <b>?</b> adalah ….',
        o: numOpts(r, U(k), { step: b }),
        e: `Beda b = ${U(st + 1)} − ${U(st)} = ${b}. Dari No. ${st} ke No. ${k} ada ${k - st} langkah, sehingga nilai = ${U(st)} + ${k - st} × ${b} = ${fmt(U(k))}.`,
        numeric: true
      };
    }
    if (type === 6) { // selisih dua nomor
      const b = pick(r, [3, 4, 5, 6, 7, 8, 9, 11, 12, 15]), a = R(r, 2, 40);
      const U = n => a + (n - 1) * b;
      const m = R(r, 3, 8), k = R(r, 12, 22);
      return {
        q: 'Perhatikan tabel berikut!' + tableNo([[1, U(1)], [2, U(2)], [3, U(3)], ['⋮', '⋮'], [30, fmt(U(30))]]) +
          `Selisih nilai pada No. ${k} dan No. ${m} adalah ….`,
        o: numOpts(r, U(k) - U(m), { step: b }),
        e: `b = ${b}. Selisih = (${k} − ${m}) × ${b} = ${fmt(U(k) - U(m))}. Nilai awal tidak diperlukan karena selisih hanya bergantung pada beda.`,
        numeric: true
      };
    }
    // jumlah n suku pertama
    const b = pick(r, [2, 3, 4, 5, 6]);
    const a = R(r, 1, 12);
    const N = R(r, 10, 20);
    const U = n => a + (n - 1) * b;
    const k = R(r, 6, N - 2);
    const S = k * (2 * a + (k - 1) * b) / 2;
    return {
      q: 'Perhatikan tabel berikut!' + tableNo([[1, U(1)], [2, U(2)], [3, U(3)], ['⋮', '⋮'], [N, fmt(U(N))]]) +
        `Jumlah nilai dari No. 1 sampai dengan No. ${k} adalah ….`,
      o: numOpts(r, S, { step: U(k), extra: [k * U(k), S - U(k)] }),
      e: `U₁ = ${a}, b = ${b}, U${k} = ${U(k)}. Sₙ = n/2 × (U₁ + Uₙ) = ${k}/2 × (${a} + ${U(k)}) = ${fmt(S)}.`,
      numeric: true
    };
  }

  /* ============ SOAL CERITA (aritmetika HOTS) ============ */
  const nama = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hana', 'Irfan', 'Joko', 'Kirana', 'Lestari', 'Made', 'Nanda', 'Putri', 'Raka', 'Sari', 'Tono', 'Umi', 'Wulan'];
  const cerita = [
    function diskon(r) {
      const H = R(r, 8, 60) * 10000, d1 = pick(r, [10, 20, 25, 30, 40, 50]), d2 = pick(r, [10, 20, 25]);
      const fin = H * (100 - d1) * (100 - d2) / 10000;
      const item = pick(r, ['sepatu', 'tas', 'jaket', 'jam tangan', 'printer', 'kompor gas']);
      return {
        label: 'Aritmetika Sosial',
        q: `Sebuah toko memberikan diskon ${d1}% + ${d2}% untuk sebuah ${item} seharga ${rp(H)}. Diskon kedua dihitung dari harga setelah diskon pertama. Harga yang harus dibayar adalah ….`,
        o: numOpts(r, fin, { step: 5000, extra: [H * (100 - d1 - d2) / 100] }).map(rp), numeric: true,
        e: `Harga setelah diskon ${d1}%: ${rp(H * (100 - d1) / 100)}. Setelah diskon ${d2}%: ${rp(H * (100 - d1) / 100)} × ${100 - d2}% = ${rp(fin)}. Jebakan: diskon ${d1}% + ${d2}% ≠ ${d1 + d2}%.`
      };
    },
    function kecepatanRata(r) {
      const p = pick(r, [[60, 40, 48], [30, 60, 40], [20, 30, 24], [45, 90, 60], [50, 75, 60], [60, 90, 72], [70, 30, 42], [80, 120, 96], [36, 45, 40], [24, 40, 30], [48, 80, 60], [40, 60, 48]]);
      const n = pick(r, nama), D = R(r, 6, 30) * 10;
      return {
        label: 'Kecepatan, Jarak & Waktu',
        q: `${n} mengendarai mobil dari kota A ke kota B yang berjarak ${D} km dengan kecepatan rata-rata ${p[0]} km/jam, kemudian kembali melalui jalan yang sama dengan kecepatan rata-rata ${p[1]} km/jam. Kecepatan rata-rata ${n} untuk seluruh perjalanan pulang-pergi adalah ….`,
        o: numOpts(r, p[2], { step: 2, extra: [(p[0] + p[1]) / 2] }).map(v => fmt(v) + ' km/jam'), numeric: true,
        e: `Kecepatan rata-rata = total jarak ÷ total waktu = 2v₁v₂/(v₁+v₂) = 2×${p[0]}×${p[1]}/(${p[0] + p[1]}) = ${p[2]} km/jam (bukan rata-rata biasa ${(p[0] + p[1]) / 2}). Jarak ${D} km tidak memengaruhi hasil.`
      };
    },
    function kerjaBersama(r) {
      const p = pick(r, [[6, 3, 2], [12, 6, 4], [10, 15, 6], [20, 30, 12], [12, 4, 3], [24, 8, 6], [18, 9, 6], [40, 10, 8], [30, 20, 12], [36, 12, 9], [60, 40, 24], [21, 42, 14], [28, 21, 12], [45, 30, 18]]);
      const [a, b] = shuffle(r, nama).slice(0, 2);
      const work = pick(r, ['mengecat sebuah ruang kelas', 'menyusun laporan keuangan', 'memasang instalasi jaringan', 'menyelesaikan pembukuan arsip', 'merenovasi pagar kantor']);
      if (r() < 0.5) {
        return {
          label: 'Pekerjaan Bersama',
          q: `${a} dapat ${work} dalam ${p[0]} hari, sedangkan ${b} dapat menyelesaikan pekerjaan yang sama dalam ${p[1]} hari. Jika keduanya bekerja bersama-sama, pekerjaan tersebut selesai dalam ….`,
          o: numOpts(r, p[2], { step: 1, extra: [(p[0] + p[1]) / 2] }).map(v => fmt(v) + ' hari'), numeric: true,
          e: `1/${p[0]} + 1/${p[1]} = ${p[0] + p[1]}/${p[0] * p[1]} = 1/${p[2]}. Jadi selesai dalam ${p[2]} hari.`
        };
      }
      return {
        label: 'Pekerjaan Bersama',
        q: `${a} dan ${b} bersama-sama dapat ${work} dalam ${p[2]} hari. Jika ${a} bekerja sendiri, pekerjaan itu selesai dalam ${p[0]} hari. Jika ${b} bekerja sendiri, pekerjaan itu selesai dalam ….`,
        o: numOpts(r, p[1], { step: 2, extra: [p[0] - p[2]] }).map(v => fmt(v) + ' hari'), numeric: true,
        e: `1/${b} = 1/${p[2]} − 1/${p[0]} = ${p[0] - p[2]}/${p[0] * p[2]} = 1/${p[1]}. Jadi ${b} membutuhkan ${p[1]} hari.`
      };
    },
    function bagiRasio(r) {
      const rat = shuffle(r, [2, 3, 4, 5, 6, 7]).slice(0, 3);
      const sum = rat[0] + rat[1] + rat[2];
      const k = R(r, 2, 15) * 50000;
      const T = sum * k;
      const [a, b, c] = shuffle(r, nama).slice(0, 3);
      const mx = Math.max(...rat), mn = Math.min(...rat);
      const ans = (mx - mn) * k;
      return {
        label: 'Perbandingan',
        q: `Uang sebesar ${rp(T)} dibagikan kepada ${a}, ${b}, dan ${c} dengan perbandingan ${rat.join(' : ')}. Selisih bagian terbesar dan terkecil adalah ….`,
        o: numOpts(r, ans, { step: k, extra: [mx * k] }).map(rp), numeric: true,
        e: `Satu bagian = ${rp(T)} ÷ ${sum} = ${rp(k)}. Selisih = (${mx} − ${mn}) × ${rp(k)} = ${rp(ans)}.`
      };
    },
    function usia(r) {
      for (let t = 0; t < 50; t++) {
        const p = R(r, 2, 5), q = 1, m = R(r, 3, 12), n = R(r, 2, 12);
        const A = p * m, B = q * m;
        const g = util.gcd(A + n, B + n);
        const x = (A + n) / g, y = (B + n) / g;
        if (x > 9 || y > 9 || A > 70 || B < 2) continue;
        const [anak] = shuffle(r, nama);
        return {
          label: 'Perbandingan Usia',
          q: `Perbandingan usia ayah dan ${anak} saat ini adalah ${p} : ${q}. ${n} tahun yang akan datang, perbandingan usia mereka menjadi ${x} : ${y}. Usia ayah saat ini adalah ….`,
          o: numOpts(r, A, { step: p, extra: [A + n] }).map(v => v + ' tahun'), numeric: true,
          e: `Misal usia ayah ${p}k dan ${anak} ${q}k. (${p}k + ${n}) : (k + ${n}) = ${x} : ${y} ⇒ ${y}(${p}k + ${n}) = ${x}(k + ${n}) ⇒ k = ${m}. Usia ayah = ${p} × ${m} = ${A} tahun.`
        };
      }
      return cerita[0](r);
    },
    function rataRata(r) {
      const r1 = R(r, 60, 85), n = R(r, 9, Math.min(39, 99 - r1)), d = 1;
      const v = (n + 1) * (r1 + d) - n * r1;
      const kelas = pick(r, ['peserta pelatihan', 'siswa kelas XI', 'pegawai bagian keuangan', 'peserta tryout']);
      return {
        label: 'Statistika Sederhana',
        q: `Nilai rata-rata ${n} orang ${kelas} adalah ${r1}. Setelah nilai seorang peserta susulan dimasukkan, rata-ratanya naik menjadi ${r1 + d}. Nilai peserta susulan tersebut adalah ….`,
        o: numOpts(r, v, { step: 1, extra: [r1 + d, v - n] }), numeric: true,
        e: `Jumlah awal = ${n} × ${r1} = ${n * r1}. Jumlah baru = ${n + 1} × ${r1 + d} = ${(n + 1) * (r1 + d)}. Nilai susulan = ${(n + 1) * (r1 + d)} − ${n * r1} = ${v}.`
      };
    },
    function untung(r) {
      if (r() < 0.5) {
        const B = R(r, 4, 40) * 5000, p = pick(r, [5, 10, 12, 15, 20, 25, 30, 40]);
        const J = B * (100 + p) / 100;
        return {
          label: 'Aritmetika Sosial',
          q: `Seorang pedagang membeli barang seharga ${rp(B)} dan menjualnya kembali seharga ${rp(J)}. Persentase keuntungan pedagang tersebut adalah ….`,
          o: numOpts(r, p, { step: 5, extra: [Math.round((J - B) / J * 100)] }).map(v => fmt(v) + '%'), numeric: true,
          e: `Untung = ${rp(J)} − ${rp(B)} = ${rp(J - B)}. Persentase = ${rp(J - B)} ÷ ${rp(B)} × 100% = ${p}% (dihitung dari harga beli).`
        };
      }
      const p = pick(r, [20, 25, 50]);
      const h = R(r, 2, 12) * 1000 * (p === 25 ? 5 : 1);
      const L = R(r, 2, 6);
      const Hl = 12 * h * 100 / (100 + p);
      const item = pick(r, ['buku tulis', 'pulpen', 'gelas', 'piring', 'kaos kaki']);
      return {
        label: 'Aritmetika Sosial',
        q: `Pak Hasan membeli ${L} lusin ${item} dengan harga ${rp(Hl)} per lusin. Seluruh ${item} dijual kembali dengan harga ${rp(h)} per buah. Persentase keuntungan Pak Hasan adalah ….`,
        o: numOpts(r, p, { step: 5 }).map(v => fmt(v) + '%'), numeric: true,
        e: `Harga jual per lusin = 12 × ${rp(h)} = ${rp(12 * h)}. Untung per lusin = ${rp(12 * h)} − ${rp(Hl)} = ${rp(12 * h - Hl)}. Persentase = ${rp(12 * h - Hl)} ÷ ${rp(Hl)} × 100% = ${p}%. Jumlah lusin tidak memengaruhi persentase.`
      };
    },
    function bunga(r) {
      const M = R(r, 2, 20) * 1000000, p = pick(r, [6, 8, 9, 10, 12]), t = pick(r, [3, 6, 9, 12, 18, 24]);
      const b = M * p * t / 1200;
      return {
        label: 'Aritmetika Sosial',
        q: `${pick(r, nama)} menabung di bank sebesar ${rp(M)} dengan bunga tunggal ${p}% per tahun. Jumlah tabungan setelah ${t} bulan adalah ….`,
        o: numOpts(r, M + b, { step: Math.max(50000, Math.round(b / 4 / 10000) * 10000), extra: [M + M * p / 100] }).map(rp), numeric: true,
        e: `Bunga = ${rp(M)} × ${p}% × ${t}/12 = ${rp(b)}. Tabungan = ${rp(M)} + ${rp(b)} = ${rp(M + b)}.`
      };
    },
    function berpapasan(r) {
      const t = pick(r, [1, 1.5, 2, 2.5, 3, 0.75, 1.25]);
      let v1, v2, D;
      do { v1 = R(r, 8, 16) * 5; v2 = R(r, 6, 14) * 5; D = t * (v1 + v2); } while (!Number.isInteger(D));
      const h0 = R(r, 6, 10), m0 = pick(r, [0, 15, 30, 45]);
      const tm = h => { const tot = h0 * 60 + m0 + Math.round(h * 60); return String(Math.floor(tot / 60)).padStart(2, '0') + '.' + String(tot % 60).padStart(2, '0'); };
      const [a, b] = shuffle(r, nama).slice(0, 2);
      const ans = tm(t);
      const opts = [ans];
      for (const d of shuffle(r, [-0.5, 0.5, -0.25, 0.25, 0.75, -0.75, 1])) {
        const s = tm(t + d);
        if (opts.length < 5 && t + d > 0 && opts.indexOf(s) < 0) opts.push(s);
      }
      return {
        label: 'Kecepatan, Jarak & Waktu',
        q: `Jarak kota P dan kota Q adalah ${fmt(D)} km. ${a} berangkat dari P menuju Q dengan kecepatan ${v1} km/jam, dan pada saat yang sama ${b} berangkat dari Q menuju P dengan kecepatan ${v2} km/jam. Jika keduanya berangkat pukul ${tm(0)}, mereka akan berpapasan pukul ….`,
        o: opts.map(s => 'pukul ' + s),
        e: `Waktu berpapasan = jarak ÷ (v₁ + v₂) = ${fmt(D)} ÷ ${v1 + v2} = ${fmt(t)} jam = ${Math.round(t * 60)} menit. Pukul ${tm(0)} + ${Math.round(t * 60)} menit = pukul ${ans}.`
      };
    },
    function peluang(r) {
      const m = R(r, 3, 7), n = R(r, 2, 6);
      const C2 = x => x * (x - 1) / 2;
      const T = m + n;
      const val = [C2(m), C2(T)];
      const f = (a, b) => { const g = util.gcd(a, b); return (a / g) + '/' + (b / g); };
      const correct = f(val[0], val[1]);
      const cand = [f(m * m, T * T), f(m, T), f(m, 2 * T), f(C2(m), T * T), f(m * (m - 1), T * T), f(n, T), f(C2(n), C2(T)), f(m * n, C2(T))];
      const opts = [correct];
      for (const c of shuffle(r, cand)) if (opts.length < 5 && opts.indexOf(c) < 0) opts.push(c);
      const color = pick(r, [['merah', 'biru'], ['kuning', 'hijau'], ['putih', 'hitam']]);
      return {
        label: 'Peluang',
        q: `Dalam sebuah kotak terdapat ${m} bola ${color[0]} dan ${n} bola ${color[1]}. Jika diambil 2 bola sekaligus secara acak, peluang terambil keduanya bola ${color[0]} adalah ….`,
        o: opts.map(s => { const [a, b] = s.split('/'); return util.frac(+a, +b); }),
        e: `Banyak cara memilih 2 bola ${color[0]} = C(${m},2) = ${C2(m)}. Banyak cara memilih 2 bola dari ${T} bola = C(${T},2) = ${C2(T)}. Peluang = ${C2(m)}/${C2(T)} = ${correct}.`
      };
    },
    function naikTurun(r) {
      const a = pick(r, [10, 20, 30, 40, 50]);
      const net = a * a / 100;
      const opts = [`turun ${fmt(net)}%`, 'tetap (tidak berubah)', `naik ${fmt(net)}%`, `turun ${fmt(a)}%`, `turun ${fmt(net / 2)}%`];
      const item = pick(r, ['beras', 'minyak goreng', 'gula pasir', 'telur', 'bawang merah']);
      return {
        label: 'Persentase',
        q: `Harga ${item} di pasar naik ${a}% pada bulan Januari, kemudian turun ${a}% pada bulan Februari. Dibandingkan harga sebelum Januari, harga ${item} pada akhir Februari ….`,
        o: opts,
        e: `Misal harga awal 100. Setelah naik ${a}%: ${100 + a}. Setelah turun ${a}%: ${100 + a} × ${100 - a}% = ${fmt((100 + a) * (100 - a) / 100)}. Jadi turun ${fmt(net)}%.`
      };
    },
    function tambahPekerja(r) {
      for (let t = 0; t < 60; t++) {
        const T = pick(r, [4, 5, 6, 8, 10, 12]), h = R(r, 1, Math.floor(T / 2));
        const base = T / util.gcd(T, h);
        const p = base * R(r, 1, Math.floor(60 / base));
        if (p < 10) continue;
        const d = R(r, 3, 10), Rr = T + h, x = d + Rr;
        const add = p * h / T;
        return {
          label: 'Perbandingan Berbalik Nilai',
          q: `Sebuah proyek dijadwalkan selesai dalam ${x} hari oleh ${p} pekerja. Setelah dikerjakan ${d} hari, pekerjaan terhenti selama ${h} hari karena cuaca buruk. Agar proyek selesai tepat waktu, banyak pekerja tambahan yang diperlukan adalah ….`,
          o: numOpts(r, add, { step: Math.max(1, Math.round(add / 3)), extra: [p * Rr / T] }).map(v => fmt(v) + ' orang'), numeric: true,
          e: `Sisa pekerjaan setara ${p} pekerja × ${Rr} hari. Sisa waktu = ${Rr} − ${h} = ${T} hari. Pekerja dibutuhkan = ${p} × ${Rr} ÷ ${T} = ${p * Rr / T}. Tambahan = ${p * Rr / T} − ${p} = ${add} orang.`
        };
      }
      return cerita[0](r);
    },
    function skala(r) {
      const S = pick(r, [100000, 200000, 250000, 500000, 1500000, 2000000]);
      const x = R(r, 2, 15);
      const km = x * S / 100000;
      return {
        label: 'Skala & Perbandingan',
        q: `Pada peta berskala 1 : ${fmt(S)}, jarak dua kota adalah ${x} cm. Jika sebuah bus menempuh jarak sebenarnya dengan kecepatan rata-rata ${pick(r, [40, 50, 60])} km/jam, jarak sebenarnya kedua kota adalah ….`,
        o: numOpts(r, km, { step: Math.max(1, Math.round(km / 5)), extra: [km * 10, km / 10] }).map(v => fmt(v) + ' km'), numeric: true,
        e: `Jarak sebenarnya = ${x} cm × ${fmt(S)} = ${fmt(x * S)} cm = ${fmt(km)} km. Informasi kecepatan bus tidak diperlukan (informasi pengecoh).`
      };
    }
  ];
  function soalCerita(r, i) {
    const f = cerita[i % cerita.length];
    return f(r);
  }

  /* ============ KECUKUPAN PERNYATAAN ============ */
  const KD_OPTS = [
    'Pernyataan (1) SAJA cukup untuk menjawab pertanyaan, tetapi pernyataan (2) SAJA tidak cukup.',
    'Pernyataan (2) SAJA cukup untuk menjawab pertanyaan, tetapi pernyataan (1) SAJA tidak cukup.',
    'DUA pernyataan BERSAMA-SAMA cukup untuk menjawab pertanyaan, tetapi SATU pernyataan SAJA tidak cukup.',
    'Pernyataan (1) SAJA cukup untuk menjawab pertanyaan dan pernyataan (2) SAJA cukup.',
    'Pernyataan (1) dan pernyataan (2) tidak cukup untuk menjawab pertanyaan.'
  ];
  const L = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  function tbl(head, rows) {
    let h = '<table class="data"><thead><tr>' + head.map(x => `<th>${x}</th>`).join('') + '</tr></thead><tbody>';
    for (const row of rows) h += '<tr>' + row.map(x => `<td>${x}</td>`).join('') + '</tr>';
    return h + '</tbody></table>';
  }
  function kdBuild(table, question, s1, s2, letter, exp) {
    return {
      q: (table ? 'Perhatikan tabel berikut!' + table : '') +
        `<p><b>PERTANYAAN:</b><br>${question}</p><p><b>PERNYATAAN (1):</b> ${s1}<br><b>PERNYATAAN (2):</b> ${s2}</p>`,
      o: KD_OPTS.slice(), ans: L[letter], fixed: true, e: `Jawaban ${letter}. ${exp}`
    };
  }
  const kdFamilies = [
    function pabrik(r) {
      const [X, Y] = pick(r, [['Pabrik X', 'Pabrik Y'], ['Unit A', 'Unit B'], ['Gudang Utara', 'Gudang Selatan'], ['Cabang Bogor', 'Cabang Depok']]);
      const T1 = R(r, 8, 20) * 100, H1 = T1 - R(r, 1, 5) * 100;
      let P = R(r, 6, 18) * 100;
      if (P === T1) P += 100;
      const pct = pick(r, [50, 60, 75, 80]);
      const H2 = P * pct / 100;
      const sisa = (T1 - H1) + (P - H2);
      const table = tbl(['Lokasi', 'Target Produksi', 'Hasil Saat Ini'], [[X, fmt(T1) + ' unit', fmt(H1) + ' unit'], [Y, '<i>p</i> unit', fmt(H2) + ' unit']]);
      const Q = 'Berapakah sisa target produksi keseluruhan dari kedua lokasi yang belum tercapai?';
      const suff = shuffle(r, [
        `Target produksi ${Y} adalah ${fmt(P)} unit.`,
        `Total target produksi kedua lokasi adalah ${fmt(T1 + P)} unit.`,
        `Hasil saat ini ${Y} baru mencapai ${pct}% dari targetnya.`
      ]);
      const big = P > T1;
      let cfg = R(r, 0, 4);
      const alt = 2 * T1 - P;
      if (cfg >= 3 && !(alt > H2)) cfg = R(r, 0, 2);
      const ex = `Sisa total = (${fmt(T1)} − ${fmt(H1)}) + (p − ${fmt(H2)}); cukup jika nilai p dapat ditentukan secara tunggal (p = ${fmt(P)}, sisa = ${fmt(sisa)} unit).`;
      if (cfg === 0) return kdBuild(table, Q, suff[0], suff[1], 'D', ex + ' Masing-masing pernyataan dapat menentukan p.');
      if (cfg === 1) return kdBuild(table, Q, suff[0], `${Y} memiliki jumlah karyawan lebih banyak daripada ${X}.`, 'A', ex + ' Pernyataan (2) tidak memberi informasi tentang p.');
      if (cfg === 2) return kdBuild(table, Q, `Target produksi ${Y} ${big ? 'lebih besar' : 'lebih kecil'} daripada target ${X}.`, suff[0], 'B', ex + ' Pernyataan (1) hanya perbandingan, tidak menentukan p.');
      if (cfg === 3) return kdBuild(table, Q, `Selisih target produksi ${X} dan ${Y} adalah ${fmt(Math.abs(T1 - P))} unit.`, `Target produksi ${Y} ${big ? 'lebih besar' : 'lebih kecil'} daripada target ${X}.`, 'C', ex + ` Pernyataan (1) saja memberi dua kemungkinan p (${fmt(T1 - Math.abs(T1 - P))} atau ${fmt(T1 + Math.abs(T1 - P))}); pernyataan (2) memastikan arahnya.`);
      return kdBuild(table, Q, `Selisih target produksi ${X} dan ${Y} adalah ${fmt(Math.abs(T1 - P))} unit.`, `Target produksi ${Y} merupakan kelipatan 100.`, 'E', ex + ` Kedua kemungkinan p (${fmt(T1 - Math.abs(T1 - P))} dan ${fmt(T1 + Math.abs(T1 - P))}) sama-sama kelipatan 100, sehingga p tetap tidak tunggal.`);
    },
    function proyek(r) {
      const MA = R(r, 1, 5) * 10, pA = pick(r, [10, 20, 25]), m = R(r, 1, 6) * 10 + (r() < 0.5 ? 0 : 10), pB = pick(r, [10, 15, 20]);
      const kA = MA * pA / 100, kB = m * pB / 100, tot = kA + kB;
      const table = tbl(['Proyek', 'Modal Awal', 'Persentase Keuntungan'], [['Proyek A', `Rp${MA} Juta`, pA + '%'], ['Proyek B', 'Rp<i>m</i> Juta', pB + '%']]);
      const Q = 'Berapakah total keuntungan riil (dalam Rupiah) dari kedua proyek tersebut?';
      const ex = `Total = ${fmt(kA)} juta + ${pB}% × m; perlu nilai m (m = ${m} juta, total = Rp${fmt(tot)} juta).`;
      const cfg = R(r, 0, 4);
      if (cfg === 0) return kdBuild(table, Q, `Keuntungan yang didapat dari Proyek A adalah Rp${fmt(kA)} Juta.`, `Total modal awal untuk kedua proyek tersebut adalah Rp${MA + m} Juta.`, 'B', ex + ' Pernyataan (1) hanya mengulang informasi tabel (jebakan), sedangkan (2) menentukan m.');
      if (cfg === 1) return kdBuild(table, Q, `Keuntungan yang didapat dari Proyek B adalah Rp${fmt(kB)} Juta.`, `Total modal awal untuk kedua proyek tersebut adalah Rp${MA + m} Juta.`, 'D', ex + ' Masing-masing pernyataan dapat menentukan m.');
      if (cfg === 2) return kdBuild(table, Q, `Total modal awal untuk kedua proyek tersebut adalah Rp${MA + m} Juta.`, 'Proyek A dan Proyek B dikelola oleh tim yang berbeda.', 'A', ex + ' Pernyataan (2) tidak relevan.');
      if (cfg === 3) return kdBuild(table, Q, `Modal Proyek B sama dengan dua kali modal Proyek C.`, `Modal Proyek C adalah Rp${fmt(m / 2)} Juta.`, 'C', ex + ' Kedua pernyataan harus digabung: m = 2 × ' + fmt(m / 2) + '.');
      return kdBuild(table, Q, `Modal Proyek B lebih ${m > MA ? 'besar' : 'kecil'} daripada modal Proyek A.`, 'Proyek B diselesaikan lebih cepat daripada Proyek A.', 'E', ex + ' Tidak ada pernyataan yang menentukan m secara tunggal.');
    },
    function timKerja(r) {
      for (let t = 0; t < 80; t++) {
        const nA = R(r, 3, 8), tA = R(r, 8, 15);
        const ns = []; for (let n = nA + 1; n <= nA * 3; n++) if ((nA * tA) % n === 0) ns.push(n);
        if (!ns.length) continue;
        const n = pick(r, ns), tB = nA * tA / n;
        const Lmax = Math.min(tA - 1, tB + pick(r, [-1, 0, 0, 1]));
        if (Lmax < 2) continue;
        const yes = tB <= Lmax;
        const table = tbl(['Tim Kerja', 'Jumlah Anggota', 'Waktu Selesai'], [['Tim Alpha', nA + ' orang', tA + ' hari'], ['Tim Beta', '<i>n</i> orang', '<i>t</i> hari']]);
        const Q = `Apakah Tim Beta mampu menyelesaikan pekerjaan yang sama dalam waktu maksimal ${Lmax} hari?`;
        const ex = `Jika kecepatan kerja identik: ${nA} × ${tA} = n × t. Dengan n = ${n}, t = ${tB} hari, sehingga jawabannya "${yes ? 'ya' : 'tidak'}".`;
        const cfg = R(r, 0, 4);
        if (cfg === 0) return kdBuild(table, Q, `Tim Beta beranggotakan ${n} orang pekerja.`, 'Setiap pekerja di Tim Alpha dan Tim Beta memiliki kecepatan kerja yang identik.', 'C', ex + ' Jumlah anggota saja tidak cukup tanpa asumsi kecepatan yang sama, dan sebaliknya.');
        if (cfg === 1) return kdBuild(table, Q, `Tim Beta menyelesaikan pekerjaan tersebut dalam ${tB} hari.`, 'Setiap pekerja di Tim Alpha dan Tim Beta memiliki kecepatan kerja yang identik.', 'A', `Pernyataan (1) langsung memberi t = ${tB} sehingga bisa dijawab "${yes ? 'ya' : 'tidak'}". Pernyataan (2) tanpa n tidak cukup.`);
        if (cfg === 2) return kdBuild(table, Q, `Tim Beta menyelesaikan pekerjaan tersebut dalam ${tB} hari.`, `Tim Beta menyelesaikan pekerjaan ${tA - tB} hari lebih cepat daripada Tim Alpha.`, 'D', `Masing-masing pernyataan menghasilkan t = ${tB} hari, sehingga pertanyaan bisa dijawab "${yes ? 'ya' : 'tidak'}".`);
        if (cfg === 3) return kdBuild(table, Q, 'Tim Beta beranggotakan lebih banyak orang daripada Tim Alpha.', `Tim Beta menyelesaikan pekerjaan ${tA - tB} hari lebih cepat daripada Tim Alpha.`, 'B', `Pernyataan (2) memberi t = ${tA} − ${tA - tB} = ${tB} hari. Pernyataan (1) tidak menentukan t.`);
        return kdBuild(table, Q, 'Tim Beta beranggotakan lebih banyak orang daripada Tim Alpha.', 'Setiap pekerja Tim Beta bekerja lebih cepat daripada pekerja Tim Alpha.', 'E', `Gabungan keduanya hanya memastikan t < ${tA} hari, belum tentu ≤ ${Lmax} hari.`);
      }
      return kdFamilies[0](r);
    },
    function usiaKD(r) {
      const [A, B, C] = shuffle(r, nama).slice(0, 3);
      const b = R(r, 6, 20), a = 2 * b, n = R(r, 2, 6), m = R(r, 2, 8);
      const Q = `${A} dan ${B} adalah kakak beradik. Berapakah usia ${A} sekarang?`;
      const cfg = R(r, 0, 4);
      if (cfg === 0) return kdBuild('', Q, `${n} tahun yang lalu usia ${A} adalah ${a - n} tahun.`, `${A} lebih tua daripada ${B}.`, 'A', `Dari (1): usia ${A} = ${a - n} + ${n} = ${a} tahun. Pernyataan (2) tidak memberi nilai.`);
      if (cfg === 1) return kdBuild('', Q, `Usia ${A} dua kali usia ${B}.`, `Jumlah usia ${A} dan ${B} adalah ${a + b} tahun.`, 'C', `Gabungan: ${A} = 2${B}, ${A} + ${B} = ${a + b} ⇒ ${B} = ${b}, ${A} = ${a} tahun.`);
      if (cfg === 2) return kdBuild('', Q, `${n} tahun yang lalu usia ${A} adalah ${a - n} tahun.`, `${m} tahun yang akan datang usia ${A} menjadi ${a + m} tahun.`, 'D', `Masing-masing pernyataan langsung memberi usia ${A} = ${a} tahun.`);
      if (cfg === 3) return kdBuild('', Q, `Usia ${A} dua kali usia ${B}.`, `Tahun depan usia ${A} genap ${a + 1} tahun.`, 'B', `Pernyataan (2): usia ${A} = ${a} tahun. Pernyataan (1) hanya perbandingan.`);
      return kdBuild('', Q, `Usia ${A} dua kali usia ${B}.`, `Selisih usia ${A} dan ${C} adalah ${R(r, 2, 6)} tahun.`, 'E', 'Tidak ada informasi bernilai mutlak yang mengikat usia ' + A + '.');
    },
    function hargaKD(r) {
      const b = R(r, 6, 16) * 500, p = R(r, 3, Math.floor(b / 500) - 1) * 500;
      const [it1, it2] = pick(r, [['buku tulis', 'pensil'], ['map plastik', 'spidol'], ['kopi sachet', 'teh celup'], ['roti', 'susu kotak']]);
      const Q = `Berapakah harga satu ${it1}?`;
      const cfg = R(r, 0, 4);
      if (cfg === 0) return kdBuild('', Q, `Harga 2 ${it1} dan 3 ${it2} adalah ${rp(2 * b + 3 * p)}.`, `Harga 1 ${it1} dan 1 ${it2} adalah ${rp(b + p)}.`, 'C', `Eliminasi: (2b + 3p) − 2(b + p) = p = ${rp(p)}, maka b = ${rp(b)}. Satu pernyataan saja memuat dua variabel.`);
      if (cfg === 1) return kdBuild('', Q, `Harga 2 ${it1} dan 2 ${it2} adalah ${rp(2 * (b + p))}.`, `Harga 1 ${it1} dan 1 ${it2} adalah ${rp(b + p)}.`, 'E', 'Pernyataan (1) adalah kelipatan pernyataan (2) (persamaan yang sama), sehingga b tidak dapat ditentukan.');
      if (cfg === 2) return kdBuild('', Q, `Harga 3 ${it1} adalah ${rp(3 * b)}.`, `Harga ${it2} lebih murah daripada ${it1}.`, 'A', `Dari (1): b = ${rp(3 * b)} ÷ 3 = ${rp(b)}.`);
      if (cfg === 3) return kdBuild('', Q, `Harga 3 ${it1} adalah ${rp(3 * b)}.`, `Harga 1 ${it1} dan 1 ${it2} adalah ${rp(b + p)}, sedangkan harga 1 ${it2} adalah ${rp(p)}.`, 'D', `Masing-masing pernyataan menghasilkan b = ${rp(b)}.`);
      return kdBuild('', Q, `Harga ${it1} ${rp(b - p)} lebih mahal daripada harga ${it2}.`, `Harga 2 lusin ${it1} adalah ${rp(24 * b)}.`, 'B', `Dari (2): b = ${rp(24 * b)} ÷ 24 = ${rp(b)}. Pernyataan (1) memuat dua variabel.`);
    },
    function nilaiKD(r) {
      const names = shuffle(r, nama).slice(0, 5);
      const x = R(r, 60, 98);
      const others = [R(r, 60, 95), R(r, 60, 95), R(r, 60, 95), R(r, 60, 95)];
      let sum = x + others.reduce((s, v) => s + v, 0);
      while (sum % 5) { others[0]++; sum++; }
      const avg = sum / 5;
      const dina = others[3];
      const table = tbl(['Peserta', 'Nilai'], [[names[0], '<i>x</i>'], [names[1], others[0]], [names[2], others[1]], [names[3], others[2]], [names[4], dina]]);
      const Q = `Berapakah nilai <i>x</i> yang diperoleh ${names[0]}?`;
      const cfg = R(r, 0, 4);
      if (cfg === 0) return kdBuild(table, Q, `Rata-rata nilai kelima peserta adalah ${avg}.`, `${names[0]} memperoleh nilai tertinggi.`, 'A', `Dari (1): x = 5 × ${avg} − ${sum - x} = ${x}.`);
      if (cfg === 1) return kdBuild(table, Q, `Nilai ${names[0]} di atas rata-rata kelompok.`, `Jumlah nilai seluruh peserta adalah ${sum}.`, 'B', `Dari (2): x = ${sum} − ${sum - x} = ${x}.`);
      if (cfg === 2) return kdBuild(table, Q, `Rata-rata nilai kelima peserta adalah ${avg}.`, `Jumlah nilai seluruh peserta adalah ${sum}.`, 'D', `Masing-masing pernyataan menghasilkan x = ${x}.`);
      if (cfg === 3) {
        const xx = x === dina ? dina + 5 : x;
        return kdBuild(table, Q, `Selisih nilai ${names[0]} dan ${names[4]} adalah ${Math.abs(xx - dina)}.`, `Nilai ${names[0]} ${xx > dina ? 'lebih tinggi' : 'lebih rendah'} daripada nilai ${names[4]}.`, 'C', `Pernyataan (1) memberi dua kemungkinan (${dina} ± ${Math.abs(xx - dina)}); pernyataan (2) menentukan arahnya sehingga x = ${xx}.`);
      }
      const d2 = pick(r, [2, 4, 6]);
      return kdBuild(table, Q, `Selisih nilai ${names[0]} dan ${names[4]} adalah ${d2}.`, `Nilai ${names[0]} merupakan bilangan ${dina % 2 ? 'ganjil' : 'genap'}.`, 'E', `Kemungkinan x = ${dina - d2} atau ${dina + d2}; keduanya sama-sama ${dina % 2 ? 'ganjil' : 'genap'}, sehingga pernyataan (2) tidak membantu memilih.`);
    }
    ,function jarakKD(r) {
      const [A, B] = pick(r, [['Mobil A', 'Mobil B'], ['Bus P', 'Bus Q'], ['Kereta X', 'Kereta Y'], ['Truk 1', 'Truk 2']]);
      const a = pick(r, [40, 50, 60, 70, 80]), tA = R(r, 2, 4), tB = R(r, 2, 4), d = pick(r, [10, 20]);
      const v = a + d, D = v * tB, DA = a * tA;
      if (D === DA) return jarakKD(r);
      const table = tbl(['Kendaraan', 'Kecepatan', 'Waktu Tempuh'], [[A, a + ' km/jam', tA + ' jam'], [B, '<i>v</i> km/jam', tB + ' jam']]);
      const Q = `Berapakah jarak yang ditempuh ${B}?`;
      const ex = `Jarak ${B} = v × ${tB}; yang dibutuhkan adalah nilai v (v = ${v}, jarak = ${D} km).`;
      const cmp = `${B} melaju lebih cepat daripada ${A}.`, junk = `${B} mengangkut muatan lebih berat daripada ${A}.`;
      const diff = D - DA;
      const dist = `Jarak yang ditempuh ${B} ${diff > 0 ? 'lebih jauh' : 'lebih dekat'} ${Math.abs(diff)} km daripada ${A}.`;
      const cfg = R(r, 0, 4);
      if (cfg === 0) return kdBuild(table, Q, `Kecepatan ${B} adalah ${v} km/jam.`, junk, 'A', ex + ' Pernyataan (1) memberi v langsung; (2) tidak berkaitan dengan jarak.');
      if (cfg === 1) return kdBuild(table, Q, junk, dist, 'B', `Jarak ${A} = ${a} × ${tA} = ${DA} km, sehingga dari (2) jarak ${B} = ${DA} ${diff > 0 ? '+' : '−'} ${Math.abs(diff)} = ${D} km. Pernyataan (1) tidak membantu.`);
      if (cfg === 2) return kdBuild(table, Q, cmp, `Selisih kecepatan ${A} dan ${B} adalah ${d} km/jam.`, 'C', ex + ` Sendiri-sendiri tidak cukup: (1) hanya perbandingan, (2) memberi dua kemungkinan v (${a - d} atau ${a + d}); bersama-sama v = ${a} + ${d} = ${v}.`);
      if (cfg === 3) return kdBuild(table, Q, `Kecepatan ${B} adalah ${v} km/jam.`, `Kecepatan ${B} lebih tinggi ${d} km/jam daripada ${A}.`, 'D', ex + ' Masing-masing pernyataan menentukan v.');
      return kdBuild(table, Q, cmp, junk, 'E', ex + ' Hanya diketahui B lebih cepat; nilai v tidak dapat dipastikan.');
    },
    function diskonKD(r) {
      const [P, Qn] = pick(r, [['Sepatu', 'Tas'], ['Kemeja', 'Celana'], ['Printer', 'Pemindai'], ['Meja', 'Kursi']]);
      const hp = R(r, 2, 8) * 50, dp = pick(r, [10, 20, 25]);
      const dq = pick(r, [10, 20, 25, 50]);
      const unit = dq === 25 ? 4 : dq === 50 ? 2 : 10; // agar hasil bulat
      const hq = Math.max(unit * 10, Math.round(R(r, 100, 500) / (unit * 10)) * unit * 10);
      if (hq === hp) return diskonKD(r); // perbandingan harga harus tegas
      const paidP = hp * (100 - dp) / 100, paidQ = hq * (100 - dq) / 100, total = paidP + paidQ;
      const table = tbl(['Barang', 'Harga Awal', 'Diskon'], [[P, 'Rp' + hp + ' ribu', dp + '%'], [Qn, 'Rp<i>h</i> ribu', dq + '%']]);
      const Q = `Berapakah total yang harus dibayar untuk kedua barang setelah diskon?`;
      const ex = `Total = Rp${fmt(paidP)} ribu + ${100 - dq}% × h; perlu nilai h (h = ${hq}, total = Rp${fmt(total)} ribu).`;
      const cfg = R(r, 0, 4);
      if (cfg === 0) return kdBuild(table, Q, `Harga ${Qn} setelah diskon adalah Rp${fmt(paidQ)} ribu.`, `${Qn} ${hq > hp ? 'lebih mahal' : 'lebih murah'} daripada ${P} sebelum diskon.`, 'A', ex + ' Dari (1) diperoleh harga bayar langsung; (2) hanya perbandingan.');
      if (cfg === 1) return kdBuild(table, Q, `${Qn} dibeli di toko yang sama dengan ${P}.`, `Total harga awal kedua barang adalah Rp${fmt(hp + hq)} ribu.`, 'B', ex + ` Dari (2): h = ${fmt(hp + hq)} − ${hp} = ${hq}. Pernyataan (1) tidak relevan.`);
      if (cfg === 2) return kdBuild(table, Q, `Harga awal ${Qn} adalah Rp${fmt(hq)} ribu.`, `Total harga awal kedua barang adalah Rp${fmt(hp + hq)} ribu.`, 'D', ex + ' Masing-masing pernyataan menentukan h.');
      if (cfg === 3) return kdBuild(table, Q, `Harga awal ${Qn} dua kali harga awal Barang R.`, `Harga awal Barang R adalah Rp${fmt(hq / 2)} ribu.`, 'C', ex + ` Gabungan: h = 2 × ${fmt(hq / 2)} = ${hq}. Satu pernyataan saja tidak cukup.`);
      return kdBuild(table, Q, `${Qn} dibeli di toko yang sama dengan ${P}.`, 'Diskon berlaku sampai akhir bulan.', 'E', ex + ' Tidak ada informasi tentang nilai h.');
    },
    function luasKD(r) {
      const [P, Qn] = pick(r, [['Bidang P', 'Bidang Q'], ['Kebun A', 'Kebun B'], ['Ruang 1', 'Ruang 2'], ['Lahan X', 'Lahan Y']]);
      const lp = R(r, 4, 12), pp = lp + R(r, 2, 8), lq = R(r, 3, 12), pq = lp + R(r, 2, 9);
      const L = pq * lq, K = 2 * (pq + lq), dsel = pq - pp;
      if (dsel === 0) return luasKD(r);
      const table = tbl(['Bangun', 'Panjang (m)', 'Lebar (m)'], [[P, pp, lp], [Qn, '<i>q</i>', lq]]);
      const Q = `Berapakah luas ${Qn}?`;
      const ex = `Luas ${Qn} = q × ${lq}; perlu nilai q (q = ${pq}, luas = ${L} m²).`;
      const rel = `Panjang ${Qn} sama dengan lebar ${P} ditambah ${pq - lp} m.`;
      const trivial = `${Qn} berbentuk persegi panjang.`;
      const cfg = R(r, 0, 4);
      if (cfg === 0) return kdBuild(table, Q, `Keliling ${Qn} adalah ${K} m.`, trivial, 'A', ex + ` Dari (1): q = ${K}/2 − ${lq} = ${pq}. Pernyataan (2) sudah diketahui dari tabel.`);
      if (cfg === 1) return kdBuild(table, Q, `${Qn} lebih lebar daripada ${P}.`.replace('lebih lebar', lq > lp ? 'lebih lebar' : 'tidak lebih lebar'), rel, 'B', ex + ` Dari (2): q = ${lp} + ${pq - lp} = ${pq}. Pernyataan (1) hanya perbandingan lebar.`);
      if (cfg === 2) return kdBuild(table, Q, `Keliling ${Qn} adalah ${K} m.`, rel, 'D', ex + ' Masing-masing pernyataan menentukan q.');
      if (cfg === 3) return kdBuild(table, Q, `${Qn} lebih panjang daripada ${P}.`.replace('lebih panjang', dsel > 0 ? 'lebih panjang' : 'lebih pendek'), `Selisih panjang ${Qn} dan ${P} adalah ${Math.abs(dsel)} m.`, 'C', ex + ` (1) hanya arah dan (2) memberi dua kemungkinan q (${pp - Math.abs(dsel)} atau ${pp + Math.abs(dsel)}); bersama-sama q = ${pq}.`);
      return kdBuild(table, Q, trivial, `${Qn} dikelilingi pagar berwarna putih.`, 'E', ex + ' Tidak ada informasi yang menentukan q.');
    }
  ];
  function kecukupan(r, i) { return kdFamilies[i % kdFamilies.length](r); }

  bank.register({ key: 'tiu-deret', cat: 'TIU', group: 'num-deret', label: 'Deret Angka', count: 450, make: deret });
  bank.register({ key: 'tiu-tabel1', cat: 'TIU', group: 'num-tabel', label: 'Pola Bilangan Tabel Tipe I', count: 700, make: polaTabel1 });
  bank.register({ key: 'tiu-tabel2', cat: 'TIU', group: 'num-tabel', label: 'Pola Bilangan Tabel Tipe II', count: 700, make: polaTabel2 });
  bank.register({ key: 'tiu-cerita', cat: 'TIU', group: 'num-cerita', label: 'Soal Cerita (Aritmetika)', count: 520, make: soalCerita });
  bank.register({ key: 'tiu-kecukupan', cat: 'TIU', group: 'num-kecukupan', label: 'Kecukupan Pernyataan', count: 630, make: kecukupan });
})(typeof window !== 'undefined' ? window : globalThis);
