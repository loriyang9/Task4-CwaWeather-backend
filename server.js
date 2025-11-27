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

// === 城市座標資料庫 ===
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

function findNearestCity(lat, lon) {
  let nearest = TAIWAN_CITIES[0];
  let minDistance = Infinity;
  TAIWAN_CITIES.forEach((city) => {
    const dist = Math.sqrt(Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2));
    if (dist < minDistance) { minDistance = dist; nearest = city; }
  });
  return nearest.name;
}

const getWeather = async (req, res) => {
  try {
    if (!CWA_API_KEY) {
      return res.status(500).json({ error: "Server API Key Missing" });
    }

    let targetCityName = "臺北市";
    if (req.query.lat && req.query.lon) {
      targetCityName = findNearestCity(parseFloat(req.query.lat), parseFloat(req.query.lon));
    } else if (req.params.city) {
      const found = TAIWAN_CITIES.find(c => c.id === req.params.city.toLowerCase());
      if (found) targetCityName = found.name;
      else if (req.params.city === "kaohsiung") targetCityName = "高雄市";
    }

    console.log(`📡 正在請求城市: ${targetCityName}`);

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

    console.log(`✅ 成功回傳 ${targetCityName} 資料，共 ${forecasts.length} 筆`);

    res.json({
      success: true,
      city: locationData.LocationName, // 回傳實際抓到的城市名稱
      data: { city: locationData.LocationName, forecasts: forecasts }
    });

  } catch (error) {
    console.error("❌ 伺服器錯誤:", error.message);
    res.status(500).json({ error: "Backend Error", details: error.message });
  }
};

app.get("/", (req, res) => res.send("Barbie Weather Server is Running! 🎀"));
app.get("/api/weather/nearby", getWeather);
app.get("/api/weather/:city", getWeather);

app.listen(PORT, () => console.log(`🚀 Barbie Weather (3-Days) running on ${PORT}`));