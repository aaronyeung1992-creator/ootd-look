/**
 * 用户画像服务
 * 使用 localStorage 存储用户人设标签，无需后端
 */

const PROFILE_KEY = 'ootd_user_profile';
const PROFILE_VERSION = 1;

// 标签定义
export const PROFILE_OPTIONS = {
  // ① 场景偏好（单选）
  scene: {
    label: '今日场景',
    type: 'single',
    options: [
      { id: 'commute', label: '通勤开会', icon: '💼', desc: '职场正式感' },
      { id: 'weekend', label: '周末遛娃', icon: '👶', desc: '带娃出行首选' },
      { id: 'date', label: '约会逛街', icon: '💕', desc: '好看又舒适' },
      { id: 'home', label: '居家休闲', icon: '🏠', desc: '放松无负担' },
    ],
  },

  // ② 身形修饰（多选）
  body: {
    label: '身形修饰',
    type: 'multi',
    options: [
      { id: 'pear', label: '梨形遮胯', icon: '🍐' },
      { id: 'apple', label: '苹果遮肚', icon: '🍎' },
      { id: 'short', label: '小个子显高', icon: '📏' },
      { id: 'broad', label: '肩宽修饰', icon: '🎯' },
      { id: 'legs', label: '腿型修饰', icon: '🦵' },
    ],
  },

  // ③ 色彩风格（单选）
  colorStyle: {
    label: '色彩偏好',
    type: 'single',
    options: [
      { id: 'minimal', label: '黑白灰禁欲', icon: '⚫', desc: '极简高级感' },
      { id: 'earth', label: '美拉德大地', icon: '🟤', desc: '温暖有层次' },
      { id: 'vivid', label: '多巴胺亮色', icon: '🌈', desc: '活泼回头率' },
      { id: 'muted', label: '莫兰迪中性', icon: '🎨', desc: '温柔高级' },
    ],
  },

  // ④ 穿衣习惯（单选）
  habit: {
    label: '穿衣习惯',
    type: 'single',
    options: [
      { id: 'lazy', label: '懒人百搭', icon: '😴', desc: '随手穿都好看' },
      { id: 'elaborate', label: '精致全套', icon: '✨', desc: '细节到位' },
      { id: 'layer', label: '叠穿层次', icon: '🧣', desc: '有型又有趣' },
      { id: 'sporty', label: '舒适运动', icon: '🏃', desc: '动起来无压力' },
    ],
  },

  // ⑤ 性别（单选）
  gender: {
    label: '你的性别',
    type: 'single',
    options: [
      { id: 'male', label: '男', icon: '👨' },
      { id: 'female', label: '女', icon: '👩' },
      { id: 'neutral', label: '中性', icon: '🧑' },
    ],
  },

  // ⑥ 生日（选填，用于精准运势）
  birthday: {
    label: '你的生日（选填）',
    desc: '填了生日，运势会更准哦~',
    type: 'birthday',
  },
};

// 默认空画像
function getEmptyProfile() {
  return {
    version: PROFILE_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    answers: {
      scene: null,
      body: [],
      colorStyle: null,
      habit: null,
      gender: null,
      birthday: null, // 新增：生日
    },
    completed: false, // 是否完成初次设置
  };
}

/**
 * 根据生日计算星座
 */
export function getZodiacFromBirthday(birthday) {
  if (!birthday) return null;
  const month = parseInt(birthday.split('-')[1]);
  const day = parseInt(birthday.split('-')[2]);

  const zodiacs = [
    [20, '魔羯座'], [19, '水瓶座'], [20, '双鱼座'],
    [20, '白羊座'], [20, '金牛座'], [21, '双子座'],
    [22, '巨蟹座'], [22, '狮子座'], [22, '处女座'],
    [22, '天秤座'], [22, '天蝎座'], [21, '射手座'],
    [21, '魔羯座'],
  ];

  return zodiacs[month - 1][day <= zodiacs[month - 1][0] ? 0 : 1];
}

/**
 * 根据生日计算属相
 */
export function getChineseZodiac(birthday) {
  if (!birthday) return null;
  const year = parseInt(birthday.split('-')[0]);
  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  return animals[(year - 1900) % 12];
}

/**
 * 获取用户画像
 */
export function getProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return getEmptyProfile();

    const profile = JSON.parse(stored);
    // 版本迁移检查
    if (profile.version !== PROFILE_VERSION) {
      return getEmptyProfile();
    }
    return profile;
  } catch {
    return getEmptyProfile();
  }
}

/**
 * 保存用户画像
 */
export function saveProfile(answers) {
  const profile = {
    ...getEmptyProfile(),
    ...answers,
    updatedAt: Date.now(),
    completed: true,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * 更新单个答案
 */
export function updateProfileAnswer(key, value) {
  const profile = getProfile();
  profile.answers[key] = value;
  profile.updatedAt = Date.now();
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * 检查是否需要展示引导
 */
export function needsProfileSetup() {
  const profile = getProfile();
  return !profile.completed;
}

/**
 * 获取当前进度（已回答的问题数）
 */
export function getProfileProgress() {
  const profile = getProfile();
  const { answers } = profile;
  let answered = 0;
  const total = Object.keys(PROFILE_OPTIONS).length;

  for (const [key, option] of Object.entries(PROFILE_OPTIONS)) {
    const value = answers[key];
    if (option.type === 'multi') {
      if (Array.isArray(value) && value.length > 0) answered++;
    } else {
      if (value) answered++;
    }
  }

  return { answered, total };
}

/**
 * 重置画像
 */
export function resetProfile() {
  localStorage.removeItem(PROFILE_KEY);
}
