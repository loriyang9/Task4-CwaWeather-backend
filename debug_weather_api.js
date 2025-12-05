require('dotenv').config();
const axios = require('axios');

const CWA_API_KEY = process.env.CWA_API_KEY;
const datasetId = "F-D0047-069";
const locationName = "石門區";

async function testFetch() {
    const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${datasetId}?Authorization=${CWA_API_KEY}&locationName=${encodeURIComponent(locationName)}`;
    console.log(`Fetching ${url}`);

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.success === "true") {
            console.log("✅ API Success");
            console.log("Records keys:", Object.keys(data.records));
            if (data.records.locations || data.records.Locations) {
                const locs = data.records.locations || data.records.Locations;
                const locList = locs[0].location || locs[0].Location;
                const location = locList[0];
                console.log(`Location: ${location.LocationName}`);

                const weatherElements = location.weatherElement || location.WeatherElement;
                if (weatherElements) {
                    console.log("WeatherElement found. Checking first element...");
                    const firstEl = weatherElements[0];
                    console.log("First Element Name:", firstEl.ElementName);
                    console.log("First Element Time[0]:", JSON.stringify(firstEl.Time[0], null, 2));

                    weatherElements.forEach(el => {
                        console.log(`Element: ${el.ElementName}`);
                        // Print first 5 time periods
                        if (el.Time && el.Time.length > 0) {
                            el.Time.slice(0, 5).forEach((t, i) => {
                                const time = t.StartTime || t.DataTime;
                                console.log(`  [${i}] ${time}`);
                            });
                        }
                    });

                } else {
                    console.log("❌ WeatherElement is undefined");
                    console.log("Location keys:", Object.keys(location));
                }
            } else {
                console.log("❌ data.records.locations is undefined");
                console.log("Records content:", JSON.stringify(data.records, null, 2).substring(0, 500));
            }
            weatherElements.forEach(el => {
                console.log(`Element: ${el.elementName}`);
                // Print first 3 time periods
                el.time.slice(0, 3).forEach((t, i) => {
                    console.log(`  [${i}] ${t.startTime} - ${t.elementValue[0].value}`);
                });
            });
        } else {
            console.error("❌ API Failed:", data);
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
}

testFetch();
