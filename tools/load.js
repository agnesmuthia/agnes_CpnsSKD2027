// Muat semua skrip bank di Node (tanpa browser) untuk validasi.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console, Math, Date, JSON };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(js\/(?:core|bank\/[^"]+|session)\.js)"/g)].map(m => m[1]);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx, { filename: s });
module.exports = ctx.CPNS;
