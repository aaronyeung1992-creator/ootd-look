/**
 * 运势服务：基于日期种子的伪随机运势生成
 * 同一天内结果稳定，刷新不变
 */

// 运势等级 + 文案（更有梗、场景化）
const LUCK_LEVELS = [
  {
    label: '大吉',
    stars: 5,
    emoji: '🌟',
    phrase: '今天的你，气场两米八',
    scene: '宜：主动出击，老板问方案你就刚好做完了',
    avoid: '忌：太嘚瑟，小心被夸得不好意思'
  },
  {
    label: '吉',
    stars: 4,
    emoji: '✨',
    phrase: '好事正在排队来找你',
    scene: '宜：约人、表白、买下午茶',
    avoid: '忌：宅家里错过好运'
  },
  {
    label: '平',
    stars: 3,
    emoji: '🌿',
    phrase: '普通的日子，也有小确幸',
    scene: '宜：保持节奏，稳扎稳打',
    avoid: '忌：想太多，简单点就很好'
  },
  {
    label: '小凶',
    stars: 2,
    emoji: '🌙',
    phrase: '今天是低调发育的一天',
    scene: '宜：少说话多做事，戴个口罩假装在思考',
    avoid: '忌：和杠精讲道理'
  },
  {
    label: '不宜出门',
    stars: 1,
    emoji: '🌑',
    phrase: '今天的主角不是你，是你的床',
    scene: '宜：在家里躺着当咸鱼',
    avoid: '忌：硬撑着出门，在外面也没状态'
  },
];

// 幸运色 + 场景描述（更有画面感）
const LUCKY_COLORS = [
  { name: '玫瑰红', desc: '今天戴这个出门，会有人夸你气色好', bg: '#E91E63', text: 'white' },
  { name: '珊瑚橙', desc: '暖色调加持，整个人都在发光', bg: '#FF7043', text: 'white' },
  { name: '天空蓝', desc: '清爽感拉满，看你的人都觉得舒服', bg: '#2196F3', text: 'white' },
  { name: '翡翠绿', desc: '这颜色自带好运buff，信不信由你', bg: '#4CAF50', text: 'white' },
  { name: '薰衣草紫', desc: '神秘又温柔，今天适合做氛围感美人', bg: '#9C27B0', text: 'white' },
  { name: '珍珠白', desc: '干净利落，低调的高级感', bg: '#F5F5F5', text: '#333' },
  { name: '柠檬黄', desc: '点亮自己，也点亮身边人的心情', bg: '#FFC107', text: '#333' },
  { name: '烟灰蓝', desc: '沉稳又特别，懂的人自然会注意到', bg: '#607D8B', text: 'white' },
];

// 幸运配饰 + 具体描述
const LUCKY_ITEMS = [
  { name: '珍珠手链', desc: '举手投足间有小优雅' },
  { name: '转运红绳', desc: '老祖宗的智慧，信则有' },
  { name: '蓝晶石项链', desc: '沉静气质，今天需要你稳住' },
  { name: '银质耳环', desc: '小细节，今天会被人注意到' },
  { name: '玉坠吊牌', desc: '温润如玉，今天要温柔待人' },
  { name: '发夹/发圈', desc: '头发也要有运气，小配件大讲究' },
  { name: '编织手绳', desc: '手上有颜色，今天话多有人听' },
  { name: '简约戒指', desc: '手上有点东西，今天思路清晰' },
];

// 幸运数字 + 暗示
const LUCKY_NUMBERS = [
  { nums: [3, 8], desc: '买奶茶选第三档，刚刚好' },
  { nums: [6, 9], desc: '抽奖箱里选第六个，中奖率高' },
  { nums: [1, 7], desc: '今天在群里发1.7元手气最佳' },
  { nums: [2, 5], desc: '下午两点五十的咖啡格外香' },
  { nums: [4, 6], desc: '选66号座位，今天视野最好' },
  { nums: [7, 8], desc: '车牌尾号带7或8，今天一路顺' },
  { nums: [1, 3], desc: '点外卖凑13元减3元最划算' },
  { nums: [5, 9], desc: '今天走59路公交会有奇遇' },
];

// 换签时的咒语
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
    hash |= 0;
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

/**
 * 根据生日计算星座
 */
export function getZodiacFromBirthday(month, day) {
  const zodiacSigns = [
    { name: '白羊座', start: [3, 21], end: [4, 19] },
    { name: '金牛座', start: [4, 20], end: [5, 20] },
    { name: '双子座', start: [5, 21], end: [6, 21] },
    { name: '巨蟹座', start: [6, 22], end: [7, 22] },
    { name: '狮子座', start: [7, 23], end: [8, 22] },
    { name: '处女座', start: [8, 23], end: [9, 22] },
    { name: '天秤座', start: [9, 23], end: [10, 23] },
    { name: '天蝎座', start: [10, 24], end: [11, 22] },
    { name: '射手座', start: [11, 23], end: [12, 21] },
    { name: '摩羯座', start: [12, 22], end: [1, 19] },
    { name: '水瓶座', start: [1, 20], end: [2, 18] },
    { name: '双鱼座', start: [2, 19], end: [3, 20] },
  ];

  for (const sign of zodiacSigns) {
    const [startM, startD] = sign.start;
    const [endM, endD] = sign.end;

    if (month === startM && day >= startD) return sign.name;
    if (month === endM && day <= endD) return sign.name;
  }
  return '白羊座';
}

/**
 * 根据出生年计算属相
 */
export function getChineseZodiac(year) {
  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const baseYear = 1900;
  const offset = (year - baseYear) % 12;
  return animals[offset >= 0 ? offset : offset + 12];
}
