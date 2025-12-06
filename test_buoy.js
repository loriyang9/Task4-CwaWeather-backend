require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.CWA_API_KEY;

if (!apiKey) {
    console.error("❌ 無法讀取 API Key！請確認 .env 檔案中是否有設定 CWA_API_KEY");
    process.exit(1);
}

const STATIONS = [
    { id: 'TPBU01', name: '台北港浮標 (中角灣)' },
    { id: '46694A', name: '龍洞浮標 (福隆/蜜月灣)' },
    { id: '46708A', name: '龜山島浮標 (外澳/烏石)' },
    { id: 'COMC08', name: '彌陀浮標 (漁光島/旗津)' },
    { id: '46759A', name: '鵝鑾鼻浮標 (墾丁)' },
    { id: '46761F', name: '成功浮標 (台東)' }
];

async function test() {
    console.log(`🔍 正在取得所有可用浮標清單 (不指定 StationID)...`);
    try {
        const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-B0075-001?Authorization=${apiKey}`;
        const res = await axios.get(url);

        const data = res.data;
        const records = data.Records || data.records;

        if (records && records.SeaSurfaceObs && records.SeaSurfaceObs.Location) {
            const locations = records.SeaSurfaceObs.Location;
            console.log(`✅ 成功取得資料！共發現 ${locations.length} 個測站。`);

            console.log("📋 可用測站 ID 列表:");
            const availableIds = locations.map(l => `${l.Station.StationID} (${l.Station.StationName})`);
            console.log(availableIds.join('\n'));

            // Check if our target stations exist
            console.log("\n🔍 比對目標測站:");
            for (const station of STATIONS) {
                const found = locations.find(l => l.Station.StationID === station.id);
                if (found) {
                    console.log(`✅ ${station.name} (${station.id}): 存在`);
                } else {
                    console.log(`❌ ${station.name} (${station.id}): 不存在 (可能 ID 變更或維修中)`);
                }
            }
        } else {
            console.log("❌ 無法取得測站列表 (Records 為空)");
            console.log(`   Response: ${JSON.stringify(data, null, 2).slice(0, 500)}`);
        }
    } catch (e) {
        console.error(`❌ 發生錯誤: ${e.message}`);
    }
}

test();
