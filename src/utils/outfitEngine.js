/**
 * 穿搭规则引擎
 * 根据体感温度 + 天气代码 + 性别 -> 生成今日穿搭建议
 */

import { isPrecipitation, isSnow } from './weatherCodeMap.js';

// 男装选项库
const MALE_TOPS = ['圆领卫衣', 'polo衫', '长袖衬衫', '休闲西装外套', '连帽衫', '针织开衫'];
const MALE_BOTTOMS = ['直筒牛仔裤', '卡其休闲裤', '运动长裤', '工装裤', '亚麻长裤'];
const MALE_SHOES = ['小白鞋', '帆布鞋', '运动鞋', '乐福鞋', '沙漠靴', '马丁靴'];
const MALE_ACCESSORIES = ['棒球帽', '皮质钱包', '简约皮带', '智能手表', '双肩包', '墨镜'];

const FEMALE_TOPS = ['针织开衫', '法式衬衫', '娃娃领上衣', '卫衣', '吊带背心', '薄款西装'];
const FEMALE_BOTTOMS = ['A字裙', '百褶裙', '直筒牛仔裤', '阔腿裤', '碎花裙', '西装裤'];
const FEMALE_SHOES = ['小白鞋', '乐福鞋', '玛丽珍鞋', '帆布鞋', '细带凉鞋', '芭蕾鞋'];
const FEMALE_ACCESSORIES = ['珍珠耳钉', '丝巾', 'mini链条包', '发箍', '手链', '草编包'];

const NEUTRAL_TOPS = ['短袖 / 吊带背心 / 无袖衬衫', '长袖衬衫 / 薄款卫衣', '卫衣 / 针织开衫'];
const NEUTRAL_BOTTOMS = ['短裤 / 短裙', '宽松牛仔裤 / 休闲长裤', '直筒裤 / A字裙'];
const NEUTRAL_SHOES = ['帆布鞋 / 乐福鞋', '运动鞋', '凉鞋 / 拖鞋'];
const NEUTRAL_ACCESSORIES = ['薄外套备在包里', '防晒衣备用', '遮阳帽', '墨镜'];

/**
 * 简单哈希函数，用日期做种子，每天固定结果
 */
function hashSeeded(seed, index) {
  const str = `${seed}-${index}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 获取今日日期字符串（用于每日不同推荐）
 */
function getTodaySeed() {
  const d = new Date();
  return `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`;
}

const OUTFIT_RULES = [
  {
    maxTemp: 5,
    male: {
      top: ['加厚羽绒服 + 保暖内搭', '派克大衣 + 羊绒衫', '工装羽绒服 + 抓绒内胆'],
      bottom: ['加绒冲锋裤', '厚棉裤 + 保暖内衣'],
      shoes: ['雪地靴', '加绒马丁靴', '户外保暖靴'],
      accessory: ['围巾 + 手套 + 毛线帽', '保暖耳罩 + 口罩', '加绒围巾'],
      summary: '❄️ 极寒天气，从里到外全副武装',
      tags: ['保暖优先', '户外防冻', '叠穿大法'],
    },
    female: {
      top: ['及膝羽绒服 + 高领毛衣', '羊羔毛外套 + 针织衫', '派克大衣 + 保暖打底'],
      bottom: ['加绒打底裤', '厚呢子裙 + 保暖袜'],
      shoes: ['雪地靴', '加绒短靴', '毛毛拖（室内）'],
      accessory: [' oversized 围巾', '雷锋帽', '发热保暖内衣'],
      summary: '❄️ 极寒天气，保暖是今日穿搭的第一要义',
      tags: ['保暖优先', '优雅过冬', '暖色调搭配'],
    },
  },
  {
    maxTemp: 10,
    male: {
      top: ['摇粒绒外套 + 打底毛衣', '轻薄羽绒服 + 针织衫', '工装夹克 + 高领衫'],
      bottom: ['直筒休闲裤', '厚牛仔裤', '保暖长裤'],
      shoes: ['马丁靴', '复古运动鞋', '麂皮沙漠靴'],
      accessory: ['薄围巾', '冷帽', '简约背包'],
      summary: '🧥 天凉了，叠穿保暖又时髦',
      tags: ['叠穿达人', '秋冬通勤', '日系慵懒'],
    },
    female: {
      top: ['针织开衫 + 打底衫', '西装外套 + 针织衫', '短款大衣 + 高领毛衣'],
      bottom: ['百褶裙 + 保暖袜', '阔腿裤', 'A字裙 + 光腿神器'],
      shoes: ['乐福鞋', '切尔西短靴', '芭蕾鞋'],
      accessory: ['针织围巾', '贝雷帽', 'mini包'],
      summary: '🧥 微凉时节，层次感叠穿更出彩',
      tags: ['通勤优雅', '韩系叠穿', '知性美'],
    },
  },
  {
    maxTemp: 15,
    male: {
      top: ['卫衣 / 针织开衫', '复古棒球服', '工装衬衫外套'],
      bottom: ['宽松牛仔裤', '休闲长裤', '卡其裤'],
      shoes: ['小白鞋', '帆布鞋', '复古跑鞋'],
      accessory: ['棒球帽', '双肩包', '简约手环'],
      summary: '🌤️ 微凉舒适，轻薄叠穿刚刚好',
      tags: ['轻松随意', '百搭基础', '春秋必备'],
    },
    female: {
      top: ['针织开衫', '卫衣 + 衬衫叠穿', '薄款风衣'],
      bottom: ['牛仔裤', '百褶裙', '阔腿西裤'],
      shoes: ['小白鞋', '乐福鞋', '玛丽珍鞋'],
      accessory: ['丝巾', '草编包', '发箍'],
      summary: '🌤️ 微凉舒适，薄外套随时备用',
      tags: ['轻盈感', '法式简约', '约会通勤'],
    },
  },
  {
    maxTemp: 20,
    male: {
      top: ['长袖衬衫', '薄款卫衣', '亚麻衬衫'],
      bottom: ['直筒裤', '卡其裤', '轻薄长裤'],
      shoes: ['帆布鞋', '乐福鞋', '小白鞋'],
      accessory: ['简约皮带', '手表', '双肩包'],
      summary: '🌸 温度宜人，穿出轻盈感',
      tags: ['通勤', '约会', '简约'],
    },
    female: {
      top: ['法式衬衫', '针织衫', '薄款针织开衫'],
      bottom: ['A字裙', '直筒牛仔裤', '碎花裙'],
      shoes: ['玛丽珍鞋', '芭蕾鞋', '帆布鞋'],
      accessory: ['珍珠耳钉', '链条包', '发箍'],
      summary: '🌸 温度宜人，春日感穿搭上线',
      tags: ['法式优雅', '通勤', '约会必备'],
    },
  },
  {
    maxTemp: 25,
    male: {
      top: ['短袖T恤', ' polo衫', '亚麻短袖衬衫'],
      bottom: ['薄款长裤', '运动短裤', '卡其短裤'],
      shoes: ['运动鞋', '帆布鞋', '凉鞋'],
      accessory: ['棒球帽', '太阳镜', '运动手表'],
      summary: '☀️ 舒爽初夏，随意搭配都好看',
      tags: ['夏日清爽', '约会出行', '运动风'],
    },
    female: {
      top: ['短袖T恤', 'crop top', '薄款吊带'],
      bottom: ['短裙', '短裤', '轻薄连衣裙'],
      shoes: ['凉鞋', '小白鞋', '帆布鞋'],
      accessory: ['防晒衣', '草编帽', '夏日草编包'],
      summary: '☀️ 初夏感来了，清爽为主',
      tags: ['夏日清爽', '约会出行', '甜酷风'],
    },
  },
  {
    maxTemp: Infinity,
    male: {
      top: ['透气短袖', '凉感背心', '速干T恤'],
      bottom: ['短裤', '薄款运动裤', '亚麻短裤'],
      shoes: ['凉鞋', '拖鞋', '透气运动鞋'],
      accessory: ['防晒衣 + 遮阳帽', '墨镜', '冰袖'],
      summary: '🌞 高温警报，防晒是硬道理',
      tags: ['防晒必备', '清凉出行', '夏日极简'],
    },
    female: {
      top: ['吊带背心', '凉感T恤', '露肩上衣'],
      bottom: ['短裙', '热裤', '轻薄长裙'],
      shoes: ['细带凉鞋', '人字拖', '罗马凉鞋'],
      accessory: ['防晒衣 + 遮阳帽', '墨镜', '大容量帆布包'],
      summary: '🌞 高温警报，清凉与防晒兼顾',
      tags: ['防晒必备', '清凉出行', '夏日美式'],
    },
  },
];

/**
 * 根据体感温度和天气代码获取穿搭建议
 * @param {number} apparentTemp 体感温度
 * @param {number} weatherCode WMO 天气代码
 * @param {string} gender 性别：'male' | 'female' | 'neutral'
 * @returns {Object} 穿搭建议对象
 */
export function getOutfitAdvice(apparentTemp, weatherCode, gender = 'neutral') {
  const rule = OUTFIT_RULES.find((r) => apparentTemp < r.maxTemp);
  const outfitData = rule || OUTFIT_RULES[OUTFIT_RULES.length - 1];

  // 根据性别选择对应的穿搭库
  const genderData = outfitData[gender] || outfitData.neutral || {
    top: NEUTRAL_TOPS,
    bottom: NEUTRAL_BOTTOMS,
    shoes: NEUTRAL_SHOES,
    accessory: NEUTRAL_ACCESSORIES,
    summary: outfitData.male?.summary || outfitData.female?.summary || '今日穿搭推荐',
    tags: outfitData.male?.tags || outfitData.female?.tags || ['日常穿搭'],
  };

  const seed = getTodaySeed();

  // 每天从对应性别的选项库里选一个（基于日期哈希，同一天固定结果）
  const outfit = {
    top: genderData.top[hashSeeded(seed, 1) % genderData.top.length],
    bottom: genderData.bottom[hashSeeded(seed, 2) % genderData.bottom.length],
    shoes: genderData.shoes[hashSeeded(seed, 3) % genderData.shoes.length],
    accessory: genderData.accessory[hashSeeded(seed, 4) % genderData.accessory.length],
    summary: genderData.summary,
    tags: genderData.tags || [],
  };

  // 降水天气附加提示
  if (isPrecipitation(weatherCode) && !isSnow(weatherCode)) {
    outfit.rainAddon = '☔️ 记得带伞，建议穿防水鞋或雨靴';
  } else if (isSnow(weatherCode)) {
    outfit.rainAddon = '❄️ 路面湿滑，请穿防滑保暖鞋履';
  }

  return outfit;
}
