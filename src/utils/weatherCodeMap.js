/**
 * WMO Weather Code 映射表（Open-Meteo 使用）
 * https://open-meteo.com/en/docs#weathervariables
 */
export const WEATHER_CODE_MAP = {
  0: { icon: '☀️', text: '晴朗', bg: 'from-amber-400 to-orange-300' },
  1: { icon: '🌤️', text: '大部晴朗', bg: 'from-amber-300 to-sky-300' },
  2: { icon: '⛅', text: '多云', bg: 'from-sky-300 to-slate-300' },
  3: { icon: '☁️', text: '阴天', bg: 'from-slate-400 to-gray-400' },
  45: { icon: '🌫️', text: '雾', bg: 'from-gray-400 to-gray-300' },
  48: { icon: '🌫️', text: '冻雾', bg: 'from-gray-500 to-blue-200' },
  51: { icon: '🌦️', text: '毛毛雨', bg: 'from-sky-400 to-blue-300' },
  53: { icon: '🌦️', text: '小雨', bg: 'from-sky-500 to-blue-400' },
  55: { icon: '🌧️', text: '中雨', bg: 'from-blue-500 to-blue-400' },
  56: { icon: '🌧️', text: '冻雨', bg: 'from-blue-600 to-cyan-400' },
  57: { icon: '🌧️', text: '强冻雨', bg: 'from-blue-700 to-cyan-500' },
  61: { icon: '🌧️', text: '小雨', bg: 'from-sky-500 to-blue-400' },
  63: { icon: '🌧️', text: '中雨', bg: 'from-blue-500 to-blue-400' },
  65: { icon: '🌧️', text: '大雨', bg: 'from-blue-700 to-indigo-500' },
  66: { icon: '🌨️', text: '冻雨', bg: 'from-blue-400 to-cyan-300' },
  67: { icon: '🌨️', text: '强冻雨', bg: 'from-blue-500 to-cyan-400' },
  71: { icon: '🌨️', text: '小雪', bg: 'from-sky-200 to-blue-100' },
  73: { icon: '❄️', text: '中雪', bg: 'from-sky-300 to-indigo-200' },
  75: { icon: '❄️', text: '大雪', bg: 'from-sky-400 to-indigo-300' },
  77: { icon: '🌨️', text: '雪粒', bg: 'from-slate-300 to-blue-200' },
  80: { icon: '🌦️', text: '阵雨', bg: 'from-sky-400 to-blue-300' },
  81: { icon: '🌧️', text: '中阵雨', bg: 'from-blue-500 to-blue-400' },
  82: { icon: '⛈️', text: '强阵雨', bg: 'from-blue-700 to-indigo-600' },
  85: { icon: '🌨️', text: '阵雪', bg: 'from-sky-300 to-indigo-200' },
  86: { icon: '❄️', text: '强阵雪', bg: 'from-sky-400 to-indigo-300' },
  95: { icon: '⛈️', text: '雷雨', bg: 'from-indigo-600 to-purple-500' },
  96: { icon: '⛈️', text: '雷暴冰雹', bg: 'from-purple-700 to-indigo-600' },
  99: { icon: '⛈️', text: '强雷暴', bg: 'from-purple-900 to-indigo-800' },
};

/**
 * 获取天气代码对应信息（找不到时向下取整逼近）
 */
export function getWeatherInfo(code) {
  if (WEATHER_CODE_MAP[code]) return WEATHER_CODE_MAP[code];
  // 向下逼近最近的已知代码
  const keys = Object.keys(WEATHER_CODE_MAP).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= code) closest = k;
  }
  return WEATHER_CODE_MAP[closest] || { icon: '🌡️', text: '未知天气', bg: 'from-gray-400 to-gray-300' };
}

/**
 * 判断是否是降水天气（WMO 代码 50+）
 */
export function isPrecipitation(code) {
  return code >= 51;
}

/**
 * 判断是否是下雪天气
 */
export function isSnow(code) {
  return (code >= 71 && code <= 77) || code === 85 || code === 86;
}
