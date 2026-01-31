require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const WaveForecastCache = require("./WaveForecastCache");
const WAVE_FORECAST_MAPPING = require("./wave_location_mapping");
const { analyzeWind } = require("./windAnalysis");
const { generateWindNarrative, getWindQualityText, getWindTypeText } = require("./narrativeGeneration");
const { generateWaveNarrative } = require("./waveAnalysis");
const { analyzeBoardSuitability } = require("./boardSuitability");
const { generateOverallAssessment } = require("./interactionAnalysis");

const app = express();
const PORT = process.env.PORT || 3000;

const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";
const CWA_API_KEY = process.env.CWA_API_KEY;

if (!CWA_API_KEY) {
  console.error("⚠️ 警告：系統偵測不到 CWA_API_KEY，請至 Zeabur 設定環境變數！");
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running! 🏄‍♂️');
});


// Initialize Wave Forecast Cache
const waveForecastCache = new WaveForecastCache(CWA_API_KEY);

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
    "facing": 350,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "中角灣（金山）",
    "id": "zhongjiao_bay",
    "primaryWaveStationId": "TPBU01",
    "secondaryWaveStationId": "C6AH2",
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
    "lat": 25.2370,
    "lon": 121.6360,
    "facing": 20,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "福隆海水浴場",
    "id": "fulong",
    "primaryWaveStationId": "46694A",
    "secondaryWaveStationId": "OAC005",
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
    "lat": 25.0240,
    "lon": 121.9580,
    "facing": 40,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "蜜月灣（大溪）",
    "id": "honeymoon_bay",
    "primaryWaveStationId": "46708A",
    "secondaryWaveStationId": "OAC005",
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
    "lat": 24.9410,
    "lon": 121.8930,
    "facing": 100,
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
    "facing": 90,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "烏石港",
    "id": "wushi",
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
    "facing": 90,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "無尾港",
    "id": "wuwei",
    "primaryWaveStationId": "46708A",
    "secondaryWaveStationId": "46706A",
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
    "facing": 90,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "假日之森（竹南）",
    "id": "holiday_forest",
    "primaryWaveStationId": "46757B",
    "secondaryWaveStationId": "C6D01",
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
    "facing": 270,  // 面向西方(台灣海峽)
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "松柏港沙灘",
    "id": "songbo",
    "primaryWaveStationId": "46757B",
    "secondaryWaveStationId": "C6F01",
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
    "facing": 290,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "漁光島",
    "id": "yuguangdao",
    "primaryWaveStationId": "COMC08",
    "secondaryWaveStationId": "C6N01",
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
      "locationName": "安平港"
    },
    "lat": 22.9855,
    "lon": 120.1555,
    "facing": 270,
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
    "lat": 22.6160,
    "lon": 120.2654,
    "facing": 250,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "南灣",
    "id": "nanwan",
    "primaryWaveStationId": "46759A",
    "secondaryWaveStationId": "OAC007",
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
    "lat": 21.9440,
    "lon": 120.7612,
    "facing": 170,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "墾丁大灣",
    "id": "dawan_kenting",
    "primaryWaveStationId": "46759A",
    "secondaryWaveStationId": "OAC007",
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
    "lat": 21.9440,
    "lon": 120.7950,
    "facing": 190,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "墾丁白砂灣",
    "id": "baisha_kenting",
    "primaryWaveStationId": "46759A",
    "secondaryWaveStationId": "OAC007",
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
    "facing": 250,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "佳樂水",
    "id": "jialeshui",
    "primaryWaveStationId": "46759A",
    "secondaryWaveStationId": "OAC007",
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
    "facing": 60,
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
    "facing": 90,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "東河",
    "id": "donghe",
    "primaryWaveStationId": "46761F",
    "secondaryWaveStationId": "WRA007",
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
    "facing": 60,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "金樽",
    "id": "jinzung",
    "primaryWaveStationId": "46761F",
    "secondaryWaveStationId": "WRA007",
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
    "facing": 110,
    "sunriseSunset": {
      "dataset": "A-B0062-001"
    }
  },
  {
    "name": "台東",
    "id": "taitung",
    "primaryWaveStationId": "46761F",
    "secondaryWaveStationId": "WRA007",
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
    // 改為不指定 StationID，直接抓全部資料再過濾 (因為 API 的 StationID 篩選功能壞了)
    const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-B0075-001?Authorization=${CWA_API_KEY}`;
    console.log(`Fetching Buoy Observation (O-B0075-001): ${url} (Filtering for ${stationId} locally)`);
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
      // Note:TideHeight is often "None" for buoys, but we check it as requested.
      // TideLevel might be "-" or a value.
      const tide = we.TideHeight;
      result.tideHeight = (tide && tide !== "None" && tide !== "-" && !isNaN(parseFloat(tide))) ? tide : null;

      // Sea Temperature
      const seaTemp = we.SeaTemperature;
      result.seaTemp = (seaTemp && seaTemp !== "None" && seaTemp !== "-" && !isNaN(parseFloat(seaTemp))) ? `${seaTemp}°C` : null;
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

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestSpot(lat, lon) {
  // 只在真正的衝浪浪點中查找(與前端列表一致)
  // 排除那些只是城市名稱的浪點(如:新竹、台中、高雄等)
  const ACTUAL_SURF_SPOTS_IDS = [
    'baishawan_shimen', 'zhongjiao_bay', 'fulong', 'honeymoon_bay', 'waiao', 'wushi', 'wuwei',
    'holiday_forest', 'songbo', 'yuguangdao', 'qijin', 'nanwan', 'dawan_kenting',
    'baisha_kenting', 'jialeshui', 'gangkou', 'donghe', 'jinzung', 'taitung'
  ];

  const surfSpots = SURF_SPOTS.filter(spot => ACTUAL_SURF_SPOTS_IDS.includes(spot.id));

  let nearest = surfSpots[0];
  let minDistance = Infinity;

  console.log(`🔍 Finding nearest surf spot for coordinates: ${lat}, ${lon}`);

  surfSpots.forEach((spot) => {
    const dist = haversineDistance(lat, lon, spot.lat, spot.lon);
    console.log(`   - ${spot.name}: ${dist.toFixed(2)} km`);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = spot;
    }
  });

  console.log(`✅ Nearest surf spot: ${nearest.name} (${minDistance.toFixed(2)} km away)`);
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

    // Process Tide Forecast to get High Tide and Low Tide times
    let currentTideHeight = "--";
    let highTideTime = "--";  // 滿潮時間
    let lowTideTime = "--";   // 乾潮時間

    if (tideForecasts && Array.isArray(tideForecasts) && tideForecasts.length > 0) {
      const now = new Date();

      // Find next high tide (滿潮)
      const nextHighTide = tideForecasts.find(t =>
        new Date(t.DateTime) > now && t.Tide === "滿潮"
      );
      if (nextHighTide) {
        highTideTime = new Date(nextHighTide.DateTime).toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }

      // Find next low tide (乾潮)
      const nextLowTide = tideForecasts.find(t =>
        new Date(t.DateTime) > now && t.Tide === "乾潮"
      );
      if (nextLowTide) {
        lowTideTime = new Date(nextLowTide.DateTime).toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }

      // Keep the original tideLevel for backward compatibility (next event)
      const nextEvent = tideForecasts.find(t => new Date(t.DateTime) > now);
      if (nextEvent) {
        const timeStr = new Date(nextEvent.DateTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
        currentTideLevel = `${nextEvent.Tide} ${timeStr}`;

        // Extract tide height from the next event
        // TideHeights can have AboveTWVD, AboveLocalMSL, or AboveChartDatum
        if (nextEvent.TideHeights && nextEvent.TideHeights.AboveLocalMSL !== undefined) {
          currentTideHeight = `${nextEvent.TideHeights.AboveLocalMSL}cm`;
        }
      }
    }

    // 5. Resolve Sea Temperature (From Buoy Observations)
    // User Request: 1. Primary Buoy -> 2. Secondary Buoy -> 3. "--"
    let currentSeaTemp = "--";
    if (primaryObs && primaryObs.seaTemp) {
      currentSeaTemp = primaryObs.seaTemp;
    } else if (secondaryObs && secondaryObs.seaTemp) {
      currentSeaTemp = secondaryObs.seaTemp;
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

    // === Generate Wind Analysis Narrative ===
    let windNarrative = "風況資訊不足,無法分析。";
    let windType = "unknown";
    let windQuality = "--";

    // Parse wind speed (remove "km/h" and convert to number)
    const windSpeedNum = windObservation?.windSpeed
      ? parseFloat(windObservation.windSpeed.replace(/[^\d.-]/g, ''))
      : (forecasts[0]?.windSpeed ? parseFloat(forecasts[0].windSpeed.replace(/[^\d.-]/g, '')) : 0);

    // Generate narrative if we have wind direction and beach facing
    if ((windObservation?.windDir || forecasts[0]?.windDir) && targetSpot.facing !== undefined) {
      const windDirText = windObservation?.windDir || forecasts[0]?.windDir || "--";
      windNarrative = generateWindNarrative(windDirText, windSpeedNum, targetSpot.facing);

      // Get wind type for emoji reference
      const windAnalysis = analyzeWind(windDirText, windSpeedNum, targetSpot.facing);
      windType = windAnalysis.type;
      windQuality = getWindQualityText(windType);
    }

    // === Generate Wave Analysis Narrative ===
    let waveNarrative = "浪況資訊不足,無法分析。";

    // Parse wave height and period
    const waveHeight = currentWaveHeight !== "--" ? parseFloat(currentWaveHeight.replace(/[^\d.-]/g, '')) : 0;
    const wavePeriod = currentWavePeriod !== "--" ? parseFloat(currentWavePeriod.replace(/[^\d.-]/g, '')) : 0;

    // Generate wave narrative
    if (waveHeight > 0 && wavePeriod > 0) {
      waveNarrative = generateWaveNarrative(waveHeight, wavePeriod);
    }

    // === Generate Board Suitability Analysis ===
    let boardSuitability = {
      longboard: { suitability: 'fair', reasoning: '資訊不足', emoji: '😐' },
      shortboard: { suitability: 'fair', reasoning: '資訊不足', emoji: '😐' },
      funboard: { suitability: 'fair', reasoning: '資訊不足', emoji: '😐' },
      recommended: 'none',
      recommendedName: '無'
    };

    // Declare features at broader scope for use in both board suitability and overall assessment
    let waveFeatures = null;
    let windFeatures = null;
    let safetyLevel = 'safe';

    if (waveHeight > 0 && wavePeriod > 0) {
      // Extract wave features from waveAnalysis module
      const { categorizePeriod, determinePower } = require("./waveAnalysis");

      const periodInfo = categorizePeriod(wavePeriod);
      const power = determinePower(waveHeight, wavePeriod);

      // Categorize wave size
      let size = 'flat';
      if (waveHeight < 0.2) size = 'flat';
      else if (waveHeight < 0.4) size = 'ankle';
      else if (waveHeight < 0.6) size = 'knee';
      else if (waveHeight < 0.8) size = 'thigh';
      else if (waveHeight < 1.0) size = 'waist';
      else if (waveHeight < 1.3) size = 'chest';
      else if (waveHeight < 1.6) size = 'shoulder';
      else if (waveHeight < 2.0) size = 'head';
      else if (waveHeight < 2.5) size = 'overhead';
      else size = 'double-overhead';

      waveFeatures = {
        power: power === '軟弱' ? 'weak' : power === '普通' ? 'moderate' : power === '有力' ? 'solid' : power === '強勁' ? 'heavy' : 'dangerous',
        size: size,
        period: periodInfo.type
      };

      // Extract wind features based on wind type and speed
      let windTexture = 'clean';
      let windStrength = 'light';

      // Determine texture based on wind type and speed
      if (windType === 'offshore') {
        if (windSpeedNum < 5) windTexture = 'glassy';
        else if (windSpeedNum < 20) windTexture = 'clean';
        else if (windSpeedNum < 30) windTexture = 'textured';
        else windTexture = 'blown-out';
      } else if (windType === 'onshore') {
        if (windSpeedNum < 8) windTexture = 'glassy';
        else if (windSpeedNum < 15) windTexture = 'textured';
        else if (windSpeedNum < 25) windTexture = 'choppy';
        else windTexture = 'blown-out';
      } else { // cross-shore
        if (windSpeedNum < 10) windTexture = 'clean';
        else if (windSpeedNum < 20) windTexture = 'textured';
        else if (windSpeedNum < 30) windTexture = 'choppy';
        else windTexture = 'blown-out';
      }

      // Determine strength
      if (windSpeedNum < 5) windStrength = 'calm';
      else if (windSpeedNum < 15) windStrength = 'light';
      else if (windSpeedNum < 25) windStrength = 'moderate';
      else if (windSpeedNum < 35) windStrength = 'strong';
      else windStrength = 'dangerous';

      windFeatures = {
        texture: windTexture,
        strength: windStrength
      };

      // Determine safety level (simplified - based on wind strength and wave power)
      if (windStrength === 'dangerous' || waveFeatures.power === 'dangerous') {
        safetyLevel = 'danger';
      } else if (windStrength === 'strong' || waveFeatures.power === 'heavy') {
        safetyLevel = 'warning';
      }

      boardSuitability = analyzeBoardSuitability(waveFeatures, windFeatures, safetyLevel);
    }


    // === Generate Overall Assessment ===
    let overallAssessment = '綜合評估資訊不足。';

    if (waveHeight > 0 && wavePeriod > 0 && waveFeatures && windFeatures) {
      // Determine wind impact
      let windImpact = 'neutral';
      if (windType === 'offshore' && windSpeedNum < 20) {
        windImpact = 'positive';
      } else if (windType === 'onshore' && windSpeedNum > 15) {
        windImpact = 'negative';
      }

      // Update wind features with impact
      const windFeaturesWithImpact = {
        ...windFeatures,
        impact: windImpact
      };

      // Determine safety concerns
      const safetyConcerns = [];
      if (windFeatures.strength === 'dangerous') {
        safetyConcerns.push('危險風速');
      }
      if (waveFeatures.power === 'dangerous') {
        safetyConcerns.push('危險浪況');
      }
      if (windFeatures.strength === 'strong') {
        safetyConcerns.push('強風');
      }

      overallAssessment = generateOverallAssessment(
        waveFeatures,
        windFeaturesWithImpact,
        safetyLevel,
        safetyConcerns
      );
    }


    // Consolidate Current Weather
    const current = {
      startTime: forecasts[0]?.startTime || new Date().toISOString(),
      weather: forecasts[0]?.weather || "N/A",
      temp: forecasts[0]?.temp || "N/A",
      rain: forecasts[0]?.rain || "0%",
      windSpeed: windObservation?.windSpeed || forecasts[0]?.windSpeed || "--",
      windDir: windObservation?.windDir || forecasts[0]?.windDir || "--",
      windNarrative: windNarrative,  // 新增：自然語言風況描述
      windType: windType,              // 新增：風型 (offshore/onshore/cross-shore)
      windQuality: windQuality,        // 新增：風況品質 (優/普通/差)
      waveHeight: currentWaveHeight,
      waveDir: currentWaveDir,
      wavePeriod: currentWavePeriod,
      waveNarrative: waveNarrative,    // 新增：自然語言浪況描述
      tideLevel: currentTideLevel, // Prioritized Tide (Forecast Next Event)
      tideHeight: currentTideHeight, // Tide Height from F-A0021-001
      seaTemp: currentSeaTemp, // Sea Temperature from Buoy Observations
      highTideTime: highTideTime,  // 滿潮時間（僅時間）
      lowTideTime: lowTideTime,    // 乾潮時間（僅時間） F-A0021-001
      windSource: windObservation ? `Observation (${targetSpot.windStationId})` : "Forecast (F-D0047)",
      waveSource: waveSource,
      boardSuitability: boardSuitability,  // 新增：板型適用性分析
      overallAssessment: overallAssessment  // 新增：綜合評估
    };

    console.log(`✅ Success: ${targetSpot.name}`);
    console.log(`   Wind Source: ${current.windSource}`);
    console.log(`   Wave Source: ${current.waveSource}`);
    console.log(`   Current Wind Speed: ${current.windSpeed}`);
    console.log(`   Current Wave Height: ${current.waveHeight}`);
    console.log(`   Current Tide Level: ${current.tideLevel}`);

    // ===  6. Fetch Wave Forecast from M-B0078-001 ===
    // User Request: 1. M-B0078-001 -> 2. "--"
    let waveForecasts = [];

    try {
      // Get LocationCode for this surf spot
      const waveForecastLocationCode = WAVE_FORECAST_MAPPING[targetSpot.id];

      if (waveForecastLocationCode) {
        console.log(`Fetching wave forecast for ${waveForecastLocationCode}`);
        const forecasts = await waveForecastCache.getNextForecasts(waveForecastLocationCode, 24);

        // Format wave forecasts
        waveForecasts = forecasts.map(f => ({
          time: f.DateTime,
          waveHeight: f.SignificantWaveHeight ? `${f.SignificantWaveHeight}m` : "--",
          waveDir: f.WaveDirectionForecast || "--",
          wavePeriod: f.WavePeriod ? `${f.WavePeriod}s` : "--",
          currentDir: f.OceanCurrentDirectionForecast || "--",
          currentSpeed: f.OceanCurrentSpeed ? `${f.OceanCurrentSpeed}m/s` : "--"
        }));

        console.log(`   Wave Forecasts: ${waveForecasts.length} entries`);
      } else {
        console.log(`   No wave forecast location mapping for ${targetSpot.id}`);
      }
    } catch (error) {
      console.error(`Wave forecast error for ${targetSpot.id}:`, error.message);
    }

    res.json({
      success: true,
      city: targetSpot.name,
      spotId: targetSpot.id,  // 新增：返回浪點 ID 給前端
      data: {
        city: targetSpot.name,
        spotId: targetSpot.id,  // 新增：在 data 中也包含 spotId
        facing: targetSpot.facing || 0,  // 海灘朝向
        current: current,
        seaTemp: current.seaTemp,
        currentTide: current.tideLevel,
        windSource: current.windSource,
        tideForecasts: tideForecasts,
        forecasts: forecasts,
        waveForecasts: waveForecasts,  // New: M-B0078-001 wave forecasts
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
