const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/weather';
const SPOTS = ['baishawan_shimen', 'waiao', 'nanwan', 'taitung'];

async function verifyWeather() {
    console.log('Starting Weather Verification...');

    for (const spot of SPOTS) {
        try {
            console.log(`\nTesting ${spot}...`);
            const res = await axios.get(`${BASE_URL}/${spot}`);

            if (res.data.success) {
                const forecasts = res.data.data.forecasts;
                if (forecasts && forecasts.length > 0) {
                    console.log(`✅ Success: ${res.data.city}`);

                    // Print first 3 forecasts
                    forecasts.slice(0, 3).forEach((f, i) => {
                        console.log(`\n[Forecast ${i}] Time: ${f.startTime}`);
                        console.log(`   Temp: ${f.temp}`);
                        console.log(`   Rain: ${f.rain}`);
                        console.log(`   Weather: ${f.weather}`);
                        console.log(`   Wind: ${f.windSpeed}`);
                    });

                } else {
                    console.error(`❌ Error: No forecasts returned for ${spot}`);
                }
            } else {
                console.error(`❌ API Error for ${spot}: ${res.data.error}`);
            }
        } catch (error) {
            console.error(`❌ Request Failed for ${spot}: ${error.message}`);
        }
    }
}

verifyWeather();
