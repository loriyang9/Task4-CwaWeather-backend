const axios = require('axios');
require('dotenv').config();

const CWA_API_KEY = process.env.CWA_API_KEY || "CWA-D5C068EB-8EB2-4374-A8F0-B5C04209BCA6";
const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";

function convertDegreesToDirection(degrees) {
    if (degrees === undefined || degrees === null || degrees === "None") return "--";
    const val = parseFloat(degrees);
    if (isNaN(val)) return "--";
    const directions = ["北", "北北東", "東北", "東北東", "東", "東南東", "東南", "南南東", "南", "南南西", "西南", "西南西", "西", "西北西", "西北", "北北西"];
    const index = Math.round(val / 22.5) % 16;
    return directions[index];
}

async function fetchBuoyObservation(stationId) {
    if (!stationId) return null;
    try {
        const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-B0075-001?Authorization=${CWA_API_KEY}&StationID=${stationId}`;
        console.log(`Fetching Buoy Observation (O-B0075-001): ${url}`);
        const response = await axios.get(url);

        const data = response.data;
        const records = data.Records || data.records;
        if (!records || !records.SeaSurfaceObs || !records.SeaSurfaceObs.Location) {
            console.error(`Buoy Observation structure error for ${stationId}`);
            return null;
        }

        const location = records.SeaSurfaceObs.Location.find(l => l.Station.StationID === stationId);
        if (!location) {
            console.error(`Station ${stationId} not found`);
            return null;
        }

        const observations = location.StationObsTimes.StationObsTime;
        observations.sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime));
        const latest = observations[0];

        if (!latest || !latest.WeatherElements) {
            console.error(`No WeatherElements for ${stationId}`);
            return null;
        }

        const we = latest.WeatherElements;
        const result = {};

        // Wave Data (Directly in WeatherElements)
        if (we) {
            result.waveHeight = (we.WaveHeight !== "None" && parseFloat(we.WaveHeight) >= 0) ? `${we.WaveHeight}m` : null;
            result.waveDir = (we.WaveDirection !== "None") ? convertDegreesToDirection(we.WaveDirection).replace("風", "") : null;
            result.wavePeriod = (we.WavePeriod !== "None" && parseFloat(we.WavePeriod) >= 0) ? `${we.WavePeriod}s` : null;
        }

        console.log(`Result for ${stationId}:`, result);
        return result;

    } catch (error) {
        console.error(`Buoy Observation fetch error for ${stationId}: ${error.message}`);
        return null;
    }
}

async function run() {
    console.log("Testing C6AH2 (Primary)...");
    const primary = await fetchBuoyObservation("C6AH2");

    console.log("\nTesting TPBU01 (Backup)...");
    const backup = await fetchBuoyObservation("TPBU01");
}

run();
