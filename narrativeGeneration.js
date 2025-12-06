/**
 * Narrative Generation Module
 * 
 * Generates natural language descriptions for wind analysis
 */

const { analyzeWind } = require('./windAnalysis');

/**
 * Generate wind analysis narrative in natural Chinese
 * Combines speed, direction, and texture into impact assessment
 * 
 * @param {string} windDirText - Wind direction text (e.g., "偏東風")
 * @param {number} windSpeed - Wind speed in km/h
 * @param {number} beachFacing - Beach facing direction in degrees
 * @returns {string} - Natural language wind analysis
 */
function generateWindNarrative(windDirText, windSpeed, beachFacing) {
    const analysis = analyzeWind(windDirText, windSpeed, beachFacing);

    if (analysis.type === 'unknown') {
        return '風況資訊不足,無法分析。';
    }

    const speed = analysis.windSpeed;
    const windTypeMap = {
        'offshore': '離岸風',
        'onshore': '向岸風',
        'cross-shore': '側風',
    };
    const windTypeDesc = windTypeMap[analysis.type];

    // Generate narrative based on wind type and speed
    if (analysis.type === 'offshore') {
        // Offshore wind - generally good
        if (speed > 30) {
            // Strong offshore - dangerous
            return `${windTypeDesc} ${speed} km/h,風速過強,可能將衝浪者吹離岸邊,存在安全疑慮。`;
        } else if (speed >= 15 && speed <= 25) {
            // Ideal offshore
            return `${windTypeDesc} ${speed} km/h,受惠於理想的風向風速,浪面乾淨,條件優異。`;
        } else if (speed < 8) {
            // Light offshore - glassy
            return `風速極輕（${speed} km/h）,浪面平滑如鏡,接近完美的無風狀態。`;
        } else {
            // Moderate offshore
            return `${windTypeDesc} ${speed} km/h,風向良好,浪面整理得宜,適合衝浪。`;
        }
    } else if (analysis.type === 'onshore') {
        // Onshore wind - generally bad
        if (speed < 8) {
            // Light onshore - minimal impact
            return `${windTypeDesc} ${speed} km/h,風力輕微,對浪況影響有限。`;
        } else if (speed >= 8 && speed < 20) {
            // Moderate onshore
            return `${windTypeDesc} ${speed} km/h,受風況影響,浪面較為混亂,條件普通。`;
        } else {
            // Strong onshore
            return `${windTypeDesc} ${speed} km/h,強風吹向岸邊,浪面凌亂,條件不佳。`;
        }
    } else {
        // Cross-shore wind - neutral
        if (speed < 10) {
            return `${windTypeDesc} ${speed} km/h,風力溫和,浪況穩定,條件尚可。`;
        } else if (speed >= 10 && speed < 20) {
            return `${windTypeDesc} ${speed} km/h,受側風影響,浪面有些波動,條件普通。`;
        } else {
            return `${windTypeDesc} ${speed} km/h,側風較強,浪況不穩定,需謹慎評估。`;
        }
    }
}

/**
 * Get simple wind quality text (for backward compatibility)
 * 
 * @param {string} windType - Wind type ('offshore', 'onshore', 'cross-shore')
 * @returns {string} - Quality in Chinese ('優', '普通', '差')
 */
function getWindQualityText(windType) {
    const qualityMap = {
        'offshore': '優',
        'cross-shore': '普通',
        'onshore': '差',
        'unknown': '--'
    };
    return qualityMap[windType] || '--';
}

/**
 * Get wind type text in Chinese
 * 
 * @param {string} windType - Wind type ('offshore', 'onshore', 'cross-shore')
 * @returns {string} - Wind type in Chinese
 */
function getWindTypeText(windType) {
    const typeMap = {
        'offshore': '離岸風',
        'onshore': '向岸風',
        'cross-shore': '側風',
        'unknown': '風向未知'
    };
    return typeMap[windType] || '風向未知';
}

module.exports = {
    generateWindNarrative,
    getWindQualityText,
    getWindTypeText
};
