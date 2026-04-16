/**
 * 运势服务：基于日期种子的伪随机运势生成
 * 同一天内结果稳定，刷新不变
 */

const LUCK_LEVELS = [
  { label: '大吉', stars: 5, emoji: '🌟', phrase: '今日诸事皆宜，乘势而为。' },
  { label: '吉', stars: 4, emoji: '✨', phrase: '整体顺遂，温和行事，好事自来。' },
  { label: '平', stars: 3, emoji: '🌿', phrase: '平静如水，不急不躁，守住当下。' },
  { label: '小凶', stars: 2, emoji: '🌙', phrase: '今日宜温柔，忌冲动，低调行事。' },
  { label: '不宜出门', stars: 1, emoji: '🌑', phrase: '能量内敛，休养为上，多喝热水。' },
];

const LUCKY_COLORS = [
  { name: '玫瑰红', bg: '#E91E63', text: 'white' },
  { name: '珊瑚橙', bg: '#FF7043', text: 'white' },
  { name: '天空蓝', bg: '#2196F3', text: 'white' },
  { name: '翡翠绿', bg: '#4CAF50', text: 'white' },
  { name: '薰衣草紫', bg: '#9C27B0', text: 'white' },
  { name: '珍珠白', bg: '#F5F5F5', text: '#333' },
  { name: '柠檬黄', bg: '#FFC107', text: '#333' },
  { name: '烟灰蓝', bg: '#607D8B', text: 'white' },
];

const LUCKY_ITEMS = [
  '一条珍珠手链',
  '一枚转运珠手串',
  '编织红绳手绳',
  '蓝晶石项链',
  '银质耳环',
  '玛瑙戒指',
  '翡翠吊坠',
  '粉晶发夹',
];

const LUCKY_NUMBERS = [
  [3, 8],
  [6, 9],
  [1, 7],
  [2, 5],
  [4, 6],
  [7, 8],
  [1, 3],
  [5, 9],
];

const REFRESH_MANTRAS = [
  '花开自有时，今日独特。',
  '每一天都是全新的礼物。',
  '宇宙在你身边，静待绽放。',
  '慢下来，感受今日能量。',
  '内心笃定，万物皆顺。',
];

/**
 * 简单字符串哈希，生成稳定整数种子
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 转为 32 位整数
  }
  return Math.abs(hash);
}

/**
 * 基于日期（+ 可选盐值）生成今日运势
 * @param {string|null} salt 可选盐值（用于"换一签"功能）
 */
export function getTodayFortune(salt = null) {
  const today = new Date();
  const dateStr =
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, '0')}-` +
    `${String(today.getDate()).padStart(2, '0')}`;

  const seed = hashString(salt ? `${dateStr}-${salt}` : dateStr);

  const luck = LUCK_LEVELS[seed % LUCK_LEVELS.length];
  const color = LUCKY_COLORS[seed % LUCKY_COLORS.length];
  const item = LUCKY_ITEMS[(seed >> 3) % LUCKY_ITEMS.length];
  const numbers = LUCKY_NUMBERS[(seed >> 5) % LUCKY_NUMBERS.length];
  const mantra = REFRESH_MANTRAS[(seed >> 7) % REFRESH_MANTRAS.length];

  return {
    dateStr,
    luck,
    color,
    item,
    numbers,
    mantra,
  };
}
