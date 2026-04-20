/**
 * 分享卡片 - 用于截图生成可保存的图片
 * 设计风格：精美日签卡片，适合发朋友圈/小红书
 */
import { forwardRef, useEffect, useRef, useState } from 'react';

const ShareCard = forwardRef(function ShareCard({ fortune, weather, city, outfit }, ref) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekStr = `星期${weekDays[today.getDay()]}`;
  const qrRef = useRef(null);
  const [qrReady, setQrReady] = useState(false);

  const luckEmoji = fortune?.luck?.emoji || '✨';
  const luckLabel = fortune?.luck?.label || '运势不错';
  const luckPhrase = fortune?.luck?.phrase || '';
  const colorName = fortune?.color?.name || '';
  const colorHex = fortune?.color?.hex || '#f59e0b';
  const mantra = fortune?.mantra || '';
  const itemName = typeof fortune?.item === 'string' ? fortune?.item : fortune?.item?.name || '';

  const temp = weather?.apparentTemperature != null ? `${Math.round(weather.apparentTemperature)}°` : '';
  const cityName = city || '';

  // 生成二维码
  useEffect(() => {
    if (!qrRef.current) return;
    let cancelled = false;
    import('qrcode').then(({ default: QRCode }) => {
      if (cancelled || !qrRef.current) return;
      QRCode.toCanvas(qrRef.current, window.location.href, {
        width: 48,
        margin: 0,
        color: { dark: '#ffffff', light: '#00000000' },
      }).then(() => {
        if (!cancelled) setQrReady(true);
      }).catch(() => {});
    });
    return () => { cancelled = true; };
  }, []);

  // 今日穿搭主题
  const outfitSummary = outfit?.summary || outfit?.scene || '';
  const outfitItems = outfit?.items || [];

  return (
    <div
      ref={ref}
      style={{
        width: '375px',
        background: 'linear-gradient(145deg, #4c1d95 0%, #5b21b6 30%, #312e81 70%, #1e1b4b 100%)',
        borderRadius: '24px',
        padding: '32px 28px',
        fontFamily: '"PingFang SC", "Helvetica Neue", Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        boxSizing: 'border-box',
      }}
    >
      {/* 背景装饰光晕 */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '180px', height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-40px',
        width: '220px', height: '220px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* 顶部：App名 + 日期 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '2px', color: '#fff' }}>OOTD</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>今日穿搭运势</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{dateStr}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{weekStr} {cityName && `· ${cityName}`} {temp && `· ${temp}`}</div>
        </div>
      </div>

      {/* 主运势区 */}
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '18px',
        padding: '24px',
        marginBottom: '16px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '52px', marginBottom: '12px', lineHeight: '1' }}>{luckEmoji}</div>
        <div style={{ fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{luckLabel}</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '16px' }}>{luckPhrase}</div>

        {/* 幸运色 + 今日佩戴 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: colorHex,
              boxShadow: `0 0 8px ${colorHex}80`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>幸运色 · {colorName}</span>
          </div>
          {itemName && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
              今日佩戴 · {itemName}
            </div>
          )}
        </div>
      </div>

      {/* 今日穿搭区 */}
      {(outfitSummary || outfitItems.length > 0) && (
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px' }}>👗</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500', letterSpacing: '0.5px' }}>TODAY'S OUTFIT</span>
          </div>
          {outfitSummary && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: outfitItems.length > 0 ? '10px' : '0', lineHeight: '1.5' }}>
              {outfitSummary}
            </div>
          )}
          {outfitItems.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {outfitItems.slice(0, 4).map((item, i) => (
                <span key={i} style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '3px 10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  {item.emoji} {item.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 每日金句 */}
      {mantra && (
        <div style={{
          borderLeft: `3px solid ${colorHex}`,
          paddingLeft: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', fontStyle: 'italic' }}>
            「{mantra}」
          </div>
        </div>
      )}

      {/* 底部：邀请语 + 二维码占位 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>扫码看你的今日运势</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>ootd-fortune.netlify.app</div>
        </div>
        {/* 二维码 */}
        <div style={{
          width: '54px', height: '54px',
          background: '#fff',
          borderRadius: '8px',
          padding: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <canvas ref={qrRef} style={{ width: '48px', height: '48px', display: 'block' }} />
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
