// Validasi seluruh bank soal: struktur, opsi unik, kunci jawaban, duplikat. Jalankan: node tools/validate.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console, Math, Date, JSON, localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; }, removeItem(k) { delete this._m[k]; } } };
ctx.window = ctx; vm.createContext(ctx);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]).filter(s => !/app\.js$/.test(s));
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx, { filename: s });
const { bank, session } = ctx.CPNS;
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
let errors = 0, total = 0;
const perCat = {}, uniq = {};
for (const key of bank.order) {
  const g = bank.gens[key];
  const texts = new Set();
  for (const id of bank.ids(key)) {
    total++;
    let q;
    try { q = bank.get(id); } catch (e) { console.log('ERR', id, e.message); errors++; continue; }
    const fail = m => { errors++; if (errors < 40) console.log('FAIL', id, m, '|', strip(q.q).slice(0, 120)); };
    if (!q.q || /undefined|NaN/.test(q.q)) fail('teks soal tidak valid');
    if (!Array.isArray(q.o) || q.o.length !== 5) fail('opsi bukan 5');
    else {
      if (new Set(q.o.map(strip)).size !== 5 && !/<svg/.test(q.o[0])) fail('opsi duplikat: ' + q.o.map(strip).join(' | '));
      if (/<svg/.test(q.o[0]) && new Set(q.o).size !== 5) fail('opsi gambar duplikat');
      q.o.forEach(o => { if (/undefined|NaN|Infinity/.test(String(o))) fail('opsi tidak valid ' + o); });
    }
    if (q.cat !== 'TKP' && !(q.ans >= 0 && q.ans < 5)) fail('kunci tidak valid');
    if (/undefined|NaN/.test(q.e)) fail('pembahasan tidak valid');
    texts.add(/<svg/.test(q.q) ? q.q + q.o.slice().sort().join('') : strip(q.q) + '||' + q.o.map(strip).sort().join('|'));
  }
  perCat[g.cat] = (perCat[g.cat] || 0) + g.count;
  uniq[g.cat] = (uniq[g.cat] || 0) + texts.size;
  console.log(`${key.padEnd(18)} ${String(g.count).padStart(4)} soal, ${String(texts.size).padStart(4)} unik  [${g.group}]`);
}
// cek blueprint menghasilkan 110 soal
const s = session.daily();
const counts = {}; s.ids.forEach(id => { const c = bank.get(id).cat; counts[c] = (counts[c] || 0) + 1; });
console.log('\nSesi harian:', s.ids.length, 'soal', JSON.stringify(counts), 'duplikat dalam sesi:', s.ids.length - new Set(s.ids).size);
console.log('Total bank:', total, JSON.stringify(perCat), 'unik:', JSON.stringify(uniq));
console.log(errors ? `\n${errors} MASALAH ditemukan` : '\nSemua soal valid.');
process.exit(errors ? 1 : 0);
