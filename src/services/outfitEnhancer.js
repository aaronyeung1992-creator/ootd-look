/**
 * 穿搭增强逻辑
 * 根据用户人设标签 + 天气 + 运势，增强穿搭推荐
 */
import { getProfile } from './profile';

// 场景对应的穿搭关键词
const SCENE_CONFIGS = {
  commute: {
    keyword: '职场通勤',
    vibe: '干练得体',
    top: ['衬衫', '针织衫', '西装外套'],
    bottom: ['西裤', '直筒裤', 'A字裙'],
    avoid: ['运动背心', '破洞牛仔', '居家服'],
  },
  weekend: {
    keyword: '周末遛娃',
    vibe: '舒适自在',
    top: ['卫衣', 'T恤', '休闲针织衫'],
    bottom: ['牛仔裤', '运动裤', '休闲裤'],
    avoid: ['高跟鞋', '正装', '复杂配饰'],
  },
  date: {
    keyword: '约会逛街',
    vibe: '精致有型',
    top: ['设计感上衣', '精致针织衫', '连衣裙'],
    bottom: ['牛仔裤', '半身裙', '修身裤'],
    avoid: ['居家服', '运动服', '太过正式'],
  },
  home: {
    keyword: '居家休闲',
    vibe: '放松舒适',
    top: ['居家服', '宽松T恤', '卫衣'],
    bottom: ['居家裤', '运动短裤', '宽松裤'],
    avoid: ['正装', '高跟鞋', '复杂配饰'],
  },
};

// 身形修饰对应的颜色和款式建议
const BODY_CONFIGS = {
  pear: {
    desc: '扬长避短：突出上半身，修饰下半身',
    highlight: ['上装设计感', '收腰款', 'A字裙'],
    hide: ['紧身裤', '浅色下装', '复杂下装'],
    colors: { top: '饱和度高', bottom: '深色/暗色' },
  },
  apple: {
    desc: '扬长避短：遮住腹部，优化比例',
    highlight: ['V领', 'A字连衣裙', '高腰裤'],
    hide: ['紧身衣', '高腰紧身', '横向条纹'],
    colors: { top: '深色/冷色', bottom: '中性质感' },
  },
  short: {
    desc: '显高秘籍：优化比例，拉长线条',
    highlight: ['短款上衣', '高腰裤/裙', '同色系搭配'],
    hide: ['中长款外套', '低腰裤', '宽大款式'],
    colors: { top: '简洁', bottom: '高腰/纯色' },
  },
  broad: {
    desc: '平衡肩宽：视觉收缩肩部',
    highlight: ['V领/U领', '深色上衣', '垂感面料'],
    hide: ['垫肩', '泡泡袖', '横条纹'],
    colors: { top: '深色/V领', bottom: '亮色/浅色' },
  },
  legs: {
    desc: '修饰腿型：隐藏缺点，突出优点',
    highlight: ['直筒裤', '阔腿裤', '长裙'],
    hide: ['紧身裤', '短裤', '复杂图案'],
    colors: { all: '纯色/暗色' },
  },
};

// 色彩风格对应的色板
const COLOR_CONFIGS = {
  minimal: {
    label: '黑白灰禁欲系',
    colors: ['黑色', '白色', '灰色', '深蓝', '藏青'],
    accent: '金色/银色配饰',
  },
  earth: {
    label: '美拉德大地色',
    colors: ['驼色', '焦糖色', '棕色', '卡其', '米白'],
    accent: '金色/铜色配饰',
  },
  vivid: {
    label: '多巴胺亮色',
    colors: ['黄色', '橙色', '粉色', '绿色', '蓝色'],
    accent: '彩虹/多色混搭',
  },
  muted: {
    label: '莫兰迪中性',
    colors: ['雾霾蓝', '灰粉', '燕麦色', '灰绿', '奶茶色'],
    accent: '珍珠/玫瑰金配饰',
  },
};

// 穿衣习惯对应的搭配风格
const HABIT_CONFIGS = {
  lazy: {
    label: '懒人百搭',
    style: '一件搞定，适合快节奏',
    formula: '基础款 + 1件亮色单品',
  },
  elaborate: {
    label: '精致全套',
    style: '从头到脚都有细节',
    formula: '配饰呼应 + 层次感 + 质感面料',
  },
  layer: {
    label: '叠穿层次',
    style: '内薄外厚，色块分明',
    formula: '打底 + 中层 + 外套 + 细节',
  },
  sporty: {
    label: '舒适运动',
    style: '动起来无压力',
    formula: '运动套装 + 休闲鞋 + 功能配饰',
  },
};

