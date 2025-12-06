const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const CWA_API_KEY = process.env.CWA_API_KEY;

async function analyzeWaveForecast() {
    console.log('🌊 Analyzing M-B0078-001 Wave Forecast Data Structure\n');

    // Read the saved response
    const data = JSON.parse(fs.readFileSync('m-b0078-001_fileapi_response.json', 'utf8'));

    const dataset = data.cwaopendata.dataset;
    const locations = dataset.location;

    console.log('📊 Dataset Info:');
    console.log('Description:', dataset.datasetInfo.datasetDescription);
    console.log('Issue Time:', dataset.datasetInfo.IssueTime);
    console.log('Start Time:', dataset.datasetInfo.StartTime);
    console.log('End Time:', dataset.datasetInfo.EndTime);
    console.log('\n' + '─'.repeat(60));

    // Group by LocationCode
    const locationGroups = {};
    locations.forEach(loc => {
        if (!locationGroups[loc.LocationCode]) {
            locationGroups[loc.LocationCode] = {
                name: loc.LocationName,
                longitude: loc.Longitude,
                latitude: loc.Latitude,
                forecasts: []
            };
        }
        locationGroups[loc.LocationCode].forecasts.push({
            DateTime: loc.DateTime,
            SignificantWaveHeight: loc.SignificantWaveHeight,
            WaveDirectionForecast: loc.WaveDirectionForecast,
            WavePeriod: loc.WavePeriod,
            OceanCurrentDirectionForecast: loc.OceanCurrentDirectionForecast,
            OceanCurrentSpeed: loc.OceanCurrentSpeed
        });
    });

    console.log(`\n📍 Available Locations: ${Object.keys(locationGroups).length}`);
    console.log('─'.repeat(60));

    // List all locations
    Object.entries(locationGroups).forEach(([code, data]) => {
        const forecastCount = data.forecasts.length;
        console.log(`${code.padEnd(10)} - ${data.name.padEnd(15)} (${data.longitude}, ${data.latitude}) - ${forecastCount} forecasts`);
    });

    // Show sample forecast for first location
    const firstLocationCode = Object.keys(locationGroups)[0];
    const firstLocation = locationGroups[firstLocationCode];

    console.log(`\n🔍 Sample Forecast for ${firstLocation.name} (${firstLocationCode}):`);
    console.log('─'.repeat(60));
    console.log('First 5 forecast periods:');
    firstLocation.forecasts.slice(0, 5).forEach(f => {
        console.log(`${f.DateTime}: 浪高 ${f.SignificantWaveHeight}m, 浪向 ${f.WaveDirectionForecast}, 週期 ${f.WavePeriod}s`);
        console.log(`           流向 ${f.OceanCurrentDirectionForecast}, 流速 ${f.OceanCurrentSpeed}m/s`);
    });

    // Save grouped data
    fs.writeFileSync('m-b0078-001_grouped.json', JSON.stringify(locationGroups, null, 2));
    console.log('\n📝 Grouped data saved to: m-b0078-001_grouped.json');

    // Find our surf spots
    console.log('\n🏄 Checking coverage for our surf spots:');
    console.log('─'.repeat(60));

    const ourSpots = {
        '白沙灣（石門）': ['白沙灣', '石門'],
        '外澳（雙獅）': ['外澳', '雙獅', '頭城'],
        '南灣': ['南灣', '墾丁'],
        '台東': ['台東']
    };

    Object.entries(ourSpots).forEach(([spotName, keywords]) => {
        const matches = Object.entries(locationGroups).filter(([code, data]) => {
            return keywords.some(kw => data.name.includes(kw));
        });

        if (matches.length > 0) {
            console.log(`✅ ${spotName}:`);
            matches.forEach(([code, data]) => {
                console.log(`   ${code} - ${data.name} (${data.forecasts.length} forecasts)`);
            });
        } else {
            console.log(`❌ ${spotName}: No match found`);
        }
    });
}

analyzeWaveForecast();
