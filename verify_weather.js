const axios = require('axios');

const BASE_URL = "http://localhost:3000/api/weather";
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
                    console.log(`   Wind Source: ${res.data.data.current.windSource}`);
                    console.log(`   Current Wind Speed: ${res.data.data.current.windSpeed}`);
                    console.log(`   Current Wind Dir: ${res.data.data.current.windDir}`);
                    console.log(`   Wave Source: ${res.data.data.current.waveSource}`);
                    console.log(`   Current Wave Height: ${res.data.data.current.waveHeight}`);
                    console.log(`   Current Wave Dir: ${res.data.data.current.waveDir}`);
                    console.log(`   Current Wave Period: ${res.data.data.current.wavePeriod}`);
                    console.log(`   Current Tide Level: ${res.data.data.current.tideLevel}`);
                    console.log(`   Current Tide Height: ${res.data.data.current.tideHeight}`);
                    console.log(`   Current Sea Temperature: ${res.data.data.current.seaTemp}`);

                    // Print first 3 forecasts
                    forecasts.slice(0, 3).forEach((f, i) => {
                        console.log(`[Forecast ${i}] Full Object: ${JSON.stringify(f)}`);
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
