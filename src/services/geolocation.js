/**
 * 定位服务：获取用户经纬度 + 逆地理编码取城市名
 */

/**
 * 通过 IP 获取大致位置（兜底，毫秒级）
 */
async function getLocationByIP() {
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('ipapi error');
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lon: data.longitude,
        city: data.city || null,
        source: 'ip',
      };
    }
  } catch (_) {
    // 静默失败
  }
  return null;
}

/**
 * 获取用户地理位置 (经纬度)
 * 优先 GPS → 超时则降级 IP 定位
 */
export function getCurrentPosition() {
  return new Promise(async (resolve) => {
    // 1. 优先尝试 IP 定位（毫秒级，先拿个大概位置让页面快速显示）
    const ipLoc = await getLocationByIP();
    if (ipLoc) {
      resolve({ ...ipLoc, fallback: false });
      return;
    }

    // 2. IP 失败，尝试 GPS
    if (!navigator.geolocation) {
      resolve({ lat: 39.9042, lon: 116.4074, city: '北京', fallback: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city: null,
          source: 'gps',
          fallback: false,
        });
      },
      () => {
        // GPS 拒绝或失败，降级为北京
        resolve({ lat: 39.9042, lon: 116.4074, city: '北京', fallback: true });
      },
      {
        timeout: 20000,    // 手机 GPS 定位慢，从 8s 改为 20s
        maximumAge: 300000, // 5 分钟内缓存
        enableHighAccuracy: false, // 不强制高精度，避免更慢
      }
    );
  });
}

/**
 * 通过经纬度反查城市名（Nominatim）
 * 增强错误处理，兼容微信浏览器
 */
export async function reverseGeocode(lat, lon) {
  try {
    // 验证坐标有效性
    if (!lat || !lon || isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
      return null;
    }

    // 确保坐标是有效的数字
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return null;
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latNum}&lon=${lonNum}`;

    let data;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          'Accept': 'application/json',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(10000), // 10s 超时兜底
      });

      if (!res.ok) throw new Error('Nominatim error');

      // 先获取文本再解析，避免某些浏览器的 JSON 解析问题
      const text = await res.text();
      data = JSON.parse(text);
    } catch (parseErr) {
      console.warn('Nominatim 解析失败:', parseErr);
      return null;
    }

    // 检查返回数据有效性
    if (!data || !data.address) {
      return null;
    }

    const addr = data.address || {};
    // 优先取 city > town > county > village > municipality > state
    const city =
      addr.city ||
      addr.town ||
      addr.county ||
      addr.village ||
      addr.municipality ||
      addr.state ||
      null;

    return city || null;
  } catch (e) {
    console.warn('反向地理编码失败:', e);
    return null;
  }
}
