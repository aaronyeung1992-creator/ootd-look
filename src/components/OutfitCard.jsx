/**
 * 今日穿搭卡片
 */
import { Shirt, Wand2 } from 'lucide-react';

const OUTFIT_ICONS = {
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  accessory: '👜',
};

const OUTFIT_LABELS = {
  top: '上装',
  bottom: '下装',
  shoes: '鞋履',
  accessory: '配饰',
};

export default function OutfitCard({ outfit }) {
  const hasPersonalization = outfit?.sceneTip || outfit?.colorTip || outfit?.accessoryTip;

  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      {/* 标题行 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Shirt size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">今日穿搭灵感 OOTD</h2>
          <p className="text-white/60 text-xs mt-0.5">
            {outfit.personalizedSummary || outfit.summary}
          </p>
        </div>
      </div>

      {/* 个性化推荐语 */}
      {hasPersonalization && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-400/10 to-orange-400/10 border border-amber-400/20">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 size={14} className="text-amber-300" />
            <span className="text-amber-200 text-xs font-medium">个性化建议</span>
          </div>
          {outfit.sceneTip && (
            <p className="text-white/80 text-sm mb-1">今日场景：{outfit.sceneTip}</p>
          )}
          {outfit.colorTip && (
            <p className="text-white/80 text-sm mb-1">推荐色系：{outfit.colorTip}</p>
          )}
          {outfit.accessoryTip && (
            <p className="text-white/70 text-sm">配饰建议：{outfit.accessoryTip}</p>
          )}
        </div>
      )}

      {/* 穿搭列表 */}
      <div className="space-y-3">
        {['top', 'bottom', 'shoes', 'accessory'].map((key) => (
          outfit[key] && (
            <div key={key} className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{OUTFIT_ICONS[key]}</span>
              <div>
                <span className="text-white/50 text-xs">{OUTFIT_LABELS[key]}</span>
                <p className="text-white/90 text-sm font-medium leading-snug">{outfit[key]}</p>
              </div>
            </div>
          )
        ))}
      </div>

      {/* 雨天/雪天附加提示 */}
      {outfit.rainAddon && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-amber-200 text-sm">{outfit.rainAddon}</p>
        </div>
      )}

    </div>
  );
}
