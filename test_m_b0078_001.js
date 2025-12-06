const axios = require('axios');
require('dotenv').config();

const CWA_API_KEY = process.env.CWA_API_KEY;
const BASE_URL = 'https://opendata.cwa.gov.tw';

async function testFileAPI() {
    console.log('\n=== Testing fileapi endpoint ===');
    const url = `${BASE_URL}/fileapi/v1/opendataapi/M-B0078-001?Authorization=${CWA_API_KEY}&format=JSON`;

    try {
        console.log(`URL: ${url}`);
        const response = await axios.get(url);
        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers['content-type']);
        console.log('ETag:', response.headers['etag']);

        // Check data structure
        const data = response.data;
        console.log('\nData Structure:');
        console.log('Top-level keys:', Object.keys(data));

        // Save full response for inspection
        const fs = require('fs');
        fs.writeFileSync('m-b0078-001_fileapi_response.json', JSON.stringify(data, null, 2));
        console.log('\n📝 Full response saved to: m-b0078-001_fileapi_response.json');

        return { success: true, data };
    } catch (error) {
        console.log('❌ Failed');
        console.log('Error:', error.response?.status, error.response?.statusText || error.message);
        return { success: false, error: error.message };
    }
}

async function testDatastoreAPI() {
    console.log('\n=== Testing rest/datastore endpoint ===');
    const url = `${BASE_URL}/api/v1/rest/datastore/M-B0078-001?Authorization=${CWA_API_KEY}`;

    try {
        console.log(`URL: ${url}`);
        const response = await axios.get(url);
        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Data keys:', Object.keys(response.data));

        return { success: true, data: response.data };
    } catch (error) {
        console.log('❌ Failed');
        console.log('Error:', error.response?.status, error.response?.statusText || error.message);
        return { success: false, error: error.message };
    }
}

async function testHistoryAPI() {
    console.log('\n=== Testing historyapi - checking available datasets ===');
    const url = `${BASE_URL}/historyapi/v1/getDataId/?Authorization=${CWA_API_KEY}`;

    try {
        console.log(`URL: ${url}`);
        const response = await axios.get(url);
        console.log('✅ Success!');

        const data = response.data;
        // Search for M-B0078-001
        const datasetList = data.dataid || data.dataId || data;
        console.log('\nSearching for M-B0078-001 in available datasets...');

        if (Array.isArray(datasetList)) {
            const found = datasetList.find(id => id.includes('M-B0078-001'));
            if (found) {
                console.log('✅ Found:', found);
            } else {
                console.log('❌ M-B0078-001 not found in history API');
            }
        } else {
            console.log('Dataset list structure:', typeof datasetList);
            console.log('Sample:', JSON.stringify(datasetList).substring(0, 200));
        }

        return { success: true, data };
    } catch (error) {
        console.log('❌ Failed');
        console.log('Error:', error.response?.status, error.response?.statusText || error.message);
        return { success: false, error: error.message };
    }
}

async function analyzeDataStructure(data) {
    console.log('\n=== Analyzing Data Structure ===');

    // Try to find location-based data
    const keys = Object.keys(data);
    console.log('Top-level keys:', keys);

    // Look for common patterns
    for (const key of keys) {
        const value = data[key];
        console.log(`\n${key}:`, typeof value);

        if (Array.isArray(value)) {
            console.log(`  - Array length: ${value.length}`);
            if (value.length > 0) {
                console.log(`  - First element keys:`, Object.keys(value[0]));
                console.log(`  - First element sample:`, JSON.stringify(value[0]).substring(0, 200));
            }
        } else if (typeof value === 'object' && value !== null) {
            console.log(`  - Object keys:`, Object.keys(value).slice(0, 10));
        }
    }
}

async function main() {
    console.log('🌊 Testing M-B0078-001 Wave Forecast API Integration');
    console.log('━'.repeat(60));

    // Test 1: fileapi (most likely to work)
    const fileApiResult = await testFileAPI();

    // Test 2: datastore
    const datastoreResult = await testDatastoreAPI();

    // Test 3: history
    const historyResult = await testHistoryAPI();

    // Summary
    console.log('\n' + '━'.repeat(60));
    console.log('📊 SUMMARY');
    console.log('━'.repeat(60));
    console.log('fileapi:    ', fileApiResult.success ? '✅ Success' : '❌ Failed');
    console.log('datastore:  ', datastoreResult.success ? '✅ Success' : '❌ Failed');
    console.log('historyapi: ', historyResult.success ? '✅ Success' : '❌ Failed');

    // If fileapi succeeded, analyze the data
    if (fileApiResult.success) {
        await analyzeDataStructure(fileApiResult.data);
    }
}

main();
