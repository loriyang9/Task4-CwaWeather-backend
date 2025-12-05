require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";
const CWA_API_KEY = process.env.CWA_API_KEY;

if (!CWA_API_KEY) {
  console.error("⚠️ 警告：系統偵測不到 CWA_API_KEY，請至 Zeabur 設定環境變數！");
}

app.use(cors());
app.use(express.json());

// === 衝浪浪點資料庫 (User Provided) ===
const SURF_SPOTS = [
  {
    "name": "白沙灣（石門）",
    "id": "baishawan_shimen",
    "primaryWaveStationId": "C6AH2",
    "secondaryWaveStationId": "TPBU01",
    "windStationId": "C6AH2",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "65000220",
      "name": "新北市石門區"
    },
    "weather": {
      "datasetId": "F-D0047-069",
      "locationName": "石門區",
      "desc": "新北市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "富貴角"
    },
    "lat": 25.2866,
    "lon": 121.5195,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "中角灣（金山）",
    "id": "zhongjiao",
    "primaryWaveStationId": "C6AH2",
    "secondaryWaveStationId": "TPBU01",
    "windStationId": "C6AH2",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00100",
      "name": "衝浪中角沙珠灣"
    },
    "weather": {
      "datasetId": "F-D0047-069",
      "locationName": "金山區",
      "desc": "新北市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "富貴角"
    },
    "lat": 25.2245,
    "lon": 121.6345,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "福隆海水浴場",
    "id": "fulong",
    "primaryWaveStationId": "OAC005",
    "secondaryWaveStationId": "46694A",
    "windStationId": "46694A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00300",
      "name": "衝浪福隆鹽寮水域 F區"
    },
    "weather": {
      "datasetId": "F-D0047-069",
      "locationName": "貢寮區",
      "desc": "新北市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "龍洞"
    },
    "lat": 25.0205,
    "lon": 121.9443,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "蜜月灣（大溪）",
    "id": "daxi",
    "primaryWaveStationId": "OAC005",
    "secondaryWaveStationId": "46708A",
    "windStationId": "46694A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00400",
      "name": "衝浪港澳水域遊憩活動範圍 A、C區"
    },
    "weather": {
      "datasetId": "F-D0047-001",
      "locationName": "頭城鎮",
      "desc": "宜蘭縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "龍洞"
    },
    "lat": 24.9355,
    "lon": 121.8955,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "外澳（雙獅）",
    "id": "waiao",
    "primaryWaveStationId": "46708A",
    "secondaryWaveStationId": "46694A",
    "windStationId": "46694A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00400",
      "name": "衝浪港澳水域遊憩活動範圍 A、C區"
    },
    "weather": {
      "datasetId": "F-D0047-001",
      "locationName": "頭城鎮",
      "desc": "宜蘭縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "龍洞"
    },
    "lat": 24.8735,
    "lon": 121.8358,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "烏石港",
    "id": "yilan",
    "primaryWaveStationId": "46708A",
    "secondaryWaveStationId": "46694A",
    "windStationId": "46694A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00400",
      "name": "衝浪港澳水域遊憩活動範圍 A、C區"
    },
    "weather": {
      "datasetId": "F-D0047-001",
      "locationName": "頭城鎮",
      "desc": "宜蘭縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "龍洞"
    },
    "lat": 24.8555,
    "lon": 121.8255,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "無尾港",
    "id": "suao",
    "primaryWaveStationId": "46706A",
    "secondaryWaveStationId": "46708A",
    "windStationId": "46708A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "N00600",
      "name": "潛點豆腐岬水域"
    },
    "weather": {
      "datasetId": "F-D0047-001",
      "locationName": "蘇澳鎮",
      "desc": "宜蘭縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "蘇澳"
    },
    "lat": 24.5955,
    "lon": 121.8655,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "假日之森（竹南）",
    "id": "zhunan",
    "primaryWaveStationId": "C6D01",
    "secondaryWaveStationId": "46757B",
    "windStationId": "46757B",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "I04200",
      "name": "漁港龍鳳"
    },
    "weather": {
      "datasetId": "F-D0047-013",
      "locationName": "竹南鎮",
      "desc": "苗栗縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "新竹"
    },
    "lat": 24.6955,
    "lon": 120.8555,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "松柏港沙灘",
    "id": "songbo",
    "primaryWaveStationId": "C6F01",
    "secondaryWaveStationId": "46757B",
    "windStationId": "46757B",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00500",
      "name": "衝浪大安海水域場 B區"
    },
    "weather": {
      "datasetId": "F-D0047-073",
      "locationName": "大甲區",
      "desc": "臺中市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "臺中"
    },
    "lat": 24.4255,
    "lon": 120.5855,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "漁光島",
    "id": "yuguang",
    "primaryWaveStationId": "C6N01",
    "secondaryWaveStationId": "COMC08",
    "windStationId": "COMC08",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "I00500",
      "name": "漁港安平"
    },
    "weather": {
      "datasetId": "F-D0047-077",
      "locationName": "安平區",
      "desc": "臺南市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "安平"
    },
    "lat": 22.9855,
    "lon": 120.1555,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "旗津海水浴場",
    "id": "qijin",
    "primaryWaveStationId": "COMC08",
    "secondaryWaveStationId": "46714D",
    "windStationId": "COMC08",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "B00800",
      "name": "海釣高雄港旗后山一港口護岸"
    },
    "weather": {
      "datasetId": "F-D0047-065",
      "locationName": "旗津區",
      "desc": "高雄市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "高雄"
    },
    "lat": 22.6155,
    "lon": 120.2655,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "南灣",
    "id": "nanwan",
    "primaryWaveStationId": "OAC007",
    "secondaryWaveStationId": "46759A",
    "windStationId": "46759A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00700",
      "name": "衝浪南灣"
    },
    "weather": {
      "datasetId": "F-D0047-033",
      "locationName": "恆春鎮",
      "desc": "屏東縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "鵝鑾鼻"
    },
    "lat": 21.9565,
    "lon": 120.7635,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "墾丁大灣",
    "id": "dawan_kenting",
    "primaryWaveStationId": "OAC007",
    "secondaryWaveStationId": "46759A",
    "windStationId": "46759A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00800",
      "name": "衝浪大灣"
    },
    "weather": {
      "datasetId": "F-D0047-033",
      "locationName": "恆春鎮",
      "desc": "屏東縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "鵝鑾鼻"
    },
    "lat": 21.9455,
    "lon": 120.7955,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "墾丁白砂灣",
    "id": "baisha_kenting",
    "primaryWaveStationId": "OAC007",
    "secondaryWaveStationId": "46759A",
    "windStationId": "46759A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O00600",
      "name": "衝浪白砂"
    },
    "weather": {
      "datasetId": "F-D0047-033",
      "locationName": "恆春鎮",
      "desc": "屏東縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "鵝鑾鼻"
    },
    "lat": 21.9355,
    "lon": 120.7155,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "佳樂水",
    "id": "jialeshui",
    "primaryWaveStationId": "OAC007",
    "secondaryWaveStationId": "46759A",
    "windStationId": "46759A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O01000",
      "name": "衝浪港口"
    },
    "weather": {
      "datasetId": "F-D0047-033",
      "locationName": "滿州鄉",
      "desc": "屏東縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "鵝鑾鼻"
    },
    "lat": 21.9935,
    "lon": 120.8455,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "港口（滿州）",
    "id": "gangkou",
    "primaryWaveStationId": "46759A",
    "secondaryWaveStationId": "46714D",
    "windStationId": "46759A",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "O01000",
      "name": "衝浪港口"
    },
    "weather": {
      "datasetId": "F-D0047-033",
      "locationName": "滿州鄉",
      "desc": "屏東縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "鵝鑾鼻"
    },
    "lat": 21.9855,
    "lon": 120.8455,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "東河",
    "id": "donghe",
    "primaryWaveStationId": "WRA007",
    "secondaryWaveStationId": "46761F",
    "windStationId": "46761F",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "I00900",
      "name": "漁港金樽"
    },
    "weather": {
      "datasetId": "F-D0047-037",
      "locationName": "東河鄉",
      "desc": "臺東縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "臺東"
    },
    "lat": 22.9655,
    "lon": 121.3055,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "金樽",
    "id": "jinzung",
    "primaryWaveStationId": "WRA007",
    "secondaryWaveStationId": "46761F",
    "windStationId": "46761F",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "I00900",
      "name": "漁港金樽"
    },
    "weather": {
      "datasetId": "F-D0047-037",
      "locationName": "東河鄉",
      "desc": "臺東縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "臺東"
    },
    "lat": 22.9455,
    "lon": 121.2855,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "台東",
    "id": "taitung",
    "primaryWaveStationId": "WRA007",
    "secondaryWaveStationId": "46761F",
    "windStationId": "46761F",
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "10015010",
      "name": "臺東"
    },
    "weather": {
      "datasetId": "F-D0047-037",
      "locationName": "臺東市",
      "desc": "臺東縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "臺東"
    },
    "lat": 22.7555,
    "lon": 121.1555,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "七星潭",
    "id": "cisingtan",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46699A",
      "name": "花蓮浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "10010020",
      "name": "花蓮"
    },
    "weather": {
      "datasetId": "F-D0047-041",
      "locationName": "新城鄉",
      "desc": "花蓮縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "花蓮"
    },
    "lat": 24.0255,
    "lon": 121.6355,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "高雄",
    "id": "kaohsiung",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46744A",
      "name": "高雄浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "12022010",
      "name": "高雄"
    },
    "weather": {
      "datasetId": "F-D0047-065",
      "locationName": "鼓山區",
      "desc": "高雄市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "高雄"
    },
    "lat": 22.6255,
    "lon": 120.2655,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "旗津",
    "id": "cijin",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46744A",
      "name": "高雄浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "12022010",
      "name": "高雄"
    },
    "weather": {
      "datasetId": "F-D0047-065",
      "locationName": "旗津區",
      "desc": "高雄市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "高雄"
    },
    "lat": 22.6055,
    "lon": 120.2755,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "台南",
    "id": "tainan",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46741A",
      "name": "安平浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "12022010",
      "name": "高雄"
    },
    "weather": {
      "datasetId": "F-D0047-073",
      "locationName": "安平區",
      "desc": "臺南市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "安平"
    },
    "lat": 22.9955,
    "lon": 120.1555,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "漁光島",
    "id": "yuguang",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46741A",
      "name": "安平浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "I00500",
      "name": "漁港安平"
    },
    "weather": {
      "datasetId": "F-D0047-073",
      "locationName": "安平區",
      "desc": "臺南市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "安平"
    },
    "lat": 22.9855,
    "lon": 120.1555,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "台中",
    "id": "taichung",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46706A",
      "name": "臺中浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "N01000",
      "name": "外埔"
    },
    "weather": {
      "datasetId": "F-D0047-077",
      "locationName": "清水區",
      "desc": "臺中市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "臺中"
    },
    "lat": 24.2555,
    "lon": 120.5055,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "大安",
    "id": "daan",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46706A",
      "name": "臺中浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "N01000",
      "name": "外埔"
    },
    "weather": {
      "datasetId": "F-D0047-077",
      "locationName": "大安區",
      "desc": "臺中市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "臺中"
    },
    "lat": 24.3855,
    "lon": 120.5755,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "苗栗",
    "id": "miaoli",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46706A",
      "name": "臺中浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "N01000",
      "name": "外埔"
    },
    "weather": {
      "datasetId": "F-D0047-013",
      "locationName": "竹南鎮",
      "desc": "苗栗縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "新竹"
    },
    "lat": 24.6855,
    "lon": 120.8655,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "竹南",
    "id": "zhunan",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46706A",
      "name": "臺中浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "N00800",
      "name": "新竹"
    },
    "weather": {
      "datasetId": "F-D0047-013",
      "locationName": "竹南鎮",
      "desc": "苗栗縣"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "新竹"
    },
    "lat": 24.6955,
    "lon": 120.8555,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "新竹",
    "id": "hsinchu",
    "marine": {
      "dataset": "O-MMC-0001",
      "stationId": "46757A",
      "name": "新竹浮標"
    },
    "tide": {
      "dataset": "F-A0021-001",
      "stationId": "N00800",
      "name": "新竹"
    },
    "weather": {
      "datasetId": "F-D0047-053",
      "locationName": "北區",
      "desc": "新竹市"
    },
    "forecast": {
      "datasetId": "F-A0012-001",
      "locationName": "新竹"
    },
    "lat": 24.8455,
    "lon": 120.9255,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  }
];

