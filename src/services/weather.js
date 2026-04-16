/**
 * 天气服务：调用 Open-Meteo 免费 API（无需 Key）
 */

/**
 * 获取实时天气数据
 * @param {number} lat 纬度
 * @param {number} lon 经度
 * @returns {Object} 天气数据
 */
export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    daily: 'weather_code',
    timezone: 'auto',
    forecast_days: 1,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`天气 API 请求失败: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current || {};

  return {
    temperature: Math.round(current.temperature_2m ?? 20),
    apparentTemperature: Math.round(current.apparent_temperature ?? 20),
    humidity: Math.round(current.relative_humidity_2m ?? 50),
    precipitation: current.precipitation ?? 0,
    weatherCode: current.weather_code ?? 0,
    windSpeed: Math.round(current.wind_speed_10m ?? 0),
    timezone: data.timezone || 'UTC',
  };
}
