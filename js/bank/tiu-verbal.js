/* TIU Verbal: penalaran logis (silogisme & logika proposisi), analitis (diverifikasi brute-force), analogi. */
(function (root) {
  'use strict';
  const { util, bank } = root.CPNS;
  const { ri, pick, shuffle } = util;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ============ SILOGISME & LOGIKA ============ */
  const groups = ['pegawai Dinas Pendidikan', 'peserta pelatihan dasar CPNS', 'guru penggerak', 'atlet pelatnas', 'mahasiswa kedokteran',
    'anggota koperasi Sejahtera', 'petani di Desa Sukamaju', 'penerima beasiswa unggulan', 'siswa kelas XII', 'pelari maraton',
    'pengusaha muda binaan', 'relawan tanggap bencana', 'pustakawan kota', 'perawat RSUD', 'anggota paduan suara', 'pegawai kantor kecamatan',
    'peserta lomba debat', 'pengemudi ojek daring', 'nelayan Pantai Utara', 'anggota pramuka penegak'];
  const props = ['gemar membaca', 'memiliki SIM', 'mengikuti apel pagi', 'menguasai bahasa Inggris', 'menggunakan transportasi umum',
    'rajin berolahraga', 'membawa bekal makan siang', 'menerima tunjangan kinerja', 'bekerja di kantor pusat', 'datang sebelum pukul 07.00',
    'memiliki sertifikat pendidik', 'mengikuti asuransi kesehatan', 'tinggal di asrama', 'menyukai musik klasik', 'mahir mengoperasikan komputer',
    'pernah mengikuti pelatihan P3K', 'menabung setiap bulan', 'berlangganan surat kabar'];
  const orang = ['Andi', 'Bima', 'Citra', 'Dian', 'Erlangga', 'Farah', 'Galih', 'Hani', 'Indra', 'Juwita'];
  const clauses = [
    ['jalan raya macet', 'jalan raya tidak macet'], ['hujan turun deras', 'hujan tidak turun deras'], ['Rina lulus ujian', 'Rina tidak lulus ujian'],
    ['anggaran kegiatan disetujui', 'anggaran kegiatan tidak disetujui'], ['proyek selesai tepat waktu', 'proyek tidak selesai tepat waktu'],
    ['harga cabai naik', 'harga cabai tidak naik'], ['Pak Dodi berangkat pagi', 'Pak Dodi tidak berangkat pagi'],
    ['rapat koordinasi ditunda', 'rapat koordinasi tidak ditunda'], ['listrik padam', 'listrik tidak padam'],
    ['nilai ekspor meningkat', 'nilai ekspor tidak meningkat'], ['kantor memberlakukan kerja dari rumah', 'kantor tidak memberlakukan kerja dari rumah'],
    ['Budi mendapat promosi', 'Budi tidak mendapat promosi'], ['aplikasi layanan diperbarui', 'aplikasi layanan tidak diperbarui'],
    ['petani panen raya', 'petani tidak panen raya'], ['sungai meluap', 'sungai tidak meluap'], ['siswa mengerjakan tugas', 'siswa tidak mengerjakan tugas'],
    ['target penjualan tercapai', 'target penjualan tidak tercapai'], ['pelatihan dilaksanakan daring', 'pelatihan tidak dilaksanakan daring'],
    ['Sinta membawa payung', 'Sinta tidak membawa payung'], ['pasokan beras lancar', 'pasokan beras tidak lancar']
  ];
  const TDK = 'Tidak dapat ditarik kesimpulan yang pasti.';

  const logikaTpl = [
    (r) => { const [N1, N2] = shuffle(r, groups), [P] = shuffle(r, props);
      return { p: [`Semua ${N1} ${P}.`, `Sebagian ${N2} adalah ${N1}.`], o: [`Sebagian ${N2} ${P}.`, `Semua ${N2} ${P}.`, `Tidak ada ${N2} yang ${P}.`, `Semua orang yang ${P} adalah ${N1}.`, `Sebagian ${N1} tidak ${P}.`],
        e: `Bagian ${N2} yang termasuk ${N1} pasti ${P}, sehingga sebagian ${N2} ${P}.` }; },
    (r) => { const [N1] = shuffle(r, groups), [P1, P2] = shuffle(r, props);
      return { p: [`Semua ${N1} ${P1}.`, `Semua orang yang ${P1} juga ${P2}.`], o: [`Semua ${N1} ${P2}.`, `Semua orang yang ${P2} adalah ${N1}.`, `Sebagian ${N1} tidak ${P2}.`, `Semua orang yang ${P1} adalah ${N1}.`, `Tidak ada ${N1} yang ${P2}.`],
        e: `Rantai himpunan: ${N1} ⊂ (yang ${P1}) ⊂ (yang ${P2}). Maka semua ${N1} ${P2}.` }; },
    (r) => { const [N1, N2] = shuffle(r, groups), [P] = shuffle(r, props);
      return { p: [`Tidak ada ${N1} yang ${P}.`, `Sebagian ${N2} adalah ${N1}.`], o: [`Sebagian ${N2} tidak ${P}.`, `Semua ${N2} tidak ${P}.`, `Sebagian ${N2} ${P}.`, `Tidak ada ${N2} yang ${P}.`, `Semua ${N2} ${P}.`],
        e: `Sebagian ${N2} yang termasuk ${N1} pasti tidak ${P}. Tentang ${N2} lainnya tidak diketahui.` }; },
    (r) => { const [N1] = shuffle(r, groups), [P] = shuffle(r, props), X = pick(r, orang);
      return { p: [`Semua ${N1} ${P}.`, `${X} tidak ${P}.`], o: [`${X} bukan ${N1}.`, `${X} adalah ${N1}.`, `${X} ${P}.`, `Sebagian ${N1} tidak ${P}.`, TDK],
        e: `Modus tollens: jika ${X} termasuk ${N1}, ia pasti ${P}. Karena ${X} tidak ${P}, maka ${X} bukan ${N1}.` }; },
    (r) => { const [N1] = shuffle(r, groups), [P] = shuffle(r, props), X = pick(r, orang);
      return { p: [`Semua ${N1} ${P}.`, `${X} ${P}.`], o: [`Belum tentu ${X} termasuk ${N1}.`, `${X} adalah ${N1}.`, `${X} bukan ${N1}.`, `Semua orang yang ${P} adalah ${N1}.`, `${X} tidak ${P}.`],
        e: `Yang ${P} tidak hanya ${N1}. Mengakui akibat (affirming the consequent) adalah kesalahan logika, sehingga ${X} belum tentu ${N1}.` }; },
    (r) => { const [N1] = shuffle(r, groups), [P1, P2] = shuffle(r, props);
      return { p: [`Semua ${N1} ${P1}.`, `Sebagian ${N1} ${P2}.`], o: [`Sebagian orang yang ${P2} juga ${P1}.`, `Semua orang yang ${P2} juga ${P1}.`, `Semua ${N1} ${P2}.`, `Sebagian orang yang ${P1} tidak ${P2}.`, `Tidak ada orang yang ${P2} sekaligus ${P1}.`],
        e: `${N1} yang ${P2} pasti juga ${P1}, sehingga ada (sebagian) orang yang ${P2} dan ${P1}.` }; },
    (r) => { const [a, b] = shuffle(r, clauses);
      return { p: [`Jika ${a[0]}, maka ${b[0]}.`, `${cap(a[0])}.`], o: [`${cap(b[0])}.`, `${cap(b[1])}.`, `${cap(a[1])}.`, `Jika ${b[0]}, maka ${a[0]}.`, TDK],
        e: 'Modus ponens: p → q, p, ∴ q.' }; },
    (r) => { const [a, b] = shuffle(r, clauses);
      return { p: [`Jika ${a[0]}, maka ${b[0]}.`, `${cap(b[1])}.`], o: [`${cap(a[1])}.`, `${cap(a[0])}.`, `${cap(b[0])}.`, `Jika ${a[1]}, maka ${b[1]}.`, TDK],
        e: 'Modus tollens: p → q, ~q, ∴ ~p.' }; },
    (r) => { const [a, b, c] = shuffle(r, clauses);
      return { p: [`Jika ${a[0]}, maka ${b[0]}.`, `Jika ${b[0]}, maka ${c[0]}.`], o: [`Jika ${a[0]}, maka ${c[0]}.`, `Jika ${c[0]}, maka ${a[0]}.`, `Jika ${a[1]}, maka ${c[1]}.`, `${cap(a[0])} dan ${c[1]}.`, `Jika ${c[1]}, maka ${a[0]}.`],
        e: 'Silogisme hipotetis: p → q, q → r, ∴ p → r.' }; },
    (r) => { const [a, b] = shuffle(r, clauses);
      return { p: [`${cap(a[0])} atau ${b[0]}.`, `${cap(a[1])}.`], o: [`${cap(b[0])}.`, `${cap(b[1])}.`, `${cap(a[0])}.`, `${cap(a[0])} dan ${b[0]}.`, TDK],
        e: 'Silogisme disjungtif: p ∨ q, ~p, ∴ q.' }; },
    (r) => { const [a, b, c] = shuffle(r, clauses);
      return { p: [`Jika ${a[0]}, maka ${b[0]}.`, `Jika ${b[0]}, maka ${c[0]}.`, `${cap(c[1])}.`], o: [`${cap(a[1])}.`, `${cap(a[0])}.`, `${cap(b[0])}.`, `${cap(c[0])}.`, `${cap(a[0])} dan ${b[1]}.`],
        e: 'p → q → r, dan ~r. Modus tollens dua kali: ~r ⇒ ~q ⇒ ~p.' }; },
    (r) => { const [a, b] = shuffle(r, clauses);
      return { stem: `Ingkaran dari pernyataan "Jika ${a[0]}, maka ${b[0]}" adalah ….`, o: [`${cap(a[0])} dan ${b[1]}.`, `Jika ${a[1]}, maka ${b[1]}.`, `Jika ${a[0]}, maka ${b[1]}.`, `${cap(a[1])} dan ${b[0]}.`, `${cap(a[1])} atau ${b[0]}.`],
        e: '~(p → q) ≡ p ∧ ~q. Pilihan "~p atau q" justru setara (bukan ingkaran) dengan p → q.' }; },
    (r) => { const [a, b] = shuffle(r, clauses);
      return { stem: `Pernyataan yang setara (ekuivalen) dengan "Jika ${a[0]}, maka ${b[0]}" adalah ….`, o: [`Jika ${b[1]}, maka ${a[1]}.`, `Jika ${b[0]}, maka ${a[0]}.`, `Jika ${a[1]}, maka ${b[1]}.`, `${cap(a[0])} dan ${b[1]}.`, `Jika ${b[1]}, maka ${a[0]}.`],
        e: 'Kontraposisi: p → q ≡ ~q → ~p. Konvers (q → p) dan invers (~p → ~q) tidak setara.' }; },
    (r) => { const [a, b] = shuffle(r, clauses);
      return { p: [`Jika ${a[0]}, maka ${b[0]}.`, `${cap(b[0])}.`], o: [TDK, `${cap(a[0])}.`, `${cap(a[1])}.`, `${cap(b[1])}.`, `Jika ${b[0]}, maka ${a[0]}.`],
        e: 'Pola p → q dan q tidak sah untuk menyimpulkan p (kesalahan mengakui akibat), juga tidak dapat menyimpulkan ~p.' }; },
    (r) => { const [N1] = shuffle(r, groups), [P] = shuffle(r, props);
      return { stem: `Ingkaran dari pernyataan "Semua ${N1} ${P}" adalah ….`, o: [`Ada ${N1} yang tidak ${P}.`, `Semua ${N1} tidak ${P}.`, `Tidak ada ${N1} yang ${P}.`, `Ada ${N1} yang ${P}.`, `Semua orang yang tidak ${P} bukan ${N1}.`],
        e: '~(∀x P(x)) ≡ ∃x ~P(x): "ada/beberapa ... yang tidak ...".' }; },
    (r) => { const [a, b] = shuffle(r, clauses);
      return { stem: `Ingkaran dari pernyataan "${cap(a[0])} dan ${b[0]}" adalah ….`, o: [`${cap(a[1])} atau ${b[1]}.`, `${cap(a[1])} dan ${b[1]}.`, `${cap(a[1])} dan ${b[0]}.`, `${cap(a[0])} atau ${b[0]}.`, `Jika ${a[1]}, maka ${b[1]}.`],
        e: 'Hukum De Morgan: ~(p ∧ q) ≡ ~p ∨ ~q.' }; }
  ];
  function logika(r, i) {
    const t = logikaTpl[i % logikaTpl.length](r);
    const q = t.stem ? t.stem : `<div class="premis">${t.p.map((s, k) => `<div>Premis ${k + 1}: ${s}</div>`).join('')}</div>Kesimpulan yang paling tepat adalah ….`;
    return { q, o: t.o, e: t.e };
  }

  /* ============ ANALITIS (urutan / posisi duduk) ============ */
  const namaA = ['Ani', 'Beni', 'Cika', 'Dodi', 'Euis', 'Fikri', 'Gina', 'Hadi', 'Intan', 'Jaka'];
  const PERMS5 = (function () {
    const out = [];
    const rec = (a, rest) => { if (!rest.length) { out.push(a); return; } rest.forEach((x, k) => rec(a.concat(x), rest.filter((_, j) => j !== k))); };
    rec([], [0, 1, 2, 3, 4]);
    return out; // perm[p] = posisi orang p
  })();

  function seatingClues(pos, N) {
    const C = [];
    for (let x = 0; x < 5; x++) {
      if (pos[x] === 0) C.push({ t: 'L0', x, s: `${N[x]} duduk di kursi paling kiri.`, f: p => p[x] === 0 });
      if (pos[x] === 4) C.push({ t: 'R4', x, s: `${N[x]} duduk di kursi paling kanan.`, f: p => p[x] === 4 });
      if (pos[x] === 2) C.push({ t: 'M', x, s: `${N[x]} duduk di kursi tengah.`, f: p => p[x] === 2 });
      if (pos[x] > 0 && pos[x] < 4) C.push({ t: 'NE', x, s: `${N[x]} tidak duduk di kursi paling ujung.`, f: p => p[x] > 0 && p[x] < 4 });
      for (let y = 0; y < 5; y++) {
        if (x === y) continue;
        if (pos[x] === pos[y] - 1) C.push({ t: 'IL', x, y, s: `${N[x]} duduk tepat di sebelah kiri ${N[y]}.`, f: p => p[x] === p[y] - 1 });
        if (pos[x] > pos[y] && x < y) C.push({ t: 'RF', x, y, s: `${N[x]} duduk di sebelah kanan ${N[y]}, tetapi tidak harus bersebelahan.`, f: p => p[x] > p[y] });
        if (Math.abs(pos[x] - pos[y]) > 1 && x < y) C.push({ t: 'NA', x, y, s: `${N[x]} tidak duduk bersebelahan dengan ${N[y]}.`, f: p => Math.abs(p[x] - p[y]) > 1 });
        for (let z = y + 1; z < 5; z++) {
          if (z === x) continue;
          if (Math.abs(pos[x] - pos[y]) === 1 && Math.abs(pos[x] - pos[z]) === 1) C.push({ t: 'BT', x, y, z, s: `${N[x]} duduk di antara ${N[y]} dan ${N[z]}.`, f: p => Math.abs(p[x] - p[y]) === 1 && Math.abs(p[x] - p[z]) === 1 });
        }
      }
    }
    return C;
  }
  function rankClues(pos, N, ctx, r) {
    // pos[x] = peringkat (0 = paling atas)
    const C = [];
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        if (x === y || pos[x] >= pos[y]) continue;
        if (r() < 0.6) C.push({ s: `${N[x]} ${ctx.gt} ${N[y]}.`, f: p => p[x] < p[y] });
        else C.push({ s: `${N[y]} ${ctx.lt} ${N[x]}.`, f: p => p[x] < p[y] });
      }
      if (pos[x] !== 0) C.push({ s: `${N[x]} bukan yang ${ctx.top}.`, f: p => p[x] !== 0 });
      if (pos[x] !== 4) C.push({ s: `${N[x]} bukan yang ${ctx.bottom}.`, f: p => p[x] !== 4 });
    }
    return C;
  }

  function solveUntil(r, clues, answerOf, forbid) {
    const pool = shuffle(r, clues.filter(c => !forbid(c)));
    const chosen = [];
    let cands = PERMS5;
    for (const c of pool) {
      const next = cands.filter(c.f);
      if (next.length === cands.length) continue;
      chosen.push(c);
      cands = next;
      const ans = new Set(cands.map(answerOf));
      if (ans.size === 1) break;
    }
    if (new Set(cands.map(answerOf)).size !== 1) return null;
    // minimalkan
    for (let k = chosen.length - 1; k >= 0; k--) {
      const trial = chosen.filter((_, j) => j !== k);
      const cs = PERMS5.filter(p => trial.every(c => c.f(p)));
      if (new Set(cs.map(answerOf)).size === 1) chosen.splice(k, 1);
    }
    const final = PERMS5.filter(p => chosen.every(c => c.f(p)));
    return { clues: chosen, cands: final };
  }

  function analitis(r, i) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const N = shuffle(r, namaA).slice(0, 5);
      const pos = shuffle(r, [0, 1, 2, 3, 4]);
      if (i % 2 === 0) {
        // posisi duduk
        const qt = ri(r, 0, 3);
        let ask, answerOf, forbid, correct;
        if (qt === 0) { ask = 'Siapakah yang duduk di kursi tengah?'; answerOf = p => p.indexOf(2); forbid = c => c.t === 'M'; correct = pos.indexOf(2); }
        else if (qt === 1) { ask = 'Siapakah yang duduk di kursi paling kanan?'; answerOf = p => p.indexOf(4); forbid = c => c.t === 'R4'; correct = pos.indexOf(4); }
        else if (qt === 2) { ask = 'Siapakah yang duduk di kursi paling kiri?'; answerOf = p => p.indexOf(0); forbid = c => c.t === 'L0'; correct = pos.indexOf(0); }
        else {
          const anchor = pos.indexOf(ri(r, 0, 3));
          ask = `Siapakah yang duduk tepat di sebelah kanan ${N[anchor]}?`;
          answerOf = p => p.indexOf(p[anchor] + 1);
          forbid = c => c.t === 'IL' && c.x === anchor;
          correct = pos.indexOf(pos[anchor] + 1);
        }
        const res = solveUntil(r, seatingClues(pos, N), answerOf, forbid);
        if (!res || res.clues.length < 3 || res.clues.length > 6) continue;
        const intro = `Lima orang, yaitu ${N.slice(0, 4).join(', ')}, dan ${N[4]}, duduk berjajar menghadap ke depan pada lima kursi. Ketentuannya:`;
        return {
          q: `<p>${intro}</p><ul class="clues">${res.clues.map(c => `<li>${c.s}</li>`).join('')}</ul><p>${ask}</p>`,
          o: [N[correct]].concat(shuffle(r, N.filter((_, k) => k !== correct))),
          e: `Susunan yang memenuhi semua ketentuan (kiri → kanan): ${res.cands.slice(0, 2).map(p => [0, 1, 2, 3, 4].map(k => N[p.indexOf(k)]).join(' – ')).join(' atau ')}. Pada ${res.cands.length > 1 ? 'setiap kemungkinan' : 'susunan tersebut'}, jawabannya ${N[correct]}.`
        };
      }
      // peringkat
      const ctx = pick(r, [
        { gt: 'lebih tinggi daripada', lt: 'lebih pendek daripada', top: 'paling tinggi', bottom: 'paling pendek', ord: k => k === 1 ? 'paling tinggi' : `tertinggi ke-${k}`, intro: 'Lima orang sahabat dibandingkan tinggi badannya' },
        { gt: 'memperoleh nilai lebih tinggi daripada', lt: 'memperoleh nilai lebih rendah daripada', top: 'bernilai tertinggi', bottom: 'bernilai terendah', ord: k => k === 1 ? 'memperoleh nilai tertinggi' : `memperoleh nilai tertinggi ke-${k}`, intro: 'Lima peserta seleksi mengikuti tes tertulis dan nilainya berbeda-beda' },
        { gt: 'datang lebih awal daripada', lt: 'datang lebih akhir daripada', top: 'datang paling awal', bottom: 'datang paling akhir', ord: k => k === 1 ? 'datang paling awal' : `datang pada urutan ke-${k}`, intro: 'Lima pegawai datang ke kantor pada waktu yang berbeda-beda' },
        { gt: 'lebih tua daripada', lt: 'lebih muda daripada', top: 'paling tua', bottom: 'paling muda', ord: k => k === 1 ? 'paling tua' : `tertua ke-${k}`, intro: 'Lima bersaudara memiliki usia yang berbeda-beda' }
      ]);
      const k = ri(r, 1, 5);
      const answerOf = p => p.indexOf(k - 1);
      const correct = pos.indexOf(k - 1);
      const res = solveUntil(r, rankClues(pos, N, ctx, r), answerOf, () => false);
      if (!res || res.clues.length < 3 || res.clues.length > 7) continue;
      return {
        q: `<p>${ctx.intro}. Diketahui:</p><ul class="clues">${res.clues.map(c => `<li>${c.s}</li>`).join('')}</ul><p>Siapakah yang ${ctx.ord(k)}?</p>`,
        o: [N[correct]].concat(shuffle(r, N.filter((_, j) => j !== correct))),
        e: `Urutan yang memenuhi (dari yang ${ctx.top}): ${res.cands.slice(0, 2).map(p => [0, 1, 2, 3, 4].map(j => N[p.indexOf(j)]).join(' – ')).join(' atau ')}. Urutan ke-${k} selalu ${N[correct]}.`
      };
    }
    return logika(r, i);
  }

  /* ============ ANALOGI ============ */
  // fam: relasi yang mirip tidak boleh menjadi pengecoh satu sama lain
  const REL = [
    { fam: 'profesi', sym: false, n: 'profesi dan alat kerjanya', p: [['petani', 'cangkul'], ['pelukis', 'kuas'], ['dokter', 'stetoskop'], ['nelayan', 'jala'], ['fotografer', 'kamera'], ['tukang kayu', 'gergaji'], ['penjahit', 'jarum'], ['montir', 'kunci pas']] },
    { fam: 'profesi', sym: false, n: 'pembuat dan karyanya', p: [['penyair', 'puisi'], ['komponis', 'lagu'], ['pematung', 'patung'], ['novelis', 'novel'], ['sutradara', 'film'], ['koreografer', 'tarian'], ['arsitek', 'rancangan bangunan']] },
    { fam: 'profesi', sym: false, n: 'pengemudi dan kendaraannya', p: [['pilot', 'pesawat'], ['masinis', 'kereta api'], ['nakhoda', 'kapal'], ['kusir', 'delman'], ['joki', 'kuda pacu'], ['sopir', 'bus']] },
    { fam: 'profesi', sym: false, n: 'profesi dan tempat kerjanya', p: [['hakim', 'pengadilan'], ['guru', 'sekolah'], ['koki', 'dapur'], ['petani', 'sawah'], ['pustakawan', 'perpustakaan'], ['apoteker', 'apotek'], ['teller', 'bank']] },
    { fam: 'hasil', sym: false, n: 'hewan dan hasilnya', p: [['lebah', 'madu'], ['sapi', 'susu'], ['ayam', 'telur'], ['domba', 'wol'], ['ulat sutra', 'benang sutra'], ['tiram', 'mutiara']] },
    { fam: 'hasil', sym: false, n: 'bahan baku dan hasil olahannya', p: [['kapas', 'benang'], ['kedelai', 'tempe'], ['tebu', 'gula'], ['gandum', 'tepung'], ['kayu', 'kertas'], ['pasir', 'kaca'], ['susu', 'keju'], ['padi', 'beras']] },
    { fam: 'ukur', sym: false, n: 'besaran dan satuannya', p: [['panjang', 'meter'], ['massa', 'kilogram'], ['waktu', 'detik'], ['suhu', 'kelvin'], ['arus listrik', 'ampere'], ['daya', 'watt'], ['volume', 'liter']] },
    { fam: 'ukur', sym: false, n: 'alat ukur dan yang diukurnya', p: [['termometer', 'suhu'], ['barometer', 'tekanan udara'], ['anemometer', 'kecepatan angin'], ['higrometer', 'kelembapan'], ['seismograf', 'getaran gempa'], ['amperemeter', 'kuat arus'], ['speedometer', 'kecepatan kendaraan']] },
    { fam: 'bagian', sym: false, n: 'bagian dan keseluruhannya', p: [['halaman', 'buku'], ['roda', 'mobil'], ['daun', 'pohon'], ['kata', 'kalimat'], ['jari', 'tangan'], ['atap', 'rumah'], ['layar', 'perahu'], ['lensa', 'kamera']] },
    { fam: 'jenis', sym: false, n: 'anggota dan golongannya', p: [['mawar', 'bunga'], ['merpati', 'burung'], ['hiu', 'ikan'], ['jati', 'pohon'], ['bulu tangkis', 'olahraga'], ['biola', 'alat musik'], ['rendang', 'masakan'], ['merkurius', 'planet']] },
    { fam: 'sebab', sym: false, n: 'sebab dan akibat', p: [['kemarau panjang', 'kekeringan'], ['api', 'asap'], ['polusi udara', 'sesak napas'], ['gesekan', 'panas'], ['hujan deras', 'banjir'], ['begadang', 'mengantuk'], ['erosi', 'tanah longsor']] },
    { fam: 'sebab', sym: false, n: 'keadaan dan pemenuhannya', p: [['lapar', 'makan'], ['haus', 'minum'], ['lelah', 'istirahat'], ['mengantuk', 'tidur'], ['sakit', 'obat'], ['gelap', 'lampu'], ['kedinginan', 'selimut']] },
    { fam: 'sinonim', sym: true, n: 'persamaan makna (sinonim)', p: [['cerdas', 'pandai'], ['elok', 'indah'], ['lazim', 'biasa'], ['kendala', 'hambatan'], ['nisbi', 'relatif'], ['fiktif', 'khayal'], ['mutakhir', 'terbaru'], ['canggung', 'kikuk'], ['bahtera', 'kapal']] },
    { fam: 'antonim', sym: true, n: 'lawan makna (antonim)', p: [['statis', 'dinamis'], ['mayor', 'minor'], ['konkret', 'abstrak'], ['optimis', 'pesimis'], ['ekspor', 'impor'], ['defisit', 'surplus'], ['sentralisasi', 'desentralisasi'], ['efisien', 'boros']] },
    { fam: 'lokasi', sym: false, n: 'negara dan ibu kotanya', p: [['Jepang', 'Tokyo'], ['Thailand', 'Bangkok'], ['Malaysia', 'Kuala Lumpur'], ['Australia', 'Canberra'], ['Mesir', 'Kairo'], ['Brasil', 'Brasilia'], ['Turki', 'Ankara'], ['Kanada', 'Ottawa']] },
    { fam: 'lokasi', sym: false, n: 'provinsi dan ibu kotanya', p: [['Jawa Barat', 'Bandung'], ['Sumatra Barat', 'Padang'], ['Kalimantan Timur', 'Samarinda'], ['Sulawesi Selatan', 'Makassar'], ['Bali', 'Denpasar'], ['Nusa Tenggara Timur', 'Kupang'], ['Riau', 'Pekanbaru'], ['Papua', 'Jayapura']] },
    { fam: 'fungsi', sym: false, n: 'alat dan fungsinya', p: [['pisau', 'memotong'], ['sapu', 'membersihkan'], ['kunci', 'membuka'], ['jarum', 'menjahit'], ['timbangan', 'menimbang'], ['teropong', 'melihat jauh'], ['setrika', 'merapikan pakaian'], ['pena', 'menulis']] }
  ];
  function analogi(r) {
    const rel = pick(r, REL);
    const [base, ans] = shuffle(r, rel.p).slice(0, 2);
    const others = shuffle(r, REL.filter(x => x.fam !== rel.fam));
    const opts = [ans];
    const why = [];
    let k = 0;
    if (!rel.sym && r() < 0.6) { // pengecoh terbalik dari relasi yang sama
      const rev = shuffle(r, rel.p).find(p => p !== base && p !== ans);
      if (rev) { opts.push([rev[1], rev[0]]); why.push(`${rev[1].toUpperCase()} : ${rev[0].toUpperCase()} urutannya terbalik`); }
    }
    while (opts.length < 5) { const rr = others[k++]; opts.push(pick(r, rr.p)); }
    const fmtP = p => `${p[0].toUpperCase()} : ${p[1].toUpperCase()}`;
    return {
      q: `Hubungan yang setara (analogi) dengan pasangan kata berikut adalah ….<div class="seq">${fmtP(base)}</div>`,
      o: opts.map(fmtP),
      e: `Hubungan ${fmtP(base)} adalah ${rel.n}. Pasangan yang setara: ${fmtP(ans)}.${why.length ? ' Pengecoh: ' + why.join('; ') + '.' : ''}`
    };
  }

  bank.register({ key: 'tiu-logika', cat: 'TIU', group: 'ver-logika', label: 'Silogisme & Logika', count: 480, make: logika });
  bank.register({ key: 'tiu-analitis', cat: 'TIU', group: 'ver-analitis', label: 'Penalaran Analitis', count: 420, make: analitis });
  bank.register({ key: 'tiu-analogi', cat: 'TIU', group: 'ver-analogi', label: 'Analogi', count: 360, make: analogi });
})(typeof window !== 'undefined' ? window : globalThis);
