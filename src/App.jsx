import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Share2, X, CheckCircle, AlertCircle, User } from 'lucide-react';

import LoadingSpinner from './components/LoadingSpinner.jsx';
import WeatherHeader from './components/WeatherHeader.jsx';
import OutfitCard from './components/OutfitCard.jsx';
import FortuneCard from './components/FortuneCard.jsx';
import ProfileSetup from './components/ProfileSetup.jsx';

import { getCurrentPosition, reverseGeocode } from './services/geolocation.js';
import { fetchWeather } from './services/weather.js';
import { getTodayFortune } from './services/fortune.js';
import { getOutfitAdvice } from './utils/outfitEngine.js';
import { getWeatherInfo } from './utils/weatherCodeMap.js';
import { initWechatShare, isWechatBrowser } from './services/wechatShare.js';
import { enhanceOutfit } from './services/outfitEnhancer.js';
import { needsProfileSetup, getProfile, resetProfile } from './services/profile.js';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// 构建分享标题（包含天气/运势信息）
function buildShareTitle(weather, fortune) {
  const temp = weather?.apparentTemperature
  const tempStr = temp != null ? `${Math.round(temp)}°C` : '';
  const luckLabel = fortune?.luck?.label || '';
  return `OOTD · ${tempStr} ${luckLabel} 今日穿搭运势`;
}

// 城市坐标粗略匹配（备用方案）
const CITY_GUESS = [
  { lat: [29.5, 31.5], lon: [120.5, 122.5], name: '上海' },
  { lat: [39.8, 40.0], lon: [116.3, 116.6], name: '北京' },
  { lat: [22.5, 24.0], lon: [113.8, 115.0], name: '深圳' },
  { lat: [30.2, 30.6], lon: [114.0, 115.0], name: '武汉' },
  { lat: [30.2, 30.4], lon: [120.0, 121.0], name: '杭州' },
  { lat: [31.8, 32.1], lon: [117.2, 118.0], name: '合肥' },
  { lat: [23.0, 23.3], lon: [113.2, 113.5], name: '广州' },
  { lat: [29.5, 29.8], lon: [106.4, 106.6], name: '重庆' },
  { lat: [31.2, 31.5], lon: [121.4, 121.6], name: '上海' },
];

function guessCityName(lat, lon) {
  for (const c of CITY_GUESS) {
    if (lat >= c.lat[0] && lat <= c.lat[1] && lon >= c.lon[0] && lon <= c.lon[1]) {
      return c.name;
    }
  }
  return null;
}

