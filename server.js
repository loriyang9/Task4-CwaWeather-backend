require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// CWA API 設定
const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";
const CWA_API_KEY = process.env.CWA_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === 1. 定義台灣各縣市座標 (對應 CWA 的 locationName) ===
const TAIWAN_CITIES = [
  { name: "臺北市", lat: 25.032969, lon: 121.565418, id: "taipei" },
  { name: "新北市", lat: 25.016982, lon: 121.462786, id: "new_taipei" },
  { name: "桃園市", lat: 24.993628, lon: 121.300979, id: "taoyuan" },
  { name: "臺中市", lat: 24.147736, lon: 120.673648, id: "taichung" },
  { name: "臺南市", lat: 22.999728, lon: 120.227027, id: "tainan" },
  { name: "高雄市", lat: 22.627278, lon: 120.301435, id: "kaohsiung" },
  { name: "基隆市", lat: 25.127603, lon: 121.739183, id: "keelung" },
  { name: "新竹市", lat: 24.813829, lon: 120.96748, id: "hsinchu" },
  { name: "嘉義市", lat: 23.480075, lon: 120.449111, id: "chiayi" },
  { name: "新竹縣", lat: 24.839652, lon: 121.011566, id: "hsinchu_county" },
  { name: "苗栗縣", lat: 24.560159, lon: 120.821427, id: "miaoli" },
  { name: "彰化縣", lat: 24.051796, lon: 120.516135, id: "changhua" },
  { name: "南投縣", lat: 23.960998, lon: 120.695465, id: "nantou" },
  { name: "雲林縣", lat: 23.709203, lon: 120.431337, id: "yunlin" },
  { name: "嘉義縣", lat: 23.451843, lon: 120.255461, id: "chiayi_county" },
  { name: "屏東縣", lat: 22.674115, lon: 120.490043, id: "pingtung" },
  { name: "宜蘭縣", lat: 24.735159, lon: 121.761102, id: "yilan" },
  { name: "花蓮縣", lat: 23.987159, lon: 121.601571, id: "hualien" },
  { name: "臺東縣", lat: 22.761319, lon: 121.144476, id: "taitung" },
  { name: "澎湖縣", lat: 23.571189, lon: 119.579315, id: "penghu" },
  { name: "金門縣", lat: 24.449298, lon: 118.326254, id: "kinmen" },
  { name: "連江縣", lat: 26.158537, lon: 119.951093, id: "lianjiang" },
];

// === 2. 輔助函式：找出最近的城市 ===
function findNearestCity(lat, lon) {
  let nearest = TAIWAN_CITIES[0];
  let minDistance = Infinity;

  TAIWAN_CITIES.forEach((city) => {
    // 簡單的歐幾里得距離 (不需要考慮地球曲率，因為台灣範圍小)
    const distance = Math.sqrt(
      Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  });

  return nearest.name; // 回傳 CWA 需要的中文名稱 (如 "臺北市")
}

// === 3. 統一的天氣處理函式 ===
const getWeather = async (req, res) => {
  try {
    if (!CWA_API_KEY) {
      return res.status(500).json({ error: "API Key 未設定" });
    }

    let targetCityName = "臺北市"; // 預設值

    // 情境 A: 使用 GPS (Query Parameters: ?lat=...&lon=...)
    if (req.query.lat && req.query.lon) {
      const { lat, lon } = req.query;
      targetCityName = findNearestCity(parseFloat(lat), parseFloat(lon));
      console.log(`📡 GPS定位: (${lat}, ${lon}) -> ${targetCityName}`);
    }
    // 情境 B: 使用網址路徑 (Params: /api/weather/:city)
    else if (req.params.city) {
      // 簡單對應：如果傳入 "kaohsiung" 轉成 "高雄市"
      // 這裡做一個簡單的 map 搜尋
      const found = TAIWAN_CITIES.find(c => c.id === req.params.city.toLowerCase());
      if (found) {
        targetCityName = found.name;
      } else if (req.params.city === "kaohsiung") {
        // 為了相容你原本的寫法
        targetCityName = "高雄市";
      }
    }

    // 呼叫 CWA API
    const response = await axios.get(
      `${CWA_API_BASE_URL}/v1/rest/datastore/F-C0032-001`,
      {
        params: {
          Authorization: CWA_API_KEY,
          locationName: targetCityName, // 這裡變成動態的
        },
      }
    );

    const locationData = response.data.records.location[0];

    if (!locationData) {
      return res.status(404).json({ error: "查無此地點天氣資料" });
    }

    // 整理回傳資料 (保持你原本的格式)
    const weatherData = {
      city: locationData.locationName,
      updateTime: response.data.records.datasetDescription,
      forecasts: [],
    };

    const weatherElements = locationData.weatherElement;
    const timeCount = weatherElements[0].time.length;

    for (let i = 0; i < timeCount; i++) {
      // ... (這段解析邏輯跟你原本的一模一樣，不用動) ...
      const forecast = {
        startTime: weatherElements[0].time[i].startTime,
        endTime: weatherElements[0].time[i].endTime,
        weather: "", rain: "", minTemp: "", maxTemp: "", comfort: "", windSpeed: "",
      };

      weatherElements.forEach((element) => {
        const value = element.time[i].parameter;
        switch (element.elementName) {
          case "Wx": forecast.weather = value.parameterName; break;
          case "PoP": forecast.rain = value.parameterName + "%"; break;
          case "MinT": forecast.minTemp = value.parameterName + "°C"; break;
          case "MaxT": forecast.maxTemp = value.parameterName + "°C"; break;
          // ... 其他欄位
        }
      });
      weatherData.forecasts.push(forecast);
    }

    res.json({
      success: true,
      city: targetCityName, // 多回傳一個 city 名稱方便前端顯示
      data: weatherData,
    });

  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ error: "無法取得天氣資料" });
  }
};

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "芭比天氣 API 運作中 ✨",
    endpoints: {
      nearby: "/api/weather/nearby?lat=25.03&lon=121.56",
      city: "/api/weather/:city (e.g., /api/weather/hsinchu)"
    },
  });
});

app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// 1. GPS 定位路由 (放在 :city 之前以免衝突)
app.get("/api/weather/nearby", getWeather);

// 2. 指定城市路由 (支援英文 ID 或原本的寫法)
app.get("/api/weather/:city", getWeather);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "伺服器錯誤" });
});

app.listen(PORT, () => {
  console.log(`🚀 芭比氣象站已啟動 PORT: ${PORT}`);
});