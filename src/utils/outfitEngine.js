/**
 * 穿搭规则引擎
 * 根据体感温度 + 天气代码 -> 生成今日穿搭建议
 */

import { isPrecipitation, isSnow } from './weatherCodeMap.js';

const OUTFIT_RULES = [
  {
    maxTemp: 5,
    outfit: {
      top: '加厚羽绒服 + 保暖内搭',
      bottom: '加绒冲锋裤 / 厚棉裤',
      shoes: '雪地靴 / 厚底棉靴',
      accessory: '围巾 + 手套 + 毛线帽',
      summary: '❄️ 极寒天气，从里到外全副武装',
      tags: ['保暖优先', '户外防冻', '叠穿大法'],
      styles: ['运动户外风', '极简保暖风'],
    },
  },
  {
    maxTemp: 10,
    outfit: {
      top: '摇粒绒外套 + 打底毛衣',
      bottom: '直筒休闲裤 / 厚牛仔裤',
      shoes: '马丁靴 / 厚底皮鞋',
      accessory: '薄围巾 / 颈环',
      summary: '🧥 天凉了，叠穿保暖又时髦',
      tags: ['叠穿达人', '秋冬通勤', '日系慵懒'],
      styles: ['通勤风', '日系休闲'],
    },
  },
  {
    maxTemp: 15,
    outfit: {
      top: '卫衣 / 针织开衫 + 打底T恤',
      bottom: '宽松牛仔裤 / 休闲长裤',
      shoes: '小白鞋 / 帆布鞋',
      accessory: '轻薄外套备用',
      summary: '🌤️ 微凉舒适，轻薄叠穿刚刚好',
      tags: ['轻松随意', '百搭基础', '春秋必备'],
      styles: ['休闲风', '美式复古'],
    },
  },
  {
    maxTemp: 20,
    outfit: {
      top: '长袖衬衫 / 薄款卫衣',
      bottom: '直筒裤 / A字裙',
      shoes: '帆布鞋 / 乐福鞋',
      accessory: '薄外套备在包里',
      summary: '🌸 温度宜人，穿出轻盈感',
      tags: ['通勤', '约会', '文艺女生'],
      styles: ['法式简约', '知性通勤'],
    },
  },
  {
    maxTemp: 25,
    outfit: {
      top: '短袖T恤 / 薄衬衫',
      bottom: '薄款长裤 / 半裙',
      shoes: '运动鞋 / 乐福鞋',
      accessory: '防晒衣备用',
      summary: '☀️ 舒爽初夏，随意搭配都好看',
      tags: ['夏日清爽', '约会出行', '遛娃首选'],
      styles: ['清爽休闲', '度假风'],
    },
  },
  {
    maxTemp: Infinity,
    outfit: {
      top: '短袖 / 吊带背心 / 无袖衬衫',
      bottom: '短裤 / 短裙 / 连衣裙',
      shoes: '凉鞋 / 拖鞋 / 帆布鞋',
      accessory: '防晒衣 + 遮阳帽 + 墨镜',
      summary: '🌞 高温警报，防晒是硬道理',
      tags: ['防晒必备', '清凉出行', '夏日极简'],
      styles: ['夏日海岛风', '清凉度假'],
    },
  },
];

/**
 * 根据体感温度和天气代码获取穿搭建议
 * @param {number} apparentTemp 体感温度
 * @param {number} weatherCode WMO 天气代码
 * @returns {Object} 穿搭建议对象
 */
export function getOutfitAdvice(apparentTemp, weatherCode) {
  const rule = OUTFIT_RULES.find((r) => apparentTemp < r.maxTemp);
  const outfit = { ...(rule?.outfit || OUTFIT_RULES[OUTFIT_RULES.length - 1].outfit) };

  // 降水天气附加提示
  if (isPrecipitation(weatherCode) && !isSnow(weatherCode)) {
    outfit.rainAddon = '☔️ 记得带伞，建议穿防水鞋或雨靴';
  } else if (isSnow(weatherCode)) {
    outfit.rainAddon = '❄️ 路面湿滑，请穿防滑保暖鞋履';
  }

  return outfit;
}
