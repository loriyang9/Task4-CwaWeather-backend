const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 快取管理
class WaveForecastCache {
    constructor() {
        this.cacheFile = path.join(__dirname, 'wave_forecast_cache.json');
        this.etag = null;
        this.data = null;
        this.lastFetchTime = null;

        // 啟動時載入快取
        this.loadCache();
    }

    loadCache() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                const cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
                this.etag = cache.etag;
                this.data = cache.data;
                this.lastFetchTime = new Date(cache.lastFetchTime);
                console.log('✅ Loaded cache from disk');
                console.log(`   ETag: ${this.etag}`);
                console.log(`   Last fetch: ${this.lastFetchTime}`);
            }
        } catch (error) {
            console.error('Failed to load cache:', error.message);
        }
    }

    saveCache() {
        try {
            fs.writeFileSync(this.cacheFile, JSON.stringify({
                etag: this.etag,
                data: this.data,
                lastFetchTime: this.lastFetchTime
            }));
            console.log('💾 Cache saved to disk');
        } catch (error) {
            console.error('Failed to save cache:', error.message);
        }
    }

    async fetchWaveForecast() {
        const url = 'https://opendata.cwa.gov.tw/fileapi/v1/opendataapi/M-B0078-001';
        const params = {
            Authorization: process.env.CWA_API_KEY,
            format: 'JSON'
        };

        // 建立 headers，如果有 ETag 就帶上
        const headers = {};
        if (this.etag) {
            headers['If-None-Match'] = this.etag;
            console.log(`📡 Fetching with ETag: ${this.etag}`);
        } else {
            console.log('📡 First fetch (no ETag)');
        }

        try {
            const response = await axios.get(url, {
                params,
                headers,
                validateStatus: (status) => status === 200 || status === 304
            });

            if (response.status === 304) {
                // 資料沒變！使用快取
                console.log('✅ 304 Not Modified - Using cached data');
                console.log(`   Saved bandwidth: ~2-5 MB!`);
                return this.data;
            }

            if (response.status === 200) {
                // 新資料
                this.etag = response.headers['etag'];
                this.data = response.data;
                this.lastFetchTime = new Date();

                console.log('✅ 200 OK - New data received');
                console.log(`   New ETag: ${this.etag}`);
                console.log(`   Data size: ${JSON.stringify(this.data).length} bytes`);

                // 儲存到硬碟
                this.saveCache();

                return this.data;
            }

        } catch (error) {
            console.error('❌ Fetch error:', error.message);
            // 如果有快取，回傳快取資料
            if (this.data) {
                console.log('⚠️ Using stale cache due to error');
                return this.data;
            }
            throw error;
        }
    }

    // 取得特定地點的預報
    getLocationForecast(locationCode) {
        if (!this.data) return null;

        const locations = this.data.cwaopendata.dataset.location;
        return locations.filter(loc => loc.LocationCode === locationCode);
    }

    // 取得下一個 3 小時預報
    getNextForecast(locationCode) {
        const forecasts = this.getLocationForecast(locationCode);
        if (!forecasts || forecasts.length === 0) return null;

        const now = new Date();
        const nextForecast = forecasts.find(f => new Date(f.DateTime) > now);

        return nextForecast;
    }

    // 檢查快取是否過期（建議 3-6 小時）
    isCacheStale(maxAgeHours = 3) {
        if (!this.lastFetchTime) return true;

        const ageMs = Date.now() - this.lastFetchTime.getTime();
        const ageHours = ageMs / (1000 * 60 * 60);

        return ageHours > maxAgeHours;
    }
}

// === 使用範例 ===

async function demo() {
    console.log('🌊 Wave Forecast Cache Demo');
    console.log('='.repeat(60));

    const cache = new WaveForecastCache();

    // 第一次請求
    console.log('\n1️⃣ First Request:');
    await cache.fetchWaveForecast();

    // 立即再請求一次（應該得到 304）
    console.log('\n2️⃣ Second Request (immediately):');
    await cache.fetchWaveForecast();

    // 取得特定地點預報
    console.log('\n3️⃣ Get forecast for location O00700 (南灣):');
    const nanwanNext = cache.getNextForecast('O00700');
    if (nanwanNext) {
        console.log('Next forecast:', {
            time: nanwanNext.DateTime,
            waveHeight: nanwanNext.SignificantWaveHeight + 'm',
            waveDir: nanwanNext.WaveDirectionForecast,
            period: nanwanNext.WavePeriod + 's'
        });
    }

    // 檢查快取狀態
    console.log('\n4️⃣ Cache status:');
    console.log(`   Is stale (3hr): ${cache.isCacheStale(3)}`);
    console.log(`   Is stale (6hr): ${cache.isCacheStale(6)}`);

    console.log('\n='.repeat(60));
    console.log('💡 Key Points:');
    console.log('   - First request: Downloads full data (~2-5MB)');
    console.log('   - Subsequent requests: Only ~1KB if unchanged (304)');
    console.log('   - Cache persists across server restarts');
    console.log('   - Recommended refresh: Every 3-6 hours');
}

// 執行示範
if (require.main === module) {
    demo();
}

module.exports = WaveForecastCache;