export default function App() {
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('正在获取位置…');

  const [city, setCity] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  const [weather, setWeather] = useState(null);
  const [outfit, setOutfit] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [fortuneSalt, setFortuneSalt] = useState(null);

  const [bgGradient, setBgGradient] = useState('from-violet-700 via-purple-600 to-indigo-800');

  // 分享弹窗
  const [showShareModal, setShowShareModal] = useState(false);

  // 微信分享状态
  const [wxShareStatus, setWxShareStatus] = useState({ configured: false, reason: '' });

  // 人设设置相关
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [enhancedOutfit, setEnhancedOutfit] = useState(null);

  const loadData = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      setLoadingMsg('正在获取位置…');
      const pos = await getCurrentPosition();
      setIsFallback(pos.fallback);

      let cityName = pos.city;
      if (!cityName) {
        setLoadingMsg('正在识别城市…');
        cityName = await reverseGeocode(pos.lat, pos.lon);
        // 如果逆地理编码失败，用坐标猜测城市
        if (!cityName) {
          cityName = guessCityName(pos.lat, pos.lon);
        }
      }
      setCity(cityName || `${pos.lat.toFixed(2)}, ${pos.lon.toFixed(2)}`);

      setLoadingMsg('正在获取天气数据…');
      const weatherData = await fetchWeather(pos.lat, pos.lon);
      setWeather(weatherData);

      const outfitData = getOutfitAdvice(weatherData.apparentTemperature, weatherData.weatherCode);
      setOutfit(outfitData);

      // 检查用户画像并增强穿搭推荐
      const profileComplete = !needsProfileSetup();
      setHasProfile(profileComplete);
      if (profileComplete) {
        const fortuneData = getTodayFortune(fortuneSalt);
        const enhanced = enhanceOutfit(outfitData, weatherData);
        setEnhancedOutfit(enhanced);
        setFortune(fortuneData);
        // 首次检测到已完成画像时弹出个性化提示
        if (!localStorage.getItem('ootd_profile_tip_shown') && enhanced.sceneTip) {
          localStorage.setItem('ootd_profile_tip_shown', '1');
        }
      } else {
        const fortuneData = getTodayFortune(fortuneSalt);
        setFortune(fortuneData);
        setEnhancedOutfit(outfitData);
      }

      const wi = getWeatherInfo(weatherData.weatherCode);
      setBgGradient(wi.bg);

      setStatus('success');
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || '网络异常，请检查连接后重试');
      setStatus('error');
    }
  }, [fortuneSalt]);

  // 加载完成后初始化微信分享
  useEffect(() => {
    if (status !== 'success') return;

    const setup = async () => {
      const title = buildShareTitle(weather, fortune);
      const desc = outfit
        ? `${outfit.summary} ${fortune?.color ? '幸运色' + fortune.color.name + '。' : ''}`
        : '基于实时天气的智能穿搭推荐';

      const result = await initWechatShare({ title, desc });
      setWxShareStatus(result);
    };
    setup();
  }, [status]); // eslint-disable-line

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line

  // 首次加载时检查是否需要弹出人设引导
  useEffect(() => {
    if (status === 'success' && !hasProfile) {
      // 延迟显示，让用户先看到天气加载完成
      const timer = setTimeout(() => {
        setShowProfileSetup(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, hasProfile]);

  // 人设设置完成后的回调
  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    setHasProfile(true);
    localStorage.removeItem('ootd_profile_tip_shown');
    // 重新加载数据以应用新画像
    loadData();
  };

  // 换一签
  const handleRefreshFortune = () => {
    const newSalt = String(Date.now());
    setFortuneSalt(newSalt);
    const newFortune = getTodayFortune(newSalt);
    setFortune(newFortune);
  };

  // 刷新全部
  const handleRefreshAll = () => {
    setFortuneSalt(null);
    loadData();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-8 pb-24">
        {/* Loading */}
        {status === 'loading' && <LoadingSpinner message={loadingMsg} />}

        {/* Error */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 animate-fade-in">
            <div className="glass rounded-2xl p-6 text-center max-w-sm w-full">
              <p className="text-4xl mb-3">😕</p>
              <h2 className="text-white font-semibold text-lg mb-2">出了点小问题</h2>
              <p className="text-white/60 text-sm mb-5">{errorMsg}</p>
              <button
                onClick={handleRefreshAll}
                className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition-colors active:scale-95 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                重新获取
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'success' && weather && outfit && fortune && (
          <div className="space-y-4 animate-fade-in">
            {/* 微信分享状态提示（仅在微信内且配置失败时显示，且排除无后端的情况） */}
            {isWechatBrowser() && !wxShareStatus.configured && wxShareStatus.reason &&
             !['未配置公众号签名服务', '分享服务不可用', '非微信浏览器，跳过 JSSDK'].includes(wxShareStatus.reason) && (
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-white/70">
                <AlertCircle size={13} className="text-amber-300 shrink-0" />
                {wxShareStatus.reason}
              </div>
            )}
            {isWechatBrowser() && wxShareStatus.configured && (
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-white/60">
                <CheckCircle size={13} className="text-emerald-300 shrink-0" />
                已在微信中配置自定义分享
              </div>
            )}

            {/* 日期 */}
            <div className="text-white/50 text-xs text-center pt-2 pb-1">
              {getTodayStr()} · 今日穿搭运势
            </div>

            {/* 降级提示 */}
            {isFallback && (
              <div className="glass rounded-xl px-3 py-2 text-xs text-white/60 text-center">
                定位未授权，已展示北京市天气
              </div>
            )}

            <WeatherHeader weather={weather} city={city} fallback={isFallback} />
            <OutfitCard outfit={enhancedOutfit || outfit} />
            <FortuneCard fortune={fortune} onRefresh={handleRefreshFortune} />

            {/* 操作栏 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRefreshAll}
                className="flex-1 py-3.5 rounded-2xl glass hover:bg-white/25 text-white font-medium transition-colors active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={15} />
                刷新天气
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex-1 py-3.5 rounded-2xl bg-white/25 hover:bg-white/35 text-white font-medium transition-colors active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <Share2 size={15} />
                生成本日签
              </button>
            </div>

            {/* 人设设置入口 */}
            <button
              onClick={() => setShowProfileSetup(true)}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 flex items-center justify-center gap-2 ${
                hasProfile
                  ? 'bg-amber-400/20 text-amber-200/80 hover:bg-amber-400/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <User size={14} />
              {hasProfile ? '调整我的偏好' : '✨ 让我更懂你，定制专属推荐'}
            </button>

            <div className="h-4" />
          </div>
        )}
      </div>

      {/* 分享弹窗 */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="glass rounded-3xl p-6 w-full max-w-sm mb-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-base">生成本日签</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="glass-dark rounded-2xl p-4 mb-4 text-center">
              <p className="text-5xl mb-3">{fortune?.luck?.emoji}</p>
              <p className="text-white font-bold text-lg">{fortune?.luck?.label}</p>
              <p className="text-white/70 text-sm mt-1">{fortune?.luck?.phrase}</p>
              <div className="mt-3 pt-3 border-t border-white/10 flex gap-4 justify-center text-xs text-white/60">
                <span>幸运色 · {fortune?.color?.name}</span>
                <span>今日佩戴 · {fortune?.item}</span>
              </div>
            </div>

            {/* 微信 vs 浏览器不同提示 */}
            {isWechatBrowser() ? (
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">
                  分享配置已就绪 ✨
                </p>
                <p className="text-white/40 text-xs">
                  直接点击右上角「···」分享给朋友
                </p>
              </div>
            ) : (
              <p className="text-white/60 text-sm text-center">
                📸 长按屏幕截图，分享给好友
              </p>
            )}
          </div>
        </div>
      )}

      {/* 人设设置弹窗 */}
      {showProfileSetup && (
        <ProfileSetup
          onComplete={handleProfileComplete}
          onClose={() => setShowProfileSetup(false)}
        />
      )}
    </div>
  );
}
