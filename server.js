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

// === 衝浪浪點座標資料庫 ===
const TAIWAN_SURF_SPOTS = [
  { name: "白沙灣（石門）", lat: 25.284275, lon: 121.519083, id: "baishawan_shimen", county: "新北市" },
  { name: "中角灣（金山）", lat: 25.240000, lon: 121.640000, id: "zhongjiao_bay", county: "新北市" },
  { name: "福隆海水浴場", lat: 25.020000, lon: 121.940000, id: "fulong", county: "新北市" },
  { name: "蜜月灣（大溪）", lat: 24.933000, lon: 121.889000, id: "honeymoon_bay", county: "宜蘭縣" },
  { name: "外澳（雙獅）", lat: 24.874350, lon: 121.841670, id: "waiao", county: "宜蘭縣" },
  { name: "烏石港", lat: 24.870634, lon: 121.835379, id: "wushi", county: "宜蘭縣" },
  { name: "無尾港", lat: 24.600000, lon: 121.856000, id: "wuwei", county: "宜蘭縣" },
  { name: "假日之森（竹南）", lat: 24.694834, lon: 120.853705, id: "holiday_forest", county: "苗栗縣" },
  { name: "松柏港沙灘", lat: 24.428920, lon: 120.617320, id: "songbo", county: "苗栗縣" },
  { name: "漁光島", lat: 22.981343, lon: 120.155064, id: "yuguangdao", county: "臺南市" },
  { name: "旗津海水浴場", lat: 22.610922, lon: 120.266755, id: "cijin", county: "高雄市" },
  { name: "南灣", lat: 21.980464, lon: 120.751608, id: "nanwan", county: "屏東縣" },
  { name: "墾丁大灣", lat: 21.959417, lon: 120.762250, id: "dawan_kenting", county: "屏東縣" },
  { name: "墾丁白砂灣", lat: 21.937056, lon: 120.710694, id: "baisha_kenting", county: "屏東縣" },
  { name: "佳樂水", lat: 21.959875, lon: 120.765303, id: "jialeshui", county: "屏東縣" },
  { name: "港口（滿州）", lat: 21.988342, lon: 120.841843, id: "gangkou", county: "屏東縣" },
  { name: "東河", lat: 22.973750, lon: 121.311028, id: "donghe", county: "臺東縣" },
  { name: "金樽", lat: 22.954000, lon: 121.293000, id: "jinzun", county: "臺東縣" },
  { name: "都蘭海灘", lat: 22.878800, lon: 121.219600, id: "dulan", county: "臺東縣" },
  { name: "山水沙灘（澎湖）", lat: 23.513222, lon: 119.591111, id: "shanshui_penghu", county: "澎湖縣" }
];

function findNearestSpot(lat, lon) {
  let nearest = TAIWAN_SURF_SPOTS[0];
  let minDistance = Infinity;
  TAIWAN_SURF_SPOTS.forEach((spot) => {
    const dist = Math.sqrt(Math.pow(spot.lat - lat, 2) + Math.pow(spot.lon - lon, 2));
    if (dist < minDistance) { minDistance = dist; nearest = spot; }
  });
  return nearest;
}

const getWeather = async (req, res) => {
  try {
    if (!CWA_API_KEY) {
      return res.status(500).json({ error: "Server API Key Missing" });
    }

    let targetSpot = TAIWAN_SURF_SPOTS.find(s => s.id === "waiao"); // 預設外澳

    if (req.query.lat && req.query.lon) {
      targetSpot = findNearestSpot(parseFloat(req.query.lat), parseFloat(req.query.lon));
    } else if (req.params.city) {
      const found = TAIWAN_SURF_SPOTS.find(c => c.id === req.params.city.toLowerCase());
      if (found) targetSpot = found;
    }

    const targetCityName = targetSpot.county; // 使用縣市名稱去查 API
    console.log(`📡 正在請求浪點: ${targetSpot.name} (${targetCityName})`);

    // 使用 F-D0047-091 (一週預報)
    const response = await axios.get(
      `${CWA_API_BASE_URL}/v1/rest/datastore/F-D0047-091`,
      {
        params: {
          Authorization: CWA_API_KEY,
          elementName: "天氣現象,平均溫度,12小時降雨機率", // 使用中文名稱請求
          sort: "time"
        },
        timeout: 8000
      }
    );

    // ★ 關鍵修正 1：處理大小寫與結構 (Locations vs locations)
    const records = response.data?.records;
    const rawLocations = records?.Locations || records?.locations;

    if (!rawLocations || !rawLocations[0]) {
      console.error("❌ CWA API 回傳結構異常", JSON.stringify(response.data).substring(0, 200));
      return res.status(502).json({ error: "API Response Error" });
    }

    // ★ 關鍵修正 2：在陣列中尋找城市 (Location vs location)
    // 氣象局回傳的是所有縣市的列表，我們必須用 find 找對應的城市
    const citiesList = rawLocations[0].Location || rawLocations[0].location;

    let locationData = citiesList.find(c => c.LocationName === targetCityName);

    // 找不到時的備案 (例如找 "新竹市" 但 API 只給 "新竹縣")
    if (!locationData) {
      console.log(`⚠️ 找不到 ${targetCityName}，嘗試模糊搜尋...`);
      locationData = citiesList.find(c => targetCityName.includes(c.LocationName) || c.LocationName.includes(targetCityName.substring(0, 2)));
    }

    if (!locationData) {
      // 真的找不到，就拿列表第一個當預設值，避免當機
      console.error(`❌ 真的找不到 ${targetCityName}，使用預設資料`);
      locationData = citiesList[0];
    }

    // ★ 關鍵修正 3：對應中文欄位名稱
    // API 回傳的是: "天氣現象", "平均溫度", "12小時降雨機率"
    const elements = locationData.WeatherElement.reduce((acc, curr) => {
      acc[curr.ElementName] = curr.Time;
      return acc;
    }, {});

    const forecasts = [];
    // 我們以 "天氣現象" 的時間軸為基準
    const timeSteps = elements["天氣現象"] || [];
    const limit = 20; // 取前 20 筆資料

    for (let i = 0; i < Math.min(timeSteps.length, limit); i++) {
      const step = timeSteps[i];
      const startTime = step.StartTime;
      const endTime = step.EndTime;

      // 1. 取得天氣 (Key: Weather)
      const weather = step.ElementValue[0].Weather;

      // 2. 取得溫度 (Key: Temperature)
      // 需對應時間
      const tempStep = (elements["平均溫度"] || []).find(t => t.StartTime === startTime);
      const temp = tempStep ? tempStep.ElementValue[0].Temperature : "--";

      // 3. 取得降雨機率 (Key: ProbabilityOfPrecipitation)
      const rainStep = (elements["12小時降雨機率"] || []).find(t => t.StartTime === startTime);
      let rain = rainStep ? rainStep.ElementValue[0].ProbabilityOfPrecipitation : "0";
      if (rain === " " || rain === "-") rain = "0"; // 處理空值

      forecasts.push({
        startTime: startTime,
        endTime: endTime,
        weather: weather,
        temp: temp,
        rain: rain + "%"
      });
    }

    console.log(`✅ 成功回傳 ${targetSpot.name} 資料，共 ${forecasts.length} 筆`);

    res.json({
      success: true,
      city: targetSpot.name, // 回傳浪點名稱 (例如：外澳) 而不是縣市名稱
      data: { city: targetSpot.name, forecasts: forecasts }
    });

  } catch (error) {
    console.error("❌ 伺服器錯誤:", error.message);
    res.status(500).json({ error: "Backend Error", details: error.message });
  }
};

// === 修改這裡：讓首頁顯示 API 列表 (符合作業要求) ===
app.get("/", (req, res) => {
  res.json({
    message: "歡迎來到芭比天氣 API 服務 ✨",
    status: "Running",
    endpoints: [
      {
        method: "GET",
        path: "/api/weather/nearby",
        description: "根據 GPS 經緯度取得最近城市天氣 (未來 3 天)",
        params: { lat: "緯度", lon: "經度" },
        example: "https://weather-task4.zeabur.app/api/weather/nearby?lat=25.03&lon=121.56"
      },
      {
        method: "GET",
        path: "/api/weather/:city",
        description: "取得特定縣市天氣",
        example: "https://weather-task4.zeabur.app/api/weather/taipei"
      }
    ]
  });
});

// 其他路由保持不變
app.get("/api/weather/nearby", getWeather);
app.get("/api/weather/:city", getWeather);

app.listen(PORT, () => console.log(`🚀 Barbie Weather (3-Days) running on ${PORT}`));