// === Helper Functions ===

// === 3. 取得即時海況 (使用 O-MMC-0001) ===
async function fetchMarineData(stationId) {
  const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-MMC-0001?Authorization=${CWA_API_KEY}&StationID=${stationId}`;
  console.log(`Fetching Marine Data (O-MMC-0001): ${url}`);

  try {
    const response = await axios.get(url);
    const records = response.data.records;
    if (!records || !records.SeaSurfaceObs || !records.SeaSurfaceObs.Location) return null;

    const location = records.SeaSurfaceObs.Location.find(l => l.Station.StationID === stationId);
    if (!location) {
      console.warn(`Marine station not found: ${stationId}`);
      return null;
    }

    const obsTime = location.StationObsTimes?.StationObsTime?.[0];
    const elements = obsTime?.WeatherElements;

    if (!elements) return null;

    // Debug: Log available keys in O-MMC-0001 elements
    console.log(`Marine Elements Keys (${stationId}):`, Object.keys(elements));

    return {
      obsTime: obsTime.DateTime,
      waveHeight: elements.WaveHeight,
      waveDir: elements.WaveDirection,
      wavePeriod: elements.WavePeriod,
      windSpeed: elements.WindSpeed,
      windDir: elements.WindDirection,
      tideLevel: elements.TideLevel, // Current Tide Level from O-MMC-0001
      seaTemp: elements.SeaTemperature // Add Sea Temperature
    };

  } catch (error) {
    console.error(`Marine fetch error: ${error.message}`);
    return null;
  }
}

// 2. Fetch Tide Data (F-A0021-001) - Forecast
// === 4. 取得潮汐預報 (使用 F-A0021-001) ===
async function fetchTideForecast(locationId) {
  const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-A0021-001?Authorization=${CWA_API_KEY}&LocationID=${locationId}`;
  console.log(`Fetching Tide Forecast (F-A0021-001): ${url}`);

  try {
    const response = await axios.get(url);
    const records = response.data.records || response.data.Records;

    if (!records || !records.TideForecasts) return [];

    let locations = [];
    if (Array.isArray(records.TideForecasts)) {
      // Check if elements are wrapped in "Location"
      if (records.TideForecasts.length > 0 && records.TideForecasts[0].Location) {
        locations = records.TideForecasts.map(item => item.Location);
      } else {
        locations = records.TideForecasts;
      }
    } else if (records.TideForecasts.Location) {
      // Structure: TideForecasts: { Location: [...] }
      locations = records.TideForecasts.Location;
    }

    const location = locations.find(l => {
      const id = l.LocationID || l.StationId || l.LocationId;
      return id === locationId;
    });

    if (!location) return [];

    // Extract tide forecast data - structure varies
    let forecasts = [];
    if (location.TideForecasts?.TideForecast) {
      forecasts = location.TideForecasts.TideForecast;
    } else if (location.TimePeriods) {
      // TimePeriods structure - flatten all Time arrays from all dates
      if (location.TimePeriods.Daily && Array.isArray(location.TimePeriods.Daily)) {
        forecasts = location.TimePeriods.Daily.flatMap(period => period.Time || []);
      } else if (Array.isArray(location.TimePeriods)) {
        forecasts = location.TimePeriods.flatMap(period => period.Time || []);
      } else if (location.TimePeriods.Time) {
        // Single period with Time array
        forecasts = location.TimePeriods.Time;
      }
    }

    return forecasts;

  } catch (error) {
    console.error(`Tide forecast fetch error: ${error.message}`);
    return [];
  }
}

