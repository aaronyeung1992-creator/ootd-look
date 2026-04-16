/**
 * 天气头部组件
 * 展示城市名、温度、体感温度、天气图标
 */
import { MapPin, Wind, Droplets } from 'lucide-react';
import { getWeatherInfo } from '../utils/weatherCodeMap.js';

export default function WeatherHeader({ weather, city, fallback }) {
  const weatherInfo = getWeatherInfo(weather.weatherCode);

  return (
    <div className="animate-slide-up">
      {/* 定位提示（降级时显示） */}
      {fallback && (
        <div className="glass rounded-xl px-4 py-2 mb-3 flex items-center gap-2">
          <MapPin size={14} className="text-yellow-300 shrink-0" />
          <p className="text-white/70 text-xs">开启定位权限可获取精准推荐，当前展示默认城市</p>
        </div>
      )}

      {/* 主天气卡片 */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-start justify-between">
          {/* 左侧：城市 + 温度 */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={15} className="text-white/60" />
              <span className="text-white/80 text-sm font-medium">{city || '定位中…'}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-6xl font-bold text-white text-shadow leading-none">
                {weather.temperature}°
              </span>
              <span className="text-white/60 text-base pb-1.5">C</span>
            </div>
            <p className="text-white/60 text-sm mt-1">
              体感 <span className="text-white/80">{weather.apparentTemperature}°</span>
            </p>
          </div>

          {/* 右侧：天气图标 + 文字 */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <span className="text-5xl">{weatherInfo.icon}</span>
            <span className="text-white/80 text-sm font-medium">{weatherInfo.text}</span>
          </div>
        </div>

        {/* 底部辅助信息 */}
        <div className="flex gap-4 mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Droplets size={14} className="text-blue-300" />
            <span className="text-white/60 text-xs">湿度 {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind size={14} className="text-white/40" />
            <span className="text-white/60 text-xs">风速 {weather.windSpeed} km/h</span>
          </div>
          {weather.precipitation > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-blue-300 text-xs">☔️ 降水 {weather.precipitation}mm</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
