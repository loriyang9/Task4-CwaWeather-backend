const axios = require('axios');
require('dotenv').config();

const CWA_API_KEY = process.env.CWA_API_KEY || "CWA-19156C62-430F-4412-9218-E18D31F7538D";
const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";

async function listLocations() {
    try {
        const url = `${CWA_API_BASE_URL}/v1/rest/datastore/F-A0010-001`;
        const res = await axios.get(url, {
            params: { Authorization: CWA_API_KEY }
        });

        const records = res.data.records || res.data.Records;
        if (!records || !records.location) {
            console.log("No locations found");
            return;
        }

        console.log("Available Marine Forecast Locations:");
        records.location.forEach(s => {
            console.log(s.locationName);
        });

    } catch (error) {
        console.error("Error fetching locations:", error.message);
    }
}

listLocations();
