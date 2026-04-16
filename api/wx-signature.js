import express from 'express'
import crypto from 'crypto'

const app = express()
const PORT = process.env.PORT || 3001

// ============================================================
// ⚠️  微信公众平台配置（部署前请填写）
// ============================================================
const WECHAT_APPID  = process.env.WECHAT_APPID  || 'YOUR_APPID'
const WECHAT_SECRET = process.env.WECHAT_SECRET  || 'YOUR_APPSECRET'

// Vercel Serverless 不适合长缓存，这里用内存缓存 access_token / jsapi_ticket
let tokenCache = {
  access_token: '',
  jsapi_ticket: '',
  expiresAt: 0,
}

// ─── 工具函数 ──────────────────────────────────────────────
function sha1(str) {
  return crypto.createHash('sha1').update(str).update('').digest('hex')
}

function getJsApiTicketUrl(accessToken) {
  return `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
}

function getAccessTokenUrl() {
  return `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}`
}

// ─── 获取 Access Token（带缓存） ──────────────────────────
async function getAccessToken() {
  const now = Date.now()
  if (tokenCache.access_token && now < tokenCache.expiresAt) {
    return tokenCache.access_token
  }

  const url = getAccessTokenUrl()
  const res = await fetch(url)
  const data = await res.json()

  if (data.errcode) {
    throw new Error(`获取 access_token 失败: ${data.errmsg}`)
  }

  // 提前 5 分钟过期，避免临界问题
  tokenCache.access_token = data.access_token
  tokenCache.expiresAt   = now + (data.expires_in - 300) * 1000
  return data.access_token
}

// ─── 获取 JS API Ticket（带缓存） ─────────────────────────
async function getJsApiTicket() {
  const now = Date.now()
  if (tokenCache.jsapi_ticket && now < tokenCache.expiresAt) {
    return tokenCache.jsapi_ticket
  }

  const accessToken = await getAccessToken()
  const url = getJsApiTicketUrl(accessToken)
  const res = await fetch(url)
  const data = await res.json()

  if (data.errcode) {
    throw new Error(`获取 jsapi_ticket 失败: ${data.errmsg}`)
  }

  tokenCache.jsapi_ticket = data.ticket
  tokenCache.expiresAt    = now + (data.expires_in - 300) * 1000
  return data.ticket
}

// ─── 生成 JSSDK 签名 ───────────────────────────────────────
async function getSignature(url) {
  const ticket = await getJsApiTicket()
  const noncestr  = crypto.randomBytes(16).toString('hex')
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const str = [
    `jsapi_ticket=${ticket}`,
    `noncestr=${noncestr}`,
    `timestamp=${timestamp}`,
    `url=${url}`,
  ].sort().join('&')

  const signature = sha1(str)

  return {
    appId:     WECHAT_APPID,
    timestamp,
    nonceStr:  noncestr,
    signature,
  }
}

// ─── API 路由 ─────────────────────────────────────────────
app.get('/api/wx-signature', async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: '缺少 url 参数' })
  }

  try {
    const sig = await getSignature(decodeURIComponent(url))
    res.json({ success: true, ...sig })
  } catch (err) {
    console.error('[wx-signature] error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Vercel Serverless 导出
export default app