// 3. Fetch Weather Data (F-D0047-XXX) - Forecast
// Helper: Convert m/s to km/h
function convertMpsToKmh(mps) {
  if (!mps || mps === "undefined" || mps === "--") return "--";
  const val = parseFloat(mps);
  if (isNaN(val)) return "--";
  return `${Math.round(val * 3.6)} km/h`;
}

// Helper: Convert degrees to direction text
function convertDegreesToDirection(degrees) {
  if (!degrees || degrees === "undefined" || degrees === "None") return "--";
  const val = parseFloat(degrees);
  if (isNaN(val)) return "--";

  const directions = ["北風", "北北東風", "東北風", "東北東風", "東風", "東南東風", "東南風", "南南東風", "南風", "南南西風", "西南風", "西南西風", "西風", "西北西風", "西北風", "北北西風"];
  const index = Math.round(val / 22.5) % 16;
  return directions[index];
}

async function fetchWeatherData(datasetId, locationName) {
  try {
    const url = `${CWA_API_BASE_URL}/v1/rest/datastore/${datasetId}`;
    console.log(`Fetching Weather Data: ${url} for ${locationName}`);
    const res = await axios.get(url, {
      params: {
        Authorization: CWA_API_KEY,
        locationName: locationName,
        elementName: "天氣現象,平均溫度,風向,風速,12小時降雨機率"
      }
    });

    const records = res.data.records || res.data.Records;
    if (!records) {
      console.error(`No records found for ${locationName}`);
      return [];
    }

    const locations = records.locations || records.Locations;
    if (!locations) {
      console.error(`No locations found for ${locationName}`);
      return [];
    }

    const locationList = locations[0].location || locations[0].Location;
    if (!locationList) {
      console.error(`No locationList found for ${locationName}`);
      return [];
    }

    // Fix: Find the specific location by name
    const location = locationList.find(l => l.locationName === locationName || l.LocationName === locationName);
    if (!location) {
      console.error(`Location not found: ${locationName}`);
      return [];
    }
    console.log(`Found location: ${location.locationName || location.LocationName}`);

    // Parse into a time-based map
    const weatherMap = {};
    const weatherElements = location.weatherElement || location.WeatherElement;

    if (!weatherElements) return [];


    weatherElements.forEach(el => {
      const ename = el.ElementName || el.elementName;
      const timeData = el.Time || el.time;

      timeData.forEach(t => {
        const startTime = t.StartTime || t.DataTime || t.startTime || t.dataTime;
        if (!weatherMap[startTime]) weatherMap[startTime] = { startTime };

        const ev = t.ElementValue[0] || t.elementValue[0];
        const value = ev.value || ev.Value || ev.ElementValue; // Generic value

        // Handle both Chinese and English element names
        if (ename === "天氣現象" || ename === "Wx") {
          weatherMap[startTime].weather = ev.Weather || value;
        }
        if (ename === "平均溫度" || ename === "T" || ename === "溫度") {
          weatherMap[startTime].temp = ev.Temperature || value;
        }
        if (ename === "12小時降雨機率" || ename === "PoP12h" || ename === "PoP6h" || ename === "3小時降雨機率") {
          weatherMap[startTime].rain = ev.ProbabilityOfPrecipitation || value;
        }
        if (ename === "風速" || ename === "WS") {
          const mps = ev.WindSpeed || value;
          weatherMap[startTime].windSpeed = convertMpsToKmh(mps);
        }
        if (ename === "風向" || ename === "WD") {
          weatherMap[startTime].windDir = ev.WindDirection || value;
        }
      });
    });

    // Fill forward missing weather and rain data
    const sortedTimes = Object.keys(weatherMap).sort();
    console.log(`Parsed times for ${locationName}:`, sortedTimes.slice(0, 5));

    let lastWeather = null;
    let lastRain = null;
    let lastTemp = null;
    let lastWindSpeed = null;
    let lastWindDir = null;

    sortedTimes.forEach(time => {
      const entry = weatherMap[time];

      // Fill Weather
      if (entry.weather) lastWeather = entry.weather;
      else if (lastWeather) entry.weather = lastWeather;

      // Fill Rain
      if (entry.rain) lastRain = entry.rain;
      else if (lastRain) entry.rain = lastRain;

      // Fill Temp
      if (entry.temp) lastTemp = entry.temp;
      else if (lastTemp) entry.temp = lastTemp;

      // Fill WindSpeed
      if (entry.windSpeed) lastWindSpeed = entry.windSpeed;
      else if (lastWindSpeed) entry.windSpeed = lastWindSpeed;

      // Fill WindDir
      if (entry.windDir) lastWindDir = entry.windDir;
      else if (lastWindDir) entry.windDir = lastWindDir;
    });

    // Convert to array and sort by time
    const forecasts = sortedTimes.map(startTime => {
      const w = weatherMap[startTime];
      if (locationName === "石門區" && startTime.includes("21:00:00")) {
        console.error(`   Map Entry for ${startTime}: ${JSON.stringify(w)}`);
      }

      const ret = {
        startTime: w.startTime,
        weather: w.weather,
        temp: w.temp,
        rain: (w.rain && w.rain !== "undefined") ? (String(w.rain).includes('%') ? w.rain : w.rain + '%') : "0%",
        windSpeed: w.windSpeed,
        windDir: w.windDir,
        waveHeight: "--",
        waveDir: "--",
        wavePeriod: "--",
        tideLevel: "--"
      };

      return ret;
    })
      .filter(f => new Date(f.startTime) >= new Date()); // Filter past forecasts

    return forecasts;
  } catch (error) {
    console.error(`Weather fetch error for ${locationName}:`, error.message);
    return [];
  }
}

