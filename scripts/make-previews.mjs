#!/usr/bin/env node
/**
 * 自动生成工具预览图（真实页面截图）
 *
 * 用法：node scripts/make-previews.mjs
 *  - 读取 assets/games.js 的 GAMES 清单
 *  - 用本机 Chrome 无头模式打开每个工具页并截图
 *  - 输出 assets/previews/<id>.webp（首页卡片自动引用，文件缺失时回退 emoji）
 *
 * 工具改版 / 新增工具后重跑一次即可全部更新。
 */
import fs from 'fs';
import path from 'path';
import http from 'http';
import { createRequire } from 'module';
import { spawn } from 'child_process';

const require_ = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

// playwright-core：优先常规解析，失败则用受管 node 工作区
let chromium;
try { ({ chromium } = require_('playwright-core')); }
catch {
  ({ chromium } = require_('/Users/Dora_1/.workbuddy/binaries/node/workspace/node_modules/playwright-core'));
}

// 读取 GAMES 数据（games.js 是普通 script，用函数体求值提取）
const src = fs.readFileSync(path.join(ROOT, 'assets/games.js'), 'utf8');
const GAMES = new Function(src + '\n;return GAMES;')();
console.log(`GAMES: ${GAMES.length} 个工具`);

// 起本地静态服务器（避免 file:// 下 module/fetch 限制）
const server = http.createServer((req, res) => {
  let fp = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (fp === '/') fp = '/index.html';
  const abs = path.join(ROOT, fp);
  if (!abs.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(abs, (e, data) => {
    if (e) { res.writeHead(404); return res.end('not found'); }
    const ct = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg',
      '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }[path.extname(abs)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});
await new Promise(r => server.listen(8123, r));

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const ctx = await browser.newContext({
  viewport: { width: 1100, height: 680 },
  deviceScaleFactor: 1.5,
  locale: 'zh-CN',
});

const outDir = path.join(ROOT, 'assets/previews');
fs.mkdirSync(outDir, { recursive: true });

let ok = 0, fail = [];
for (const g of GAMES) {
  const rel = g.path || ('generators/' + g.file);
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:8123/${rel}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    // 隐藏滚动条与部署层注入的角标（如 Netlify badge），让截图更干净
    await page.addStyleTag({ content: `
      ::-webkit-scrollbar { display: none !important; }
      html { scrollbar-width: none !important; }
      [class*="netlify" i], [id*="netlify" i], [data-netlify-identity] { display: none !important; }
    `}).catch(() => {});
    await page.waitForTimeout(900); // 字体/画布/动画稳定
    const out = path.join(outDir, `${g.id}.webp`);
    await page.screenshot({ path: out, type: 'webp', quality: 80,
      clip: { x: 0, y: 0, width: 1100, height: 620 } });
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`  ✓ ${g.id}  (${kb}KB)  <- ${rel}`);
    ok++;
  } catch (e) {
    console.error(`  ✗ ${g.id}  ${e.message.split('\n')[0]}`);
    fail.push(g.id);
  } finally {
    await page.close();
  }
}

await browser.close();
server.close();
console.log(`\n完成：${ok}/${GAMES.length}${fail.length ? '，失败：' + fail.join(', ') : ''}`);
process.exit(fail.length ? 1 : 0);
