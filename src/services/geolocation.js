/**
 * 定位服务：获取用户经纬度 + 逆地理编码取城市名
 */

/**
 * 获取用户地理位置 (经纬度)
 * 若用户拒绝，则降级返回北京坐标
 */
export function getCurrentPosition() {
  return new Promise((resolve) => {
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
          fallback: false,
        });
      },
      () => {
        // 定位被拒绝或失败，降级为北京
        resolve({ lat: 39.9042, lon: 116.4074, city: '北京', fallback: true });
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  });
}

/**
 * 通过经纬度反查城市名（Nominatim）
 */
export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'DailyLookMVP/1.0 (ootd-app@example.com)',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
    });
    if (!res.ok) throw new Error('Nominatim error');
    const data = await res.json();
    const addr = data.address || {};
    // 优先取 city > town > county > state
    const city =
      addr.city ||
      addr.town ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      '未知城市';
    return city;
  } catch (e) {
    console.warn('反向地理编码失败，使用坐标代替', e);
    return null;
  }
}
