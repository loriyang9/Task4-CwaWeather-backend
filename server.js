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
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "南灣",
    "id": "nanwan",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46759A", "name": "鵝鑾鼻浮標" },
    "tide": { "dataset": "F-A0021-001", "stationId": "I05800", "name": "後壁湖" },
    "weather": { "datasetId": "F-D0047-033", "locationName": "恆春鎮", "desc": "屏東縣" },
    "forecast": { "datasetId": "F-A0012-001", "locationName": "鵝鑾鼻" },
    "lat": 21.9565, "lon": 120.7635,
    "sunriseSunset": { "dataset": "A-B0062-001" }
  },
  {
    "name": "佳樂水",
    "id": "jialeshui",
    "marine": { "dataset": "O-MMC-0001", "stationId": "46759A", "name": "鵝鑾鼻浮標" },
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
async function fetchWeatherData(datasetId, locationName) {
  try {
    const url = `${CWA_API_BASE_URL}/v1/rest/datastore/${datasetId}`;
    const res = await axios.get(url, {
      params: {
        Authorization: CWA_API_KEY,
        locationName: locationName,
        elementName: "天氣現象,平均溫度,風向,風速,12小時降雨機率"
      }
    });

    const records = res.data.records || res.data.Records;
    if (!records) return [];

    const locations = records.locations || records.Locations;
    if (!locations) return [];

    const locationList = locations[0].location || locations[0].Location;
    if (!locationList) return [];

    const location = locationList[0];
    if (!location) return [];

    // Parse into a time-based map
    const weatherMap = {};

    location.WeatherElement.forEach(el => {
      const ename = el.ElementName;

      el.Time.forEach(t => {
        const startTime = t.StartTime || t.DataTime;
        if (!weatherMap[startTime]) weatherMap[startTime] = { startTime };

        // Handle both Chinese and English element names
        if (ename === "天氣現象" || ename === "Wx") {
          weatherMap[startTime].weather = t.ElementValue[0].Weather || t.ElementValue[0].value;
        }
        if (ename === "平均溫度" || ename === "T" || ename === "溫度") {
          weatherMap[startTime].temp = t.ElementValue[0].ElementValue || t.ElementValue[0].value || t.ElementValue[0].Temperature;
        }
        if (ename === "12小時降雨機率" || ename === "PoP12h" || ename === "PoP6h" || ename === "3小時降雨機率") {
          const val = t.ElementValue[0].ProbabilityOfPrecipitation || t.ElementValue[0].value;
          weatherMap[startTime].rain = val;
        }
        if (ename === "風速" || ename === "WS") {
          weatherMap[startTime].windSpeed = t.ElementValue[0].WindSpeed || t.ElementValue[0].value;
        }
        if (ename === "風向" || ename === "WD") {
          weatherMap[startTime].windDir = t.ElementValue[0].WindDirection || t.ElementValue[0].value;
        }
      });
    });

    // Fill forward missing weather and rain data
    const sortedTimes = Object.keys(weatherMap).sort();
    let lastWeather = null;
    let lastRain = null;

    sortedTimes.forEach(time => {
      const entry = weatherMap[time];
      if (entry.weather) {
        lastWeather = entry.weather;
      } else if (lastWeather) {
        entry.weather = lastWeather;
      }

      if (entry.rain) {
        lastRain = entry.rain;
      } else if (lastRain) {
        entry.rain = lastRain;
      }
    });

    // Convert to array and sort by time
    const forecasts = sortedTimes.map(startTime => {
      const w = weatherMap[startTime];
      return {
        startTime: w.startTime,
        weather: w.weather,
        temp: w.temp,
        rain: (w.rain && w.rain !== "undefined") ? String(w.rain).replace(/%/g, '') : "0",
        windSpeed: w.windSpeed,
        windDir: w.windDir,
        waveHeight: "--",
        waveDir: "--",
        wavePeriod: "--",
        tideLevel: "--"
      };
    })
      .filter(f => new Date(f.startTime) >= new Date()); // Filter past forecasts

    return forecasts;
  } catch (error) {
    console.error(`Weather fetch error for ${locationName}:`, error.message);
    return [];
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
    // Parallel Fetch
    const [marineData, tideForecasts, weatherData, marineForecastData, sunriseData] = await Promise.all([
      fetchMarineData(targetSpot.marine.stationId),
      fetchTideForecast(targetSpot.tide.stationId),
      fetchWeatherData(targetSpot.weather.datasetId, targetSpot.weather.locationName),
      fetchMarineForecast(targetSpot.forecast.locationName),
      fetchSunriseSunset(targetSpot.weather.desc) // Use county (desc) for sunrise
    ]);

    // Aggregate Data
    const forecasts = [];

    if (weatherData.length > 0) {
      weatherData.forEach((w, index) => {
        const forecast = {
          startTime: w.startTime,
          weather: w.weather,
          temp: w.temp,
          rain: (w.rain && w.rain !== "undefined") ? `${w.rain}%` : "0%",
          windSpeed: w.windSpeed,
          windDir: w.windDir,
          waveHeight: "--",
          waveDir: "--",
          wavePeriod: "--",
          tideLevel: "--"
        };

        // 1. Overlay Marine Forecast (F-A0012-001) if available for this time
        // Find matching marine forecast (approximate time match)
        if (marineForecastData.length > 0) {
          const mForecast = marineForecastData.find(mf => Math.abs(new Date(mf.startTime) - new Date(w.startTime)) < 3 * 60 * 60 * 1000); // within 3 hours
          if (mForecast) {
            forecast.waveHeight = mForecast.waveHeight || "--";
            forecast.wavePeriod = mForecast.wavePeriod || "--";
            forecast.waveDir = mForecast.waveDir || "--";
            forecast.windSpeed = mForecast.windSpeed || forecast.windSpeed; // Prefer marine wind? Or keep weather wind?
            // forecast.windDir = mForecast.windDir || forecast.windDir;
          }
        }

        // 2. If it's the first item (Current), overlay Real-time Marine & Tide Observation Data
        if (index === 0) {
          if (marineData) {
            forecast.waveHeight = marineData.waveHeight || forecast.waveHeight; // Prefer real-time
            forecast.waveDir = marineData.waveDir || forecast.waveDir || "--";
            forecast.wavePeriod = marineData.wavePeriod || forecast.wavePeriod || "--";
            forecast.windSpeed = marineData.windSpeed || forecast.windSpeed;
            forecast.windDir = marineData.windDir || forecast.windDir;
          }
          if (marineData && marineData.tideLevel) {
            forecast.tideLevel = marineData.tideLevel;
          }
        }

        forecasts.push(forecast);
      });
    }

    // Fallback if no data fetched (API Down)
    if (forecasts.length === 0) {
      forecasts.push({
        startTime: new Date().toISOString(),
        weather: "資料無法取得",
        temp: "--",
        rain: "--",
        windSpeed: marineData ? marineData.windSpeed : "--",
        windDir: marineData ? marineData.windDir : "--",
        waveHeight: marineData ? marineData.waveHeight : "--",
        waveDir: marineData ? marineData.waveDir : "--",
        wavePeriod: marineData ? marineData.wavePeriod : "--",
        tideLevel: marineData ? marineData.tideLevel : "--"
      });
    }

    res.json({
      success: true,
      city: targetSpot.name,
      data: {
        city: targetSpot.name,
        seaTemp: marineData ? marineData.seaTemp : "--",
        currentTide: marineData ? marineData.tideLevel : "--",
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
