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
    "marine": { "dataset": "O-MMC-0001", "stationId": "C6AH2", "name": "富貴角浮標" },
    "windStationId": "C6AH2",
    "tide": { "dataset": "F-A0021-001", "stationId": "N00500", "name": "淡水" },
    "weather": { "datasetId": "F-D0047-069", "locationName": "石門區", "desc": "新北市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "富貴角" },
    "lat": 25.2866, "lon": 121.5195,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "外澳",
    "id": "waiao",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46694A", "name": "龍洞浮標" },
    "windStationId": "46694A",
    "tide": { "dataset": "F-A0021-001", "stationId": "I00100", "name": "烏石" },
    "weather": { "datasetId": "F-D0047-001", "locationName": "頭城鎮", "desc": "宜蘭縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "龍洞" },
    "lat": 24.8735, "lon": 121.8358,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "福隆",
    "id": "fulong",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46694A", "name": "龍洞浮標" },
    "windStationId": "46694A",
    "tide": { "dataset": "F-A0021-001", "stationId": "A01700", "name": "福隆" },
    "weather": { "datasetId": "F-D0047-069", "locationName": "貢寮區", "desc": "新北市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "龍洞" },
    "lat": 25.0205, "lon": 121.9443,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "中角灣",
    "id": "zhongjiao",
    "marine": { "dataset": "O-MMC-0001", "stationId": "C6AH2", "name": "富貴角浮標" },
    "windStationId": "C6AH2",
    "tide": { "dataset": "F-A0021-001", "stationId": "N00500", "name": "淡水" },
    "weather": { "datasetId": "F-D0047-069", "locationName": "金山區", "desc": "新北市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "富貴角" },
    "lat": 25.2245, "lon": 121.6345,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "翡翠灣",
    "id": "greenbay",
    "marine": { "dataset": "O-MMC-0001", "stationId": "C6AH2", "name": "富貴角浮標" },
    "windStationId": "C6AH2",
    "tide": { "dataset": "F-A0021-001", "stationId": "A00400", "name": "基隆" },
    "weather": { "datasetId": "F-D0047-069", "locationName": "萬里區", "desc": "新北市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "富貴角" },
    "lat": 25.1865, "lon": 121.6855,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "金山",
    "id": "jinshan",
    "marine": { "dataset": "O-MMC-0001", "stationId": "C6AH2", "name": "富貴角浮標" },
    "windStationId": "C6AH2",
    "tide": { "dataset": "F-A0021-001", "stationId": "A00400", "name": "基隆" },
    "weather": { "datasetId": "F-D0047-069", "locationName": "金山區", "desc": "新北市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "富貴角" },
    "lat": 25.2225, "lon": 121.6385,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "大溪",
    "id": "daxi",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46694A", "name": "龍洞浮標" },
    "windStationId": "46694A",
    "tide": { "dataset": "F-A0021-001", "stationId": "I00100", "name": "烏石" },
    "weather": { "datasetId": "F-D0047-001", "locationName": "頭城鎮", "desc": "宜蘭縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "龍洞" },
    "lat": 24.9355, "lon": 121.8955,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "宜蘭",
    "id": "yilan",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46694A", "name": "龍洞浮標" },
    "windStationId": "46694A",
    "tide": { "dataset": "F-A0021-001", "stationId": "10002030", "name": "蘇澳" },
    "weather": { "datasetId": "F-D0047-001", "locationName": "頭城鎮", "desc": "宜蘭縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "龍洞" },
    "lat": 24.8555, "lon": 121.8255,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "蘇澳",
    "id": "suao",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46708A", "name": "蘇澳浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "10002030", "name": "蘇澳" },
    "weather": { "datasetId": "F-D0047-001", "locationName": "蘇澳鎮", "desc": "宜蘭縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "蘇澳" },
    "lat": 24.5955, "lon": 121.8655,
    "sunriseSunset": { "dataset": "A-B0062-001" },
    "windStationId": "46708A" // Assuming the marine station is also the wind station for harbor data
  },
  {
    "name": "南灣",
    "id": "nanwan",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46759A", "name": "鵝鑾鼻浮標" },
    "windStationId": "46759A",
    "tide": { "dataset": "F-A0021-001", "stationId": "I05800", "name": "後壁湖" },
    "weather": { "datasetId": "F-D0047-033", "locationName": "恆春鎮", "desc": "屏東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" },
    "lat": 21.9565, "lon": 120.7635,
    "sunriseSunset": { "dataset": "A-B0062-001" },
    "windStationId": "46759A" // Assuming the marine station is also the wind station for harbor data
  },
  {
    "name": "佳樂水",
    "id": "jialeshui",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46759A", "name": "鵝鑾鼻浮標" },
    "windStationId": "46759A",
    "tide": { "dataset": "F-A0021-001", "stationId": "I05800", "name": "後壁湖" },
    "weather": { "datasetId": "F-D0047-033", "locationName": "滿州鄉", "desc": "屏東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" },
    "lat": 21.9935, "lon": 120.8455,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "墾丁大灣",
    "id": "dawan_kenting",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46759A", "name": "鵝鑾鼻浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "I05800", "name": "後壁湖" },
    "weather": { "datasetId": "F-D0047-033", "locationName": "恆春鎮", "desc": "屏東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" },
    "lat": 21.9455, "lon": 120.7955,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "墾丁白砂灣",
    "id": "baisha_kenting",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46759A", "name": "鵝鑾鼻浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "I05800", "name": "後壁湖" },
    "weather": { "datasetId": "F-D0047-033", "locationName": "恆春鎮", "desc": "屏東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" },
    "lat": 21.9355, "lon": 120.7155,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "風吹砂",
    "id": "fongchuisha",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46759A", "name": "鵝鑾鼻浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "I05800", "name": "後壁湖" },
    "weather": { "datasetId": "F-D0047-033", "locationName": "恆春鎮", "desc": "屏東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" },
    "lat": 21.9055, "lon": 120.8355,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "台東",
    "id": "taitung",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46761A", "name": "成功浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "10015010", "name": "臺東" },
    "weather": { "datasetId": "F-D0047-037", "locationName": "臺東市", "desc": "臺東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "臺東" },
    "lat": 22.7555, "lon": 121.1555,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "成功",
    "id": "chenggong",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46761A", "name": "成功浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "10014020", "name": "成功" },
    "weather": { "datasetId": "F-D0047-037", "locationName": "成功鎮", "desc": "臺東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "成功" },
    "lat": 23.1055, "lon": 121.3755,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "金樽",
    "id": "jinzun",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46761A", "name": "成功浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "10014020", "name": "成功" },
    "weather": { "datasetId": "F-D0047-037", "locationName": "東河鄉", "desc": "臺東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "成功" },
    "lat": 22.9555, "lon": 121.2855,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "花蓮",
    "id": "hualien",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46699A", "name": "花蓮浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "10010020", "name": "花蓮" },
    "weather": { "datasetId": "F-D0047-041", "locationName": "花蓮市", "desc": "花蓮縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "花蓮" },
    "lat": 23.9755, "lon": 121.6055,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "七星潭",
    "id": "cisingtan",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46699A", "name": "花蓮浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "10010020", "name": "花蓮" },
    "weather": { "datasetId": "F-D0047-041", "locationName": "新城鄉", "desc": "花蓮縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "花蓮" },
    "lat": 24.0255, "lon": 121.6355,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "高雄",
    "id": "kaohsiung",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46744A", "name": "高雄浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "12022010", "name": "高雄" },
    "weather": { "datasetId": "F-D0047-065", "locationName": "鼓山區", "desc": "高雄市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "高雄" },
    "lat": 22.6255, "lon": 120.2655,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "旗津",
    "id": "cijin",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46744A", "name": "高雄浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "12022010", "name": "高雄" },
    "weather": { "datasetId": "F-D0047-065", "locationName": "旗津區", "desc": "高雄市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "高雄" },
    "lat": 22.6055, "lon": 120.2755,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "台南",
    "id": "tainan",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46741A", "name": "安平浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "12022010", "name": "高雄" },
    "weather": { "datasetId": "F-D0047-073", "locationName": "安平區", "desc": "臺南市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "安平" },
    "lat": 22.9955, "lon": 120.1555,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "漁光島",
    "id": "yuguang",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46741A", "name": "安平浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "12022010", "name": "高雄" },
    "weather": { "datasetId": "F-D0047-073", "locationName": "安平區", "desc": "臺南市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "安平" },
    "lat": 22.9855, "lon": 120.1555,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "台中",
    "id": "taichung",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46706A", "name": "臺中浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "N01000", "name": "外埔" },
    "weather": { "datasetId": "F-D0047-077", "locationName": "清水區", "desc": "臺中市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "臺中" },
    "lat": 24.2555, "lon": 120.5055,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "大安",
    "id": "daan",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46706A", "name": "臺中浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "N01000", "name": "外埔" },
    "weather": { "datasetId": "F-D0047-077", "locationName": "大安區", "desc": "臺中市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "臺中" },
    "lat": 24.3855, "lon": 120.5755,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "苗栗",
    "id": "miaoli",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46706A", "name": "臺中浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "N01000", "name": "外埔" },
    "weather": { "datasetId": "F-D0047-013", "locationName": "竹南鎮", "desc": "苗栗縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "新竹" },
    "lat": 24.6855, "lon": 120.8655,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "竹南",
    "id": "zhunan",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46706A", "name": "臺中浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "N00800", "name": "新竹" },
    "weather": { "datasetId": "F-D0047-013", "locationName": "竹南鎮", "desc": "苗栗縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "新竹" },
    "lat": 24.6955, "lon": 120.8555,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "新竹",
    "id": "hsinchu",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46757A", "name": "新竹浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "N00800", "name": "新竹" },
    "weather": { "datasetId": "F-D0047-053", "locationName": "北區", "desc": "新竹市" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "新竹" },
    "lat": 24.8455, "lon": 120.9255,
    "sunriseSunset": { "dataset": "A-B0062-001" }
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
    const records = response.data.records;
    if (!records || !records.TideForecasts || !records.TideForecasts.Location) return [];

    const location = records.TideForecasts.Location.find(l => l.LocationID === locationId);
    if (!location) return [];

    // Return array of tide forecasts
    return location.TideForecasts.TideForecast || [];

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

    // Parallel Fetch
    const [marineData, tideForecasts, weatherData, marineForecastData, sunriseData, buoyObservation] = await Promise.all([
      fetchMarineData(targetSpot.marine.stationId),
      fetchTideForecast(targetSpot.tide.stationId),
      fetchWeatherData(targetSpot.weather.datasetId, targetSpot.weather.locationName),
      fetchMarineForecast(targetSpot.forecast.locationName),
      fetchSunriseSunset(targetSpot.weather.desc),
      targetSpot.windStationId ? fetchBuoyObservation(targetSpot.windStationId) : null
    ]);

    // Process Weather Data (Township)
    const weatherMap = {};
    if (weatherData && Array.isArray(weatherData)) {
      weatherData.forEach(item => {
        weatherMap[item.startTime] = item;
      });
    }

    // Get sorted times from the map
    const sortedTimes = Object.keys(weatherMap).sort();

    // Determine Current Wind Data (Priority: Observation -> Township Forecast)
    let currentWindSpeed = "--";
    let currentWindDir = "--";
    let activeWindSource = "None";

    // Determine Current Wave Data (Priority: Observation -> "--")
    let currentWaveHeight = "--";
    let currentWaveDir = "--";
    let currentWavePeriod = "--";

    if (buoyObservation) {
      // Wind
      if (buoyObservation.windSpeed && buoyObservation.windDir) {
        currentWindSpeed = buoyObservation.windSpeed;
        currentWindDir = buoyObservation.windDir;
        activeWindSource = "Observation (O-B0075-001)";
        console.log(`   Using Buoy Wind (O-B0075-001): ${currentWindSpeed}`);
      }

      // Wave
      if (buoyObservation.waveHeight) currentWaveHeight = buoyObservation.waveHeight;
      if (buoyObservation.waveDir) currentWaveDir = buoyObservation.waveDir;
      if (buoyObservation.wavePeriod) currentWavePeriod = buoyObservation.wavePeriod;
    }

    // Fallback for Wind ONLY (Township Forecast)
    if (activeWindSource === "None") {
      // Fallback to the first forecast entry (closest to now)
      const now = new Date();
      const currentForecast = sortedTimes.find(t => new Date(t) >= now);
      if (currentForecast && weatherMap[currentForecast]) {
        currentWindSpeed = weatherMap[currentForecast].windSpeed;
        currentWindDir = weatherMap[currentForecast].windDir;
        activeWindSource = "Township Forecast (F-D0047)";
        console.log(`   Using Township Forecast Wind: ${currentWindSpeed}`);
      }
    }

    // Construct Forecasts
    const forecasts = sortedTimes.map(startTime => {
      const w = weatherMap[startTime];
      return {
        startTime: w.startTime,
        weather: w.weather,
        temp: w.temp,
        rain: w.rain,
        windSpeed: w.windSpeed,
        windDir: w.windDir,
        waveHeight: "--",
        waveDir: "--",
        wavePeriod: "--",
        tideLevel: "--"
      };
    })
      .filter(f => new Date(f.startTime) >= new Date());

    // Current Conditions
    const current = {
      startTime: forecasts[0]?.startTime || new Date().toISOString(), // Add startTime
      temp: forecasts[0]?.temp || "--",
      weather: forecasts[0]?.weather || "--",
      windSpeed: currentWindSpeed, // Use prioritized wind
      windDir: currentWindDir,     // Use prioritized wind
      windSource: activeWindSource,
      waveHeight: currentWaveHeight, // Prioritized Wave
      waveDir: currentWaveDir,       // Prioritized Wave
      wavePeriod: currentWavePeriod, // Prioritized Wave
      seaTemp: marineData?.seaTemp || "--",
      tideLevel: tideForecasts[0]?.tideLevel || "--", // Approximate current tide
      rain: forecasts[0]?.rain || "0"
    };

    res.json({
      success: true,
      city: targetSpot.name,
      data: {
        city: targetSpot.name,
        current: current, // Added current object
        seaTemp: current.seaTemp,
        currentTide: current.tideLevel,
        windSource: current.windSource, // Added for verification
        tideForecasts: tideForecasts,
        forecasts: forecasts,
        sunrise: sunriseData ? sunriseData.sunrise : "--",
        sunset: sunriseData ? sunriseData.sunset : "--"
      }
    });

  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ error: "Backend Error", details: error.message });
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