/**
 * 根据用户画像增强穿搭推荐
 * @param {Object} outfit - 原始穿搭推荐
 * @param {Object} weather - 天气数据
 * @returns {Object} 增强后的穿搭
 */
export function enhanceOutfit(outfit, weather) {
  const profile = getProfile();

  // 如果没有完成画像，返回原始穿搭
  if (!profile.completed) {
    return {
      ...outfit,
      tags: [...(outfit.tags || []), '通用推荐'],
    };
  }

  const { answers } = profile;
  let enhancedOutfit = { ...outfit };
  let tips = [];
  let tags = [...(outfit.tags || [])];

  // 1. 融入场景关键词
  if (answers.scene && SCENE_CONFIGS[answers.scene]) {
    const sceneConfig = SCENE_CONFIGS[answers.scene];
    tips.push(`今日场景：${sceneConfig.keyword} — ${sceneConfig.vibe}`);
    tags.push(sceneConfig.keyword);
    enhancedOutfit.sceneTip = sceneConfig.keyword;
  }

  // 2. 融入身形修饰建议
  if (answers.body && answers.body.length > 0) {
    const bodyTips = answers.body
      .map(b => BODY_CONFIGS[b]?.desc)
      .filter(Boolean);
    if (bodyTips.length > 0) {
      tips.push(...bodyTips);
    }
    tags.push(...answers.body.map(b => BODY_CONFIGS[b]?.label || b));
  }

  // 3. 融入色彩风格
  if (answers.colorStyle && COLOR_CONFIGS[answers.colorStyle]) {
    const colorConfig = COLOR_CONFIGS[answers.colorStyle];
    tips.push(`今日色系：${colorConfig.label}`);
    tips.push(`推荐配饰：${colorConfig.accent}`);
    tags.push(colorConfig.label);

    enhancedOutfit.colorTip = colorConfig.colors.slice(0, 3).join(' / ');
    enhancedOutfit.accessoryTip = colorConfig.accent;
  }

  // 4. 融入穿衣习惯
  if (answers.habit && HABIT_CONFIGS[answers.habit]) {
    const habitConfig = HABIT_CONFIGS[answers.habit];
    tips.push(`搭配公式：${habitConfig.formula}`);
    tags.push(habitConfig.label);
  }

  // 5. 生成综合推荐语
  const summaryParts = [];
  if (enhancedOutfit.sceneTip) {
    summaryParts.push(enhancedOutfit.sceneTip);
  }
  if (enhancedOutfit.colorTip) {
    summaryParts.push(enhancedOutfit.colorTip);
  }
  enhancedOutfit.personalizedSummary = summaryParts.join(' · ');

  enhancedOutfit.tips = tips;
  enhancedOutfit.tags = [...new Set(tags)];

  return enhancedOutfit;
}

/**
 * 获取每日推荐色系（基于运势）
 */
export function getLuckColors(fortune = '') {
  const luckMap = {
    lucky: ['金色', '绿色', '白色'],
    wealth: ['金色', '黄色', '紫色'],
    love: ['粉色', '红色', '玫瑰金'],
    career: ['蓝色', '灰色', '黑色'],
    health: ['绿色', '白色', '浅蓝'],
  };

  const lowerFortune = fortune.toLowerCase();
  for (const [key, colors] of Object.entries(luckMap)) {
    if (lowerFortune.includes(key)) {
      return colors;
    }
  }
  return ['白色', '米色', '浅蓝'];
}

/**
 * 生成个性化穿搭报告
 */
export function generateOutfitReport(weather, fortune) {
  const profile = getProfile();
  if (!profile.completed) return null;

  const { answers } = profile;
  return {
    scene: answers.scene ? SCENE_CONFIGS[answers.scene] : null,
    body: answers.body?.map(b => BODY_CONFIGS[b]) || [],
    color: answers.colorStyle ? COLOR_CONFIGS[answers.colorStyle] : null,
    habit: answers.habit ? HABIT_CONFIGS[answers.habit] : null,
    luckColors: getLuckColors(fortune?.keyword || ''),
  };
}
