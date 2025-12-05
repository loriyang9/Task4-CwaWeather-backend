const fs = require('fs');

// 1. The NEW data from User
const newSpots = [
    {
        "name": "白沙灣（石門）",
        "id": "baishawan_shimen",
        "marine": { "stationId": "C6AH2", "name": "富貴角浮標" },
        "tide": { "stationId": "C4A03", "name": "麟山鼻" },
        "weather": { "datasetId": "F-D0047-069", "locationName": "石門區", "desc": "新北市" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "富貴角" }
    },
    {
        "name": "中角灣（金山）",
        "id": "zhongjiao_bay",
        "marine": { "stationId": "C6AH2", "name": "富貴角浮標" },
        "tide": { "stationId": "C4A03", "name": "麟山鼻" },
        "weather": { "datasetId": "F-D0047-069", "locationName": "金山區", "desc": "新北市" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "富貴角" }
    },
    {
        "name": "福隆海水浴場",
        "id": "fulong",
        "marine": { "stationId": "46694A", "name": "龍洞浮標" },
        "tide": { "stationId": "C4A05", "name": "福隆" },
        "weather": { "datasetId": "F-D0047-069", "locationName": "貢寮區", "desc": "新北市" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "龍洞" }
    },
    {
        "name": "蜜月灣（大溪）",
        "id": "honeymoon_bay",
        "marine": { "stationId": "46708A", "name": "龜山島浮標" },
        "tide": { "stationId": "C4U02", "name": "烏石" },
        "weather": { "datasetId": "F-D0047-001", "locationName": "頭城鎮", "desc": "宜蘭縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "龜山島" }
    },
    {
        "name": "外澳（雙獅）",
        "id": "waiao",
        "marine": { "stationId": "46708A", "name": "龜山島浮標" },
        "tide": { "stationId": "C4U02", "name": "烏石" },
        "weather": { "datasetId": "F-D0047-001", "locationName": "頭城鎮", "desc": "宜蘭縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "龜山島" }
    },
    {
        "name": "烏石港",
        "id": "wushi",
        "marine": { "stationId": "46708A", "name": "龜山島浮標" },
        "tide": { "stationId": "C4U02", "name": "烏石" },
        "weather": { "datasetId": "F-D0047-001", "locationName": "頭城鎮", "desc": "宜蘭縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "龜山島" }
    },
    {
        "name": "無尾港",
        "id": "wuwei",
        "marine": { "stationId": "46708A", "name": "龜山島浮標" },
        "tide": { "stationId": "C4U01", "name": "蘇澳" },
        "weather": { "datasetId": "F-D0047-001", "locationName": "蘇澳鎮", "desc": "宜蘭縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "蘇澳" }
    },
    {
        "name": "假日之森（竹南）",
        "id": "holiday_forest",
        "marine": { "stationId": "46757A", "name": "新竹浮標" },
        "tide": { "stationId": "1220A", "name": "龍鳳" },
        "weather": { "datasetId": "F-D0047-013", "locationName": "竹南鎮", "desc": "苗栗縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "新竹" }
    },
    {
        "name": "松柏港沙灘",
        "id": "songbo",
        "marine": { "stationId": "46757A", "name": "新竹浮標" },
        "tide": { "stationId": "C4E01", "name": "外埔" },
        "weather": { "datasetId": "F-D0047-013", "locationName": "苑裡鎮", "desc": "苗栗縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "新竹" }
    },
    {
        "name": "漁光島",
        "id": "yuguangdao",
        "marine": { "stationId": "46744A", "name": "高雄浮標" },
        "tide": { "stationId": "11781", "name": "安平" },
        "weather": { "datasetId": "F-D0047-077", "locationName": "安平區", "desc": "台南市" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "高雄" }
    },
    {
        "name": "旗津海水浴場",
        "id": "cijin",
        "marine": { "stationId": "46744A", "name": "高雄浮標" },
        "tide": { "stationId": "C4P01", "name": "高雄" },
        "weather": { "datasetId": "F-D0047-065", "locationName": "旗津區", "desc": "高雄市" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "高雄" }
    },
    {
        "name": "南灣",
        "id": "nanwan",
        "marine": { "stationId": "46759A", "name": "鵝鑾鼻浮標" },
        "tide": { "stationId": "C4R01", "name": "後壁湖" },
        "weather": { "datasetId": "F-D0047-033", "locationName": "恆春鎮", "desc": "屏東縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" }
    },
    {
        "name": "墾丁大灣",
        "id": "dawan_kenting",
        "marine": { "stationId": "46759A", "name": "鵝鑾鼻浮標" },
        "tide": { "stationId": "C4R01", "name": "後壁湖" },
        "weather": { "datasetId": "F-D0047-033", "locationName": "恆春鎮", "desc": "屏東縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" }
    },
    {
        "name": "墾丁白砂灣",
        "id": "baisha_kenting",
        "marine": { "stationId": "46759A", "name": "鵝鑾鼻浮標" },
        "tide": { "stationId": "C4R01", "name": "後壁湖" },
        "weather": { "datasetId": "F-D0047-033", "locationName": "恆春鎮", "desc": "屏東縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" }
    },
    {
        "name": "佳樂水",
        "id": "jialeshui",
        "marine": { "stationId": "46759A", "name": "鵝鑾鼻浮標" },
        "tide": { "stationId": "C4R01", "name": "後壁湖" },
        "weather": { "datasetId": "F-D0047-033", "locationName": "滿州鄉", "desc": "屏東縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" }
    },
    {
        "name": "港口（滿州）",
        "id": "gangkou",
        "marine": { "stationId": "46759A", "name": "鵝鑾鼻浮標" },
        "tide": { "stationId": "C4R01", "name": "後壁湖" },
        "weather": { "datasetId": "F-D0047-033", "locationName": "滿州鄉", "desc": "屏東縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" }
    },
    {
        "name": "東河",
        "id": "donghe",
        "marine": { "stationId": "46763A", "name": "台東浮標" },
        "tide": { "stationId": "C4S02", "name": "成功" },
        "weather": { "datasetId": "F-D0047-037", "locationName": "東河鄉", "desc": "台東縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "成功" }
    },
    {
        "name": "金樽",
        "id": "jinzun",
        "marine": { "stationId": "46763A", "name": "台東浮標" },
        "tide": { "stationId": "C4S02", "name": "成功" },
        "weather": { "datasetId": "F-D0047-037", "locationName": "東河鄉", "desc": "台東縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "成功" }
    },
    {
        "name": "都蘭海灘",
        "id": "dulan",
        "marine": { "stationId": "46763A", "name": "台東浮標" },
        "tide": { "stationId": "C4S01", "name": "富岡" },
        "weather": { "datasetId": "F-D0047-037", "locationName": "東河鄉", "desc": "台東縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "臺東" }
    },
    {
        "name": "山水沙灘（澎湖）",
        "id": "shanshui_penghu",
        "marine": { "stationId": "46735A", "name": "澎湖浮標" },
        "tide": { "stationId": "C4W01", "name": "馬公" },
        "weather": { "datasetId": "F-D0047-045", "locationName": "馬公市", "desc": "澎湖縣" },
        "forecast": { "datasetId": "F-A0012-001", "locationName": "澎湖" }
    }
];

// 2. Read OLD data (merged_spots.json)
let oldSpots = [];
try {
    const raw = fs.readFileSync('merged_spots.json', 'utf8');
    oldSpots = JSON.parse(raw);
} catch (e) {
    console.error("Could not read merged_spots.json, using defaults");
}

// 3. Merge
const finalSpots = newSpots.map(newSpot => {
    const oldSpot = oldSpots.find(s => s.id === newSpot.id);
    return {
        ...newSpot,
        lat: oldSpot ? oldSpot.lat : 0,
        lon: oldSpot ? oldSpot.lon : 0,
        // Keep sunriseSunset if not present in new (it's not)
        sunriseSunset: oldSpot ? oldSpot.sunriseSunset : { "dataset": "A-B0062-001" }
    };
});

// 4. Output
console.log(JSON.stringify(finalSpots, null, 2));
fs.writeFileSync('final_spots.json', JSON.stringify(finalSpots, null, 2));
