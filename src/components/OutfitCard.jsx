/**
 * 今日穿搭卡片
 */
import { Shirt, Tag } from 'lucide-react';

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
  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      {/* 标题行 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Shirt size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">今日穿搭灵感 OOTD</h2>
          <p className="text-white/60 text-xs mt-0.5">{outfit.summary}</p>
        </div>
      </div>

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

      {/* 风格标签 */}
      {outfit.tags && (
        <div className="flex flex-wrap gap-2 mt-4">
          {outfit.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-xs flex items-center gap-1"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
