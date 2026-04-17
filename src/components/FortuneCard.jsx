/**
 * 今日运势卡片
 */
import { Sparkles, RefreshCw, MessageCircle } from 'lucide-react';

/**
 * 渲染星级
 */
function StarRating({ count, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-sm ${i < count ? 'text-yellow-300' : 'text-white/20'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function FortuneCard({ fortune, onRefresh }) {
  const { luck, color, item, numbers, mantra } = fortune;

  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <h2 className="text-white font-semibold text-base">今日能量指南</h2>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 text-xs active:scale-95"
        >
          <RefreshCw size={12} />
          换一签
        </button>
      </div>

      {/* 主内容区 */}
      <div className="flex items-start gap-4">
        {/* 左侧：幸运色圆形色块 */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div
            className="w-14 h-14 rounded-full shadow-lg border-2 border-white/20 flex items-center justify-center text-2xl"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {luck.emoji}
          </div>
          <span className="text-white/60 text-xs font-medium">{color.name}</span>
        </div>

        {/* 右侧：运势等级 + 短句 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-lg">{luck.label}</span>
            <StarRating count={luck.stars} />
          </div>
          <p className="text-white font-medium text-sm mb-2">{luck.phrase}</p>
          <p className="text-white/50 text-xs">{mantra}</p>
        </div>
      </div>

      {/* 宜/忌 模块 */}
      {luck.scene && luck.avoid && (
        <div className="mt-3 p-3 rounded-xl bg-white/5">
          <p className="text-white/80 text-xs mb-1">{luck.scene}</p>
          <p className="text-white/40 text-xs">{luck.avoid}</p>
        </div>
      )}

      {/* 幸运色解读 */}
      {color.desc && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color.bg }}
          />
          <span className="text-white/60">{color.desc}</span>
        </div>
      )}

      {/* 底部：幸运饰品 + 幸运数字 */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="text-base">📿</span>
          <div>
            <p className="text-white/50 text-xs">今日佩戴</p>
            <p className="text-white/90 text-xs font-medium">
              {typeof item === 'string' ? item : item.name}
              {typeof item === 'object' && item.desc && (
                <span className="text-white/50 font-normal ml-1">— {item.desc}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔢</span>
          <div>
            <p className="text-white/50 text-xs">幸运数字</p>
            <p className="text-white/90 text-xs font-medium">
              {Array.isArray(numbers) ? numbers.join('、') : numbers.join('、')}
              {numbers.desc && (
                <span className="text-white/50 font-normal ml-1">— {numbers.desc}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 社交货币提示 */}
      <div className="mt-3 flex items-center gap-1.5 text-white/40 text-xs">
        <MessageCircle size={12} />
        <span>分享给朋友，一起沾沾好运</span>
      </div>
    </div>
  );
}
