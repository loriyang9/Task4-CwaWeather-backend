// M-B0078-001 LocationCode 映射表
// 根據用戶提供的20個浪點座標和分析結果建立
const WAVE_FORECAST_MAPPING = {
    // 北部
    "baishawan_shimen": "O00100",  // 白沙灣（石門）- 使用最近的 O00100 中角沙珠灣
    "zhongjiao_bay": "O00100",  // 中角灣（金山）- O00100 中角沙珠灣
    "fulong": "O00300",  // 福隆海水浴場 - O00300 福隆鹽寮水域F區
    "honeymoon_bay": "O01200",  // 蜜月灣（大溪）- O01200 蜜月灣
    "waiao": "O00400",  // 外澳（雙獅）- O00400 港澳水域遊憩活動範圍A、C區
    "wushi": "O00400",  // 烏石港 - O00400 港澳水域遊憩活動範圍A、C區
    "wuwei": "N00600",  // 無尾港 - N00600 豆腐岬水域

    // 中部
    "holiday_forest": "I04200",  // 假日之森（竹南）- I04200 龍鳳
    "songbo": "O00500",  // 松柏港沙灘 - O00500 大安海水域場B區

    // 南部
    "yuguangdao": "I00500",  // 漁光島 - I00500 (安平，可能需要確認)
    "cijin": null,  // 旗津海水浴場 - 無直接對應
    "nanwan": "O00700",  // 南灣 - O00700 南灣
    "dawan_kenting": "O00800",  // 墾丁大灣 - O00800 大灣
    "baisha_kenting": "O00600",  // 墾丁白砂灣 - O00600 白砂
    "jialeshui": "O01000",  // 佳樂水 - O01000 港口
    "gangkou": "O01000",  // 港口（滿州）- O01000 港口

    // 東部
    "donghe": "O01300",  // 東河 - O01300 金樽（根據座標匹配）
    "jinzun": "O01300",  // 金樽 - O01300 金樽
    "dulan": "N00500",  // 都蘭海灘 - N00500 杉原海域

    // 離島
    "shanshui_penghu": "O01100"  // 山水沙灘（澎湖）- O01100 山水
};

module.exports = WAVE_FORECAST_MAPPING;
