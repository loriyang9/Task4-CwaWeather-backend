const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/weather';

const SURF_SPOTS = [
    "baishawan_shimen", "waiao", "fulong", "zhongjiao", "greenbay", "jinshan",
    "daxi", "yilan", "suao", "nanwan", "jialeshui", "dawan_kenting",
    "baisha_kenting", "fongchuisha", "taitung", "chenggong", "jinzun",
    "hualien", "cisingtan", "kaohsiung", "cijin", "tainan", "yuguang",
    "taichung", "daan", "miaoli", "zhunan", "hsinchu"
];

async function checkWaveData() {
    console.log("Checking Wave Data Availability for All Spots...\n");

    const results = [];

    for (const id of SURF_SPOTS) {
        try {
            const res = await axios.get(`${BASE_URL}/${id}`);
            const current = res.data.data.current;
            const hasWaveData = current.waveHeight !== "--";

            results.push({
                id: id,
                name: res.data.city,
                hasWaveData: hasWaveData,
                waveHeight: current.waveHeight,
                waveDir: current.waveDir,
                windSource: current.windSource
            });

            console.log(`${hasWaveData ? '✅' : '❌'} ${res.data.city} (${id}): Wave Height = ${current.waveHeight}`);
        } catch (error) {
            console.error(`⚠️ Error fetching ${id}: ${error.message}`);
            results.push({ id: id, error: true });
        }
    }

    console.log("\n--- Summary ---");
    const available = results.filter(r => r.hasWaveData);
    console.log(`Total Spots: ${results.length}`);
    console.log(`Spots with Wave Data: ${available.length}`);
    console.log("\nAvailable Spots:");
    available.forEach(r => {
        console.log(`- ${r.name}: ${r.waveHeight}m, ${r.waveDir} (${r.windSource})`);
    });
}

checkWaveData();
