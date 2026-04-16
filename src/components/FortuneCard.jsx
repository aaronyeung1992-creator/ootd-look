/**
 * 今日运势卡片
 */
import { Sparkles, RefreshCw } from 'lucide-react';

/**
 * 渲染星级
 */
function StarRating({ count, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-base ${i < count ? 'text-yellow-300' : 'text-white/20'}`}>
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
      <div className="flex items-center gap-4">
        {/* 左侧：幸运色圆形色块 */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div
            className="w-16 h-16 rounded-full shadow-lg border-2 border-white/20 flex items-center justify-center text-2xl"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {luck.emoji}
          </div>
          <span className="text-white/50 text-xs">{color.name}</span>
        </div>

        {/* 中间：运势等级 + 短句 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-xl">{luck.label}</span>
            <StarRating count={luck.stars} />
          </div>
          <p className="text-white/70 text-sm leading-relaxed">{mantra}</p>
          <p className="text-white/50 text-xs mt-1 italic">{luck.phrase}</p>
        </div>
      </div>

      {/* 底部：幸运饰品 + 幸运数字 */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="text-base">📿</span>
          <span className="text-white/70 text-xs">
            今日佩戴 <span className="text-white/90 font-medium">{item}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔢</span>
          <span className="text-white/70 text-xs">
            幸运数字 <span className="text-white/90 font-medium">{numbers.join('、')}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