// Fetch Buoy Observation (O-B0075-001) - Wind & Wave
async function fetchBuoyObservation(stationId) {
  if (!stationId) return null;
  try {
    const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-B0075-001?Authorization=${CWA_API_KEY}&StationID=${stationId}`;
    console.log(`Fetching Buoy Observation (O-B0075-001): ${url}`);
    const response = await axios.get(url);

    const data = response.data;
    console.log(`DEBUG: Station ${stationId} Data Success: ${data.success}`);
    if (data.Success === "false" || data.success === "false") {
      console.error(`Buoy Observation fetch error: ${data.Result?.message || data.result?.message}`);
      return null;
    }

    const records = data.Records || data.records;
    console.log(`DEBUG: Station ${stationId} Records found: ${!!records}`);
    if (!records || !records.SeaSurfaceObs || !records.SeaSurfaceObs.Location) {
      console.error(`Buoy Observation structure error for ${stationId}`);
      return null;
    }

    console.log(`DEBUG: Station ${stationId} Locations count: ${records.SeaSurfaceObs.Location.length}`);
    const location = records.SeaSurfaceObs.Location.find(l => l.Station.StationID === stationId);
    if (!location) {
      console.error(`DEBUG: Station ${stationId} not found in ${records.SeaSurfaceObs.Location.length} locations`);
      return null;
    }

    console.log(`DEBUG: Station ${stationId} Location found`);
    if (!location.StationObsTimes || !location.StationObsTimes.StationObsTime) {
      console.error(`DEBUG: No observation times for ${stationId}`);
      return null;
    }

    // Get the latest observation
    const observations = location.StationObsTimes.StationObsTime;
    console.log(`DEBUG: Station ${stationId} Observations count: ${observations.length}`);
    // Sort by DateTime descending just in case, though usually sorted
    observations.sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime));
    const latest = observations[0];
    console.log(`DEBUG: Station ${stationId} Latest found: ${!!latest}`);

    if (!latest || !latest.WeatherElements) {
      console.error(`DEBUG: No WeatherElements for ${stationId}`);
      return null;
    }

    const wind = latest.WeatherElements.PrimaryAnemometer;
    const we = latest.WeatherElements;

    const result = {};

    // Wind Data
    if (wind) {
      const speed = wind.WindSpeed;
      const dir = wind.WindDirection;
      // Check for invalid values
      if (speed !== "None" && dir !== "None" && parseFloat(speed) >= 0) {
        result.windSpeed = convertMpsToKmh(speed);
        result.windDir = convertDegreesToDirection(dir);
      }
    }

    // Wave Data (Directly in WeatherElements)
    if (we) {
      result.waveHeight = (we.WaveHeight !== "None" && parseFloat(we.WaveHeight) >= 0) ? `${we.WaveHeight}m` : null;
      result.waveDir = (we.WaveDirection !== "None") ? convertDegreesToDirection(we.WaveDirection).replace("風", "") : null;
      result.wavePeriod = (we.WavePeriod !== "None" && parseFloat(we.WavePeriod) >= 0) ? `${we.WavePeriod}s` : null;

      // Tide Data
      // Note: TideHeight is often "None" for buoys, but we check it as requested.
      // TideLevel might be "-" or a value.
      const tide = we.TideHeight;
      result.tideHeight = (tide && tide !== "None" && tide !== "-" && !isNaN(parseFloat(tide))) ? tide : null;
    }

    return result;

  } catch (error) {
    console.error(`Buoy Observation fetch error for ${stationId}: ${error.message}`);
    return null;
  }
}

// 4. Fetch Marine Forecast (F-A0012-001) - 3 Days
async function fetchMarineForecast(locationName) {
  try {
    const url = `${CWA_API_BASE_URL}/v1/rest/datastore/F-A0012-001`;
    const res = await axios.get(url, {
      params: {
        Authorization: CWA_API_KEY,
        locationName: locationName,
        elementName: "WaveHeight,WindSpeed,WindDirection,WavePeriod,WaveDirection"
      }
    });

    const records = res.data.records || res.data.Records;
    if (!records || !records.location) return [];

    const location = records.location[0];
    if (!location) return [];

    const validTime = location.validTime;
    if (!validTime) return [];

    return validTime.map(t => {
      const time = t.startTime;
      const elements = t.weatherElement;
      const waveHeight = elements.find(e => e.elementName === "WaveHeight")?.elementValue[0]?.value;
      const windSpeed = elements.find(e => e.elementName === "WindSpeed")?.elementValue[0]?.value;
      const windDir = elements.find(e => e.elementName === "WindDirection")?.elementValue[0]?.value;
      const wavePeriod = elements.find(e => e.elementName === "WavePeriod")?.elementValue[0]?.value;
      const waveDir = elements.find(e => e.elementName === "WaveDirection")?.elementValue[0]?.value;

      return {
        startTime: time,
        waveHeight: waveHeight,
        windSpeed: windSpeed,
        windDir: windDir,
        wavePeriod: wavePeriod,
        waveDir: waveDir
      };
    });
  } catch (error) {
    console.error(`Marine Forecast fetch error for ${locationName}:`, error.message);
    return [];
  }
}

// 5. Fetch Sunrise/Sunset (A-B0062-001)
async function fetchSunriseSunset(countyName) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `${CWA_API_BASE_URL}/v1/rest/datastore/A-B0062-001`;
    const res = await axios.get(url, {
      params: {
        Authorization: CWA_API_KEY,
        CountyName: countyName,
        Date: today
      }
    });

    const records = res.data.records || res.data.Records;
    if (!records || !records.locations) return null;

    const location = records.locations.location[0];
    if (!location) return null;

    const timeData = location.time[0]; // Today
    return {
      sunrise: timeData.SunRiseTime,
      sunset: timeData.SunSetTime
    };
  } catch (error) {
    console.error(`Sunrise fetch error for ${countyName}:`, error.message);
    return null;
  }
}

function findNearestSpot(lat, lon) {
  let nearest = SURF_SPOTS[0];
  let minDistance = Infinity;
  SURF_SPOTS.forEach((spot) => {
    const dist = Math.sqrt(Math.pow(spot.lat - lat, 2) + Math.pow(spot.lon - lon, 2));
    if (dist < minDistance) { minDistance = dist; nearest = spot; }
  });
  return nearest;
}

// === Main Handler ===
const getWeather = async (req, res) => {
  try {
    if (!CWA_API_KEY) {
      return res.status(500).json({ error: "Server API Key Missing" });
    }

    let targetSpot = SURF_SPOTS.find(s => s.id === "waiao"); // Default

    if (req.query.lat && req.query.lon) {
      targetSpot = findNearestSpot(parseFloat(req.query.lat), parseFloat(req.query.lon));
    } else if (req.params.city) {
      const found = SURF_SPOTS.find(c => c.id === req.params.city.toLowerCase());
      if (found) targetSpot = found;
    }

    console.log(`📡 Fetching data for: ${targetSpot.name}`);

    console.log(`📡 Fetching data for: ${targetSpot.name}`);

    // Prioritization Logic for Wave and Tide
    let primaryObs = null;
    let secondaryObs = null;

    // 1. Fetch Primary Buoy
    if (targetSpot.primaryWaveStationId) {
      primaryObs = await fetchBuoyObservation(targetSpot.primaryWaveStationId);
    }

    // 2. Determine if Secondary Buoy is needed (if Primary missing Wave OR Tide)
    const needSecondaryForWave = !primaryObs || !primaryObs.waveHeight;
    const needSecondaryForTide = !primaryObs || !primaryObs.tideHeight;

    if ((needSecondaryForWave || needSecondaryForTide) && targetSpot.secondaryWaveStationId) {
      secondaryObs = await fetchBuoyObservation(targetSpot.secondaryWaveStationId);
    }

    // 3. Resolve Wave Data
    let currentWaveHeight = "--";
    let currentWaveDir = "--";
    let currentWavePeriod = "--";
    let waveSource = "None";

    if (primaryObs && primaryObs.waveHeight) {
      currentWaveHeight = primaryObs.waveHeight;
      currentWaveDir = primaryObs.waveDir;
      currentWavePeriod = primaryObs.wavePeriod;
      waveSource = `Primary Buoy (${targetSpot.primaryWaveStationId})`;
    } else if (secondaryObs && secondaryObs.waveHeight) {
      currentWaveHeight = secondaryObs.waveHeight;
      currentWaveDir = secondaryObs.waveDir;
      currentWavePeriod = secondaryObs.wavePeriod;
      waveSource = `Backup Buoy (${targetSpot.secondaryWaveStationId})`;
    } else {
      console.log(`No wave data from Primary ${targetSpot.primaryWaveStationId} or Backup ${targetSpot.secondaryWaveStationId}`);
    }

    // 4. Resolve Tide Data (From F-A0021-001 Forecast)
    // User Request: 1. F-A0021-001 (Next Event) -> 2. "--"
    let currentTideLevel = "--";
    // This will be processed after fetching tideForecasts

    // Parallel Fetch (excluding wave data which is handled above)
    const [tideForecasts, weatherData, marineForecastData, sunriseData, windObservation] = await Promise.all([
      fetchTideForecast(targetSpot.tide.stationId),
      fetchWeatherData(targetSpot.weather.datasetId, targetSpot.weather.locationName),
      fetchMarineForecast(targetSpot.forecast.locationName),
      fetchSunriseSunset(targetSpot.weather.desc),
      targetSpot.windStationId ? fetchBuoyObservation(targetSpot.windStationId) : null
    ]);

    // Process Tide Forecast to get "Current" (Next Event)
    if (tideForecasts && Array.isArray(tideForecasts) && tideForecasts.length > 0) {
      const now = new Date();
      // Find first event in the future
      const nextEvent = tideForecasts.find(t => new Date(t.DateTime) > now);
      if (nextEvent) {
        const timeStr = new Date(nextEvent.DateTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
        currentTideLevel = `${nextEvent.Tide} ${timeStr}`;
      }
    }

    // Process Weather Data (Township)
    const weatherMap = {};
    if (weatherData && Array.isArray(weatherData)) {
      weatherData.forEach(item => {
        weatherMap[item.startTime] = item;
      });
    }

    // Process Marine Forecast (3-hourly)
    const marineForecastMap = {};
    if (marineForecastData && Array.isArray(marineForecastData)) {
      marineForecastData.forEach(item => {
        marineForecastMap[item.startTime] = item;
      });
    }

    // Combine Data
    const forecasts = [];
    const now = new Date();

    // Generate next 24 hours (3-hour intervals)
    for (let i = 0; i < 8; i++) {
      const time = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
      time.setMinutes(0, 0, 0);
      const timeStr = time.toISOString().replace(/\.\d{3}Z$/, "+08:00"); // Approximate ISO format

      // Find nearest weather forecast
      let weather = null;
      const weatherKeys = Object.keys(weatherMap).sort();
      const nearestWeatherKey = weatherKeys.find(k => new Date(k) >= time) || weatherKeys[weatherKeys.length - 1];
      weather = weatherMap[nearestWeatherKey] || {};

      forecasts.push({
        startTime: timeStr,
        temp: weather.temp || "--",
        windSpeed: weather.windSpeed || "--",
        windDir: weather.windDir || "--",
        rain: weather.rain || "0%",
        weather: weather.weather || "多雲"
      });
    }

    // Consolidate Current Weather
    const current = {
      startTime: forecasts[0]?.startTime || new Date().toISOString(),
      weather: forecasts[0]?.weather || "N/A",
      temp: forecasts[0]?.temp || "N/A",
      rain: forecasts[0]?.rain || "0%",
      windSpeed: windObservation?.windSpeed || forecasts[0]?.windSpeed || "--",
      windDir: windObservation?.windDir || forecasts[0]?.windDir || "--",
      waveHeight: currentWaveHeight,
      waveDir: currentWaveDir,
      wavePeriod: currentWavePeriod,
      tideLevel: currentTideLevel, // Prioritized Tide (Forecast Next Event)
      windSource: windObservation ? `Observation (${targetSpot.windStationId})` : "Forecast (F-D0047)",
      waveSource: waveSource
    };

    console.log(`✅ Success: ${targetSpot.name}`);
    console.log(`   Wind Source: ${current.windSource}`);
    console.log(`   Wave Source: ${current.waveSource}`);
    console.log(`   Current Wind Speed: ${current.windSpeed}`);
    console.log(`   Current Wave Height: ${current.waveHeight}`);
    console.log(`   Current Tide Level: ${current.tideLevel}`);

    res.json({
      success: true,
      city: targetSpot.name,
      data: {
        city: targetSpot.name,
        current: current,
        seaTemp: current.seaTemp,
        currentTide: current.tideLevel,
        windSource: current.windSource,
        tideForecasts: tideForecasts,
        forecasts: forecasts,
        sunrise: sunriseData?.sunrise || "--",
        sunset: sunriseData?.sunset || "--"
      }
    });

  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "歡迎來到芭比天氣 API 服務 ✨",
    status: "Running",
    endpoints: [
      { method: "GET", path: "/api/weather/nearby", description: "GPS 最近浪點" },
      { method: "GET", path: "/api/weather/:city", description: "指定浪點" }
    ]
  });
});

app.get("/api/weather/nearby", getWeather);
app.get("/api/weather/:city", getWeather);

app.listen(PORT, () => console.log(`🚀 Barbie Weather running on ${PORT}`));
