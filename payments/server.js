const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

/* ============ 配置 ============ */
function loadEnv() {
  const p = path.join(__dirname, '.env');
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const DEV_SECRET = process.env.DEV_SECRET || 'dev-secret-change-me';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'entitlements.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// 真实模式：商户密钥齐了才启用；否则走沙箱
const REAL_ALIPAY = !!(process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY);
const REAL_WECHAT = !!(process.env.WECHAT_MCH_ID && process.env.WECHAT_API_KEY);
const REAL_PAYPAL = !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET);
const REAL_PADDLE = !!(process.env.PADDLE_VENDOR_ID && process.env.PADDLE_WEBHOOK_SECRET);
const REAL_CHANNELS = { alipay: REAL_ALIPAY, wechat: REAL_WECHAT, paypal: REAL_PAYPAL, paddle: REAL_PADDLE };
const CHANNELS = ['alipay', 'wechat', 'paypal', 'paddle'];

/* ============ 权益存储 ============
   演示用 JSON 文件；生产请换成 Firebase/Firestore 或数据库。
   字段：{ uid, active, plan, channel, expiresAt }
*/
function readAll() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { return {}; }
}
function writeAll(o) { fs.writeFileSync(DATA_FILE, JSON.stringify(o, null, 2)); }
function getEnt(uid) {
  const a = readAll();
  return a[uid] || { uid, active: false, plan: null, channel: null, expiresAt: null };
}
function setEnt(uid, obj) {
  const a = readAll();
  a[uid] = Object.assign(getEnt(uid), obj, { uid });
  writeAll(a);
  return a[uid];
}

// 沙箱模式下用于校验 webhook 的 HMAC 签名（模拟真实异步通知验签）
function sign(payload) {
  return crypto.createHmac('sha256', DEV_SECRET).update(JSON.stringify(payload)).digest('hex');
}

/* ============ 路由 ============ */
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const p = u.pathname;

  // 静态文件（演示页）
  if (req.method === 'GET' && (p === '/' || p.startsWith('/public/'))) {
    return serveStatic(p, res);
  }

  // 查询权益
  if (req.method === 'GET' && p === '/api/entitlement') {
    const uid = u.searchParams.get('uid');
    return json(res, 200, uid ? getEnt(uid) : { error: 'uid required' });
  }

  // 发起订阅（签约代扣 / 海外订阅）：返回支付/签约链接或二维码内容
  if (req.method === 'POST' && p === '/api/subscribe') {
    const body = await readBody(req);
    const uid = body.uid;
    if (!uid) return json(res, 400, { error: 'uid required' });
    if (!CHANNELS.includes(body.channel)) return json(res, 400, { error: 'unsupported channel' });
    const ch = body.channel;

    if (REAL_CHANNELS[ch]) {
      // TODO 真实订阅：按渠道接入官方 SDK / API
      //  - alipay : alipay-sdk  → alipay.trade.page.agreement.sign（周期扣款）
      //  - wechat : wechatpay-node-v3 → 委托代扣协议
      //  - paypal : 服务端用 PAYPAL_CLIENT_ID/SECRET 调 /v1/billing/plans + /v1/billing/subscriptions
      //  - paddle : 用 PADDLE_VENDOR_ID 创建 Subscription/Checkout 链接（merchant of record，无需你注册公司）
      return json(res, 501, { error: `real ${ch} path not wired; fill keys + SDK/API calls in server.js` });
    }

    // 沙箱：返回一个"模拟支付"链接供演示 gating 闭环
    const token = sign({ uid, ch, t: Date.now() });
    return json(res, 200, {
      sandbox: true,
      channel: ch,
      payUrl: `/api/dev/simulate-paid?uid=${encodeURIComponent(uid)}&channel=${ch}&sig=${token}`
    });
  }

  // 异步通知（webhook）：真实环境由支付平台服务器回调；此处沙箱版校验 HMAC
  if (req.method === 'POST' && p.startsWith('/api/notify/')) {
    const ch = p.split('/').pop();
    if (!CHANNELS.includes(ch)) return json(res, 400, { error: 'unknown channel' });
    const body = await readBody(req);

    if (REAL_CHANNELS[ch]) {
      // TODO 真实 webhook 验签（各渠道不同）：
      //  - alipay : 用 ALIPAY_PUBLIC_KEY 验签
      //  - wechat : 用平台证书验签
      //  - paypal : 用 Webhook Signature（证书 + transmission_id/timestamp/body）
      //  - paddle : 用 PADDLE_WEBHOOK_SECRET 校验 Paddle-Signature (HMAC-SHA256, ts+nonce+body)
      return json(res, 501, { error: `real ${ch} webhook verify not wired` });
    }

    const expected = sign({ uid: body.uid, ch: body.channel, t: body.t });
    if (body.sig !== expected) return json(res, 403, { error: 'bad signature' });
    const months = parseInt(body.months || '1', 10);
    const expires = Date.now() + months * 30 * 24 * 3600 * 1000;
    setEnt(body.uid, { active: true, plan: 'monthly', channel: body.channel, expiresAt: expires });
    return json(res, 200, { ok: true });
  }

  // 开发用：模拟支付成功（仅非生产环境可用）
  if (req.method === 'POST' && p === '/api/dev/simulate-paid') {
    if (process.env.NODE_ENV === 'production') return json(res, 403, { error: 'dev only' });
    const body = await readBody(req);
    const uid = body.uid || u.searchParams.get('uid');
    const channel = body.channel || u.searchParams.get('channel') || 'alipay';
    const months = parseInt(body.months || '1', 10);
    const expires = Date.now() + months * 30 * 24 * 3600 * 1000;
    setEnt(uid, { active: true, plan: 'monthly', channel, expiresAt: expires });
    return json(res, 200, { ok: true, entitlement: getEnt(uid) });
  }

  json(res, 404, { error: 'not found' });
});

/* ============ 工具 ============ */
function readBody(req) {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch (e) { resolve({}); } });
  });
}
function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function serveStatic(p, res) {
  let fp = p === '/' ? path.join(__dirname, 'public', 'index.html') : path.join(__dirname, p);
  fp = path.normalize(fp);
  if (!fp.startsWith(path.join(__dirname, 'public'))) return json(res, 403, { error: 'forbidden' });
  fs.readFile(fp, (e, data) => {
    if (e) { res.writeHead(404); return res.end('not found'); }
    const ext = path.extname(fp);
    const ct = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' }[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': ct + '; charset=utf-8' });
    res.end(data);
  });
}

server.listen(PORT, () => {
  const real = CHANNELS.filter(c => REAL_CHANNELS[c]);
  console.log(`payments server on http://localhost:${PORT}  (mode=${real.length ? 'REAL:' + real.join(',') : 'SANDBOX'})`);
});
