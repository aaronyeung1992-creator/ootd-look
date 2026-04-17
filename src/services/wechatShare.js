// 微信 JSSDK 分享服务
// ⚠️ 需后端提供 /api/wx-signature 接口（无后端时静默跳过）

// 判断是否在微信内置浏览器
export function isWechatBrowser() {
  return typeof window !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent)
}

// 获取当前页面完整 URL（不含 hash）
export function getCurrentPageUrl() {
  return window.location.href.split('#')[0]
}

// 动态加载微信 JSSDK
function loadWechatSDK() {
  return new Promise((resolve, reject) => {
    if (window.wx) {
      resolve(window.wx)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
    script.onload = () => resolve(window.wx)
    script.onerror = () => reject(new Error('微信 JSSDK 加载失败'))
    document.head.appendChild(script)
  })
}

// 向后端请求签名
async function fetchSignature(url) {
  const base = import.meta.env.VITE_API_BASE || ''
  const apiUrl = base
    ? `${base}/api/wx-signature`
    : '/api/wx-signature'

  const res = await fetch(`${apiUrl}?url=${encodeURIComponent(url)}`)

  // 检查响应是否是有效的 JSON
  const contentType = res.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('签名服务不可用')
  }

  const data = await res.json()

  if (!data.success) {
    throw new Error(data.error || '签名获取失败')
  }
  return data
}

// 初始化微信分享
// 返回 { configured: true } 成功 | { configured: false, reason: string } 失败
export async function initWechatShare(options = {}) {
  const {
    title       = 'OOTD · 今日穿搭运势',
    desc        = '基于实时天气的智能穿搭推荐，还有今日幸运色等你解锁！',
    link        = getCurrentPageUrl(),
    imgUrl      = `${window.location.origin}/og-image.jpg`,
    debug       = false,
  } = options

  // 仅在微信内执行
  if (!isWechatBrowser()) {
    return { configured: false, reason: '非微信浏览器，跳过 JSSDK' }
  }

  // 检查是否有后端配置
  const hasBackend = import.meta.env.VITE_API_BASE
  if (!hasBackend) {
    return { configured: false, reason: '未配置公众号签名服务' }
  }

  try {
    const wx = await loadWechatSDK()
    const url = getCurrentPageUrl()
    const sig  = await fetchSignature(url)

    wx.config({
      debug,
      appId:     sig.appId,
      timestamp: sig.timestamp,
      nonceStr:  sig.nonceStr,
      signature: sig.signature,
      jsApiList: [
        'updateAppMessageShareData',   // 分享给朋友
        'updateTimelineShareData',     // 分享到朋友圈
        'hideMenuItems',               // 隐藏部分菜单
      ],
    })

    return new Promise((resolve) => {
      wx.ready(() => {
        // 隐藏不需要的菜单项
        wx.hideMenuItems({
          menuList: [
            'menuItem:copyUrl',        // 复制链接
            'menuItem:share:qq',      // 分享到QQ
            'menuItem:share:weiboApp', // 分享到微博
            'menuItem:share:QZone',    // 分享到QQ空间
          ],
        })

        // 分享给朋友
        wx.updateAppMessageShareData({ title, desc, link, imgUrl })

        // 分享到朋友圈
        wx.updateTimelineShareData({ title, link, imgUrl })

        resolve({ configured: true })
      })

      wx.error((res) => {
        resolve({ configured: false, reason: res.errMsg || 'JSSDK 配置失败' })
      })
    })
  } catch (err) {
    // 静默失败，不显示错误提示
    return { configured: false, reason: '分享服务不可用' }
  }
}
