require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// 請確認這裡有拿到 Key，如果沒有會印出警告
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
      return res.status(500).json({ error: "Server Error: API Key is missing in environment variables." });
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

    // 呼叫 API：F-D0047-091 (鄉鎮未來1週天氣預報)
    const response = await axios.get(
      `${CWA_API_BASE_URL}/v1/rest/datastore/F-D0047-091`,
      {
        params: {
          Authorization: CWA_API_KEY,
          locationName: targetCityName,
          elementName: "Wx,T,PoP6h,PoP12h",
          sort: "time"
        },
        timeout: 8000 // 設定超時避免卡死
      }
    );

    // ★ 除錯重點：檢查資料結構是否存在
    // 使用 Optional Chaining (?.) 避免伺服器當機
    const locations = response.data?.records?.locations;

    if (!locations || !locations[0]) {
      // 如果拿不到資料，印出 API 回傳了什麼，方便除錯
      console.error("❌ CWA API 回傳格式不如預期:", JSON.stringify(response.data));
      return res.status(502).json({ error: "無法從氣象局取得資料，請檢查 API Key 或配額。" });
    }

    // 取得第一個地點（通常是該城市的第一個行政區，例如松山區）
    // F-D0047-091 回傳的是該縣市的所有鄉鎮，我們取第一個作為代表
    const locationData = locations[0].location?.[0];

    if (!locationData) {
      console.error("❌ 找不到該地點的 location 資料");
      return res.status(404).json({ error: `找不到 ${targetCityName} 的天氣資料` });
    }

    // 整理資料
    const elements = locationData.weatherElement.reduce((acc, curr) => {
      acc[curr.elementName] = curr.time;
      return acc;
    }, {});

    const forecasts = [];
    const limit = 24;

    if (elements["Wx"]) {
      for (let i = 0; i < Math.min(elements["Wx"].length, limit); i++) {
        const wxTime = elements["Wx"][i];
        const startTime = wxTime.startTime;
        const endTime = wxTime.endTime;

        // 找溫度
        const tempObj = (elements["T"] || []).find(t => t.dataTime === startTime);
        const temp = tempObj ? tempObj.elementValue[0].value : "--";

        // 找降雨率
        let rain = "0";
        const checkTime = (p) => (new Date(startTime) >= new Date(p.startTime) && new Date(endTime) <= new Date(p.endTime));

        const pop6 = (elements["PoP6h"] || []).find(checkTime);
        const pop12 = (elements["PoP12h"] || []).find(checkTime);

        if (pop6) rain = pop6.elementValue[0].value;
        else if (pop12) rain = pop12.elementValue[0].value;

        if (rain === " ") rain = "0";

        forecasts.push({
          startTime: startTime,
          weather: wxTime.elementValue[0].value,
          temp: temp,
          rain: rain + "%"
        });
      }
    }

    console.log(`✅ 成功取得資料，共 ${forecasts.length} 筆`);

    res.json({
      success: true,
      city: targetCityName,
      data: { city: targetCityName, forecasts: forecasts }
    });

  } catch (error) {
    console.error("❌ 伺服器錯誤:", error.message);
    // 印出詳細錯誤給 Zeabur Log
    if (error.response) {
      console.error("CWA Error Status:", error.response.status);
      console.error("CWA Error Data:", JSON.stringify(error.response.data));
    }
    res.status(500).json({ error: "Backend Error", details: error.message });
  }
};

app.get("/", (req, res) => res.send("Barbie Weather Server is Running! 🎀"));
app.get("/api/weather/nearby", getWeather);
app.get("/api/weather/:city", getWeather);

app.listen(PORT, () => console.log(`🚀 Barbie Weather (3-Days) running on ${PORT}`));