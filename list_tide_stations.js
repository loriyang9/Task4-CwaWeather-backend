const axios = require('axios');
require('dotenv').config();

const CWA_API_KEY = process.env.CWA_API_KEY || "CWA-19156C62-430F-4412-9218-E18D31F7538D"; // Use hardcoded key if env not loaded
const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";

async function listStations() {
    try {
        const url = `${CWA_API_BASE_URL}/v1/rest/datastore/F-A0021-001`;
        const res = await axios.get(url, {
            params: { Authorization: CWA_API_KEY }
        });

        const records = res.data.records || res.data.Records;
        if (!records || !records.TideForecasts) {
            console.log("No forecasts found");
            return;
        }

        console.log("Available Tide Forecast Locations:");
        records.TideForecasts.forEach(s => {
            console.log(`${s.Location.LocationId}: ${s.Location.LocationName}`);
        });

    } catch (error) {
        console.error("Error fetching stations:", error.message);
    }
}

listStations();
