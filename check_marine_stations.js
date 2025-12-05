const axios = require('axios');
require('dotenv').config();

const CWA_API_KEY = process.env.CWA_API_KEY || "CWA-19156C62-430F-4412-9218-E18D31F7538D";
const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";

async function checkMarineStations() {
    try {
        const url = `${CWA_API_BASE_URL}/v1/rest/datastore/O-B0075-001`;
        const res = await axios.get(url, {
            params: { Authorization: CWA_API_KEY, StationID: "46759A" }
        });

        const records = res.data.records || res.data.Records;
        if (!records || !records.SeaSurfaceObs || !records.SeaSurfaceObs.Location) {
            console.log("No stations found in O-B0075-001");
            return;
        }

        const stations = records.SeaSurfaceObs.Location;
        console.log(`Found ${stations.length} stations in O-B0075-001.`);

        // Target IDs to look for (from user's list)
        const targetIds = ["C4A03", "C4A05", "C4U02", "C4U01", "1220A", "C4E01", "11781", "C4P01", "C4R01", "C4S02", "C4S01", "C4W01"];

        console.log("\n--- Checking Target Tide Stations ---");
        targetIds.forEach(id => {
            const match = stations.find(s => s.StationID === id);
            if (match) {
                console.log(`[FOUND] ${id}: ${match.StationName}`);
                // Check if it has Tide Level data
                const obsTime = match.StationObsTimes.StationObsTime[0];
                if (obsTime && obsTime.WeatherElements) {
                    console.log(`   Data: TideLevel=${obsTime.WeatherElements.TideLevel}, WaveHeight=${obsTime.WeatherElements.WaveHeight}`);
                }
            } else {
                console.log(`[MISSING] ${id}`);
            }
        });

        console.log("\n--- First 10 Stations in Dataset ---");
        stations.slice(0, 10).forEach(s => {
            console.log(`${s.StationID}: ${s.StationName}`);
        });

    } catch (error) {
        console.error("Error fetching O-B0075-001:", error.message);
    }
}

checkMarineStations();
