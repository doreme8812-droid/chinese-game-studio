/*
 * gate.js — 付费门禁客户端助手（零依赖）
 * 用法：在付费工具容器加 class="premium"，免费工具不动。
 *      页面加载时调用 applyGating(uid) 即可按需显隐。
 */
async function getEntitlement(uid) {
  const r = await fetch('/api/entitlement?uid=' + encodeURIComponent(uid));
  return r.json();
}

async function applyGating(uid, opts = {}) {
  const ent = await getEntitlement(uid);
  const sel = opts.premiumSelector || '.premium';
  document.querySelectorAll(sel).forEach(el => {
    const overlay = el.querySelector('.lock-overlay');
    if (ent.active && ent.expiresAt > Date.now()) {
      el.classList.remove('locked');
      if (overlay) overlay.remove();
    } else {
      el.classList.add('locked');
      if (!overlay) {
        const o = document.createElement('div');
        o.className = 'lock-overlay';
        o.innerHTML =
          '<div class="lock-box">' +
          '<p>🔒 这是付费工具</p>' +
          '<p class="hint">订阅后解锁全部付费工具</p>' +
          '<button class="unlock-btn">解锁（月付订阅）</button>' +
          '</div>';
        el.appendChild(o);
        o.querySelector('.unlock-btn').addEventListener('click', () => startSubscribe(uid, opts));
      }
    }
  });
  return ent;
}

async function startSubscribe(uid, opts = {}) {
  const channel = opts.channel || 'alipay';
  const r = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, channel })
  });
  const data = await r.json();
  if (data.sandbox) {
    // 演示模式：模拟扫码支付成功后再刷新门禁
    alert('演示模式：模拟扫码支付成功');
    await fetch('/api/dev/simulate-paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, channel })
    });
    await applyGating(uid, opts);
  } else {
    // 真实模式：跳转到支付宝/微信签约页面
    window.location.href = data.payUrl;
  }
}
