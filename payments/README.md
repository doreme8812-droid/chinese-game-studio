# 中文教学工具库 · 收款与付费门禁（支付宝 / 微信 月付订阅）

> 状态：**可运行脚手架**。本地沙箱模式已能完整跑通「订阅 → 支付 → 开通权益 → 解锁付费工具」闭环；真实支付宝/微信「签约代扣」接口已留好位置，等你提供商户密钥后即可接通。

---

## 一、上线前你必须亲自走的步骤（合规前提）

自动收款不能只用个人号。按你确认的「国内为主 + 个体工商户 + 支付宝/微信商户号」路线，先做这两件事：

### 1. 注册「个体工商户」
- 去经营地市场监管局（或政务服务网/小程序）办理，**名称可含个人姓名 + 工作室/教育咨询**，类目选「教育咨询 / 信息技术服务」之类。
- 材料通常：身份证、经营场所证明（可用住宅，部分城市需社区盖章或承诺制）。
- 费用：登记本身基本免费，约 1–3 个工作日下证。
- 拿到 **营业执照** 后，去银行开**对公账户**（也可用负责人个人结算户，视当地要求）。

### 2. 开通支付宝 & 微信 商户号
| 平台 | 入口 | 所需材料 | 周期 |
|---|---|---|---|
| 支付宝 | [open.alipay.com](https://open.alipay.com) → 服务商/自研 → 创建应用 → 开通「**周期扣款（签约代扣）**」 | 营业执照、法人身份证、对公账户、应用信息 | 1–5 个工作日 |
| 微信支付 | [pay.weixin.qq.com](https://pay.weixin.qq.com) → 商户平台注册 → 开通「**委托代扣 / 支付分**」 | 营业执照、法人身份证、对公账户、APPID | 1–5 个工作日 |

- **订阅（月付自动续）必须用「签约代扣」类产品**，普通下单只能收一次性，做不到自动续费。
- 拿到密钥后，把它们填进 `payments/.env`（参照 `.env.example`）：
  - 支付宝：`ALIPAY_APP_ID` / `ALIPAY_PRIVATE_KEY` / `ALIPAY_PUBLIC_KEY`
  - 微信：`WECHAT_MCH_ID` / `WECHAT_APP_ID` / `WECHAT_API_KEY` / `WECHAT_SERIAL_NO` / `WECHAT_PRIVATE_KEY`

> ⚠️ 个人号长期商用有冻结与税务风险；个体工商户 + 商户号是合规、稳定的正路。这一步只能你自己或找代理办，我无法代你注册。

---

## 二、架构与数据流

```
学生(网站) ──POST /api/subscribe──▶ 收款后端(server.js)
                                        │ 真实模式：调支付宝/微信「签约代扣」拿到签约/支付链接
                                        ▼
                              学生扫码/跳转完成签约并支付首期
                                        │ 支付宝/微信异步通知
                                        ▼
                          POST /api/notify/{alipay|wechat}  (校验签名)
                                        ▼
                              更新权益存储(active=true, expiresAt)
                                        ▼
   学生再次打开网站 ──GET /api/entitlement?uid=──▶ 返回权益 ──▶ 前端 gate.js 显隐付费工具
```

- **密钥永远只在后端**，前端只拿「是否可用」。
- 权益存储当前是演示用 `data/entitlements.json`；生产请换成 **Firebase / Firestore**（你白板已在用）或数据库。

---

## 三、目录结构

```
payments/
├─ server.js          # 收款后端（零依赖，Node 内置 http）
├─ package.json
├─ .env.example       # 配置模板（复制为 .env 填密钥）
├─ data/              # 演示用权益数据（已被 .gitignore 忽略）
└─ public/
   ├─ index.html      # 付费门禁演示页
   └─ gate.js         # 前端门禁助手：按权益显隐 .premium 区块
```

---

## 四、本地运行（沙箱演示，无需任何密钥）

```bash
cd payments
cp .env.example .env        # 不填密钥即为沙箱模式
node server.js
# 打开 http://localhost:3000
```

演示闭环：在付费卡片点「解锁」→ 模拟支付成功 → 门禁自动打开。
也可手动验证接口：

```bash
# 初始权益（应 active:false）
curl 'http://localhost:3000/api/entitlement?uid=demo-user-1'

# 模拟支付成功
curl -X POST 'http://localhost:3000/api/dev/simulate-paid' \
  -H 'Content-Type: application/json' \
  -d '{"uid":"demo-user-1","channel":"alipay"}'

# 再次查询（应 active:true）
curl 'http://localhost:3000/api/entitlement?uid=demo-user-1'
```

---

## 五、接通真实签约代扣（拿到密钥后）

在 `server.js` 的 `POST /api/subscribe` 与 `POST /api/notify/*` 两处 `TODO` 接入官方 SDK：

```bash
npm install alipay-sdk wechatpay-node-v3
```

- **支付宝**：用 `alipay-sdk` 调用 `alipay.trade.page.agreement.sign`（或对应周期扣款接口），返回跳转 URL；`/api/notify/alipay` 用 `ALIPAY_PUBLIC_KEY` 验签后开通权益。
- **微信**：用 `wechatpay-node-v3` 创建代扣协议，返回二维码/跳转；`/api/notify/wechat` 用平台证书验签后开通权益。
- 密钥齐了，server 启动会打印 `mode=REAL`，沙箱分支自动失效。

---

## 六、把门禁接到现有工具站

1. 在要收费的工具容器上加 `class="premium"`。
2. 页面加载时调用：
   ```js
   applyGating(uid, { channel: 'alipay' });   // uid 来自你的登录态
   ```
3. 免费工具保持原样，不收任何 class，对所有人开放。

---

## 七、部署与合规提醒

- 后端需独立部署（任意 Node 主机 / 云函数 / 你已有的 Firebase Cloud Functions 都可跑）。
- 回调地址必须是 **HTTPS**；国内服务器需 **ICP 备案**。
- 站点需有**退款规则 + 隐私政策**页面。
- 不承诺具体收入；我只交付技术闭环，实体注册/税务/备案需你自行办理。

---

## 八、下一步建议

1. 你先去把个体工商户 + 商户号办下来（最耗时的前置）。
2. 同时可用本沙箱演示，把「哪些工具收费、收费怎么呈现」定下来。
3. 密钥到手后，我帮你把真实 SDK 接好并接入现有工具站。
