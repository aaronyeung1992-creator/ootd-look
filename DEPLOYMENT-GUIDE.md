# OOTD · 微信分享版 部署指南

## 目录
- [架构说明](#架构说明)
- [第一步：准备微信公众号](#第一步准备微信公众号)
- [第二步：配置环境变量](#第二步配置环境变量)
- [第三步：部署到 Vercel](#第三步部署到-vercel)
- [第四步：配置微信公众号安全域名](#第四步配置微信公众号安全域名)
- [第五步：验证分享功能](#第五步验证分享功能)
- [常见问题](#常见问题)

---

## 架构说明

```
┌─────────────────────────────────────────────────────┐
│                      用户浏览器                       │
│  ┌──────────────────┐    ┌─────────────────────┐  │
│  │   React 前端       │    │  微信 JSSDK         │  │
│  │  (天气/穿搭/运势)  │───▶│  updateAppMessage   │  │
│  └────────┬──────────┘    │  ShareData           │  │
│           │ GET /api/wx-signature?url=...        │
└───────────┼────────────────────────────────────────┘
            │ HTTPS
            ▼
┌─────────────────────────────────────────────────────┐
│              Vercel Serverless                       │
│  ┌──────────────────────────────────────────────┐  │
│  │  GET /api/wx-signature                       │  │
│  │  ① 用 AppID/AppSecret 调用微信 API           │  │
│  │  ② 获取 access_token                        │  │
│  │  ③ 获取 jsapi_ticket                        │  │
│  │  ④ 生成签名并返回 { appId, timestamp,        │  │
│  │     nonceStr, signature }                   │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**为什么需要后端？**
微信 JSSDK 的 `signature` 参数包含 `jsapi_ticket`，而 `jsapi_ticket` 只能通过 `AppSecret`（微信公众号的密钥）向微信服务器申请。AppSecret 绝对不能暴露在前端代码中，否则你的公众号将被盗用。因此需要一个后端 API 来安全地处理签名。

---

## 第一步：准备微信公众号

你需要一个**微信服务号**或**微信订阅号**（个人订阅号也支持基础 JSSDK）。

### 1.1 注册/登录

登录 [微信公众平台](https://mp.weixin.qq.com) → 使用你的公众号账号登录。

### 1.2 获取 AppID 和 AppSecret

进入 **设置与开发** → **基本配置**：

| 字段 | 位置 | 用途 |
|------|------|------|
| AppID | 基本配置页面顶部 | 前端标识公众号身份 |
| AppSecret | 基本配置页面（需点击查看） | 后端换取 access_token，**不要泄露** |

> ⚠️ 如果 AppSecret 泄露了，立即在同页面重置。

---

## 第二步：配置环境变量

项目使用 `.env` 文件管理敏感配置。

### 2.1 创建 `.env` 文件

在 `ootd-app/` 目录下创建 `.env`：

```bash
# 微信公众号凭证（从 mp.weixin.qq.com 获取）
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your_appsecret_here_here_here

# API 基础路径（Vercel 部署后自动为 /api，本地开发为 http://localhost:3001）
VITE_API_BASE=
```

### 2.2 本地开发时运行后端

```bash
# 安装依赖（已包含 express）
npm install

# 终端1：运行后端签名服务
npm run start:api

# 终端2：运行前端
npm run dev
```

本地访问：`http://localhost:5173`，API 代理到 `http://localhost:3001`。

---

## 第三步：部署到 Vercel

### 3.1 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3.2 部署（交互式）

```bash
cd ootd-app
vercel login        # 先登录
vercel deploy       # 部署到预览环境
vercel --prod       # 部署到生产环境
```

或直接**拖拽部署**：
1. 打开 [vercel.com](https://vercel.com)
2. 新建 Project → 拖入整个 `ootd-app/dist` 文件夹
3. 设置环境变量（`WECHAT_APPID` / `WECHAT_SECRET`）

### 3.3 在 Vercel 控制台设置环境变量

进入 Project → **Settings** → **Environment Variables**：

| Name | Value |
|------|-------|
| `WECHAT_APPID` | `wx1234567890abcdef` |
| `WECHAT_SECRET` | `your_appsecret_here` |

> ⚠️ 将 `WECHAT_SECRET` 设为 **Secret** 类型，界面上会脱敏显示。

### 3.4 重新部署

添加环境变量后，需要在 **Deployments** 页面重新触发一次 **Redeploy**，让新环境变量生效。

---

## 第四步：配置微信公众号安全域名

### 4.1 在微信公众平台添加安全域名

进入 **设置与开发** → **公众号设置** → **功能设置**：

| 配置项 | 填入内容 |
|--------|---------|
| JS接口安全域名 | 填入 Vercel 分配的域名，例如 `ootd-app.vercel.app` |
| 网页授权域名 | 同上 |
|业务域名 | 同上（如果提示需要验证，按页面指引在服务器根目录放验证文件） |

### 4.2 自定义域名（可选，推荐）

如果你有自己的备案域名（如 `ootd.yourdomain.com`）：

1. Vercel Project → **Domains** → 添加你的域名并完成 DNS 验证
2. 将域名 CNAME 到 `cname.vercel-dns.com`
3. 在微信公众平台把安全域名改为你的域名

---

## 第五步：验证分享功能

### 5.1 在微信开发者工具中测试

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 添加项目 → 输入你的 Vercel URL（如 `https://ootd-app.vercel.app`）
3. 在模拟器中打开页面
4. 打开调试器 → Console 检查是否有 JSSDK 错误
5. 点击右上角「···」→ 查看分享卡片内容是否正确

### 5.2 在真机上测试

用微信扫描二维码打开（Vercel 每个项目有免费的二维码入口）。

**检查点：**
- [ ] 右上角「···」→「发送给朋友」→ 分享卡片标题/描述/图标是否正确
- [ ] 分享到朋友圈 → 朋友圈动态是否显示正确标题
- [ ] 页面顶部是否有绿色"已在微信中配置自定义分享"提示

---

## 常见问题

### Q1：部署后微信分享显示"配置中"或配置失败？

**排查顺序：**

1. **环境变量未配置** → 确认 Vercel 中已正确设置 `WECHAT_APPID` 和 `WECHAT_SECRET`，并已 Redeploy
2. **安全域名未填写** → 微信公众平台 → 功能设置 → JS接口安全域名
3. **域名未备案** → 微信要求所有 JS 安全域名必须 ICP 备案（国内服务器）；如果域名在境外，用微信开发者工具测试不受此限制
4. **签名 URL 不匹配** → JSSDK 签名用的 URL 必须与用户实际打开的 URL 完全一致（含协议、域名、路径，不含 hash）。检查 `window.location.href.split('#')[0]`
5. **access_token 过期** → 后端已做缓存（提前 5 分钟刷新），但并发请求可能触发问题，日志查看具体错误

### Q2：access_token 获取失败？

- 确认 `WECHAT_APPID` 和 `WECHAT_SECRET` 正确
- 确认公众号已**完成认证**（未认证的订阅号 access_token 权限有限）
- 检查公众号是否被封禁或限制了接口权限

### Q3：微信内打开页面白屏？

- 确认网站使用 **HTTPS**（微信强制要求）
- 检查浏览器控制台（微信开发者工具中打开）

### Q4：域名必须备案吗？

- **安全域名配置**：国内服务器要求备案；香港/海外服务器/Vercel 通常不需要
- **最快方案**：先用 Vercel 域名测试，确认功能正常后再购买备案域名

### Q5：分享图标不显示？

JSSDK 的 `imgUrl` 必须是**完整的 HTTPS 图片 URL**（不能是相对路径）。
当前默认使用 `favicon.ico`，建议上传一张 100×100px 的 JPG/PNG 作为分享图标。
