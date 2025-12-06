/**
 * Wind Analysis Module
 * 
 * Calculates wind type relative to surf spot orientation
 * to determine if wind is offshore (good), onshore (bad), or cross-shore
 */

/**
 * Normalizes an angle to be within 0-360 degrees
 */
function normalizeAngle(angle) {
    let normalized = angle % 360;
    if (normalized < 0) {
        normalized += 360;
    }
    return normalized;
}

/**
 * Calculates the smallest angular difference between two angles
 * Returns a value between 0 and 180 degrees
 */
function getAngularDifference(angle1, angle2) {
    const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2));
    return diff > 180 ? 360 - diff : diff;
}

/**
 * Parse wind direction text (e.g., "偏東風", "北風") to degrees
 * @param {string} windDirText - Wind direction in Chinese text
 * @returns {number|null} - Wind direction in degrees (0-360) or null if invalid
 */
function parseWindDirection(windDirText) {
    if (!windDirText || windDirText === "--") return null;

    // 風向映射表（以來向為準）
    const dirMap = {
        "北": 0, "偏北": 0,
        "東北": 45, "北東": 45,
        "東": 90, "偏東": 90,
        "東南": 135, "南東": 135,
        "南": 180, "偏南": 180,
        "西南": 225, "南西": 225,
        "西": 270, "偏西": 270,
        "西北": 315, "北西": 315
    };

    // 嘗試匹配風向文字
    for (const [key, angle] of Object.entries(dirMap)) {
        if (windDirText.includes(key)) {
            return angle;
        }
    }

    return null;
}

/**
 * Calculates wind type relative to a surf spot's orientation
 * 
 * @param {number} windDirection - Wind direction in degrees (0-360, where 0 is North, 90 is East)
 * @param {number} spotOrientation - The direction the beach faces (0-360, where 0 is North, 90 is East)
 * @returns {string} - 'offshore', 'onshore', or 'cross-shore'
 * 
 * Logic:
 * - Offshore wind: Wind blowing from land to sea (opposite to beach orientation)
 *   Angular difference between wind and beach orientation is close to 180° (±45°)
 * - Onshore wind: Wind blowing from sea to land (same as beach orientation)
 *   Angular difference between wind and beach orientation is close to 0° (±45°)
 * - Cross-shore wind: Wind blowing parallel to the shore
 *   Angular difference is around 90° (45° to 135°)
 */
function calculateWindType(windDirection, spotOrientation) {
    const angularDiff = getAngularDifference(windDirection, spotOrientation);

    // Offshore: wind direction is opposite to beach orientation (135° to 180°)
    if (angularDiff >= 135 && angularDiff <= 180) {
        return 'offshore';
    }

    // Onshore: wind direction is same as beach orientation (0° to 45°)
    if (angularDiff >= 0 && angularDiff <= 45) {
        return 'onshore';
    }

    // Cross-shore: wind is parallel to shore (45° to 135°)
    return 'cross-shore';
}

/**
 * Determines wind quality based on wind type
 * 
 * @param {string} windType - The type of wind relative to the surf spot
 * @returns {string} - Quality rating: 'excellent', 'good', 'fair', or 'poor'
 */
function getWindQuality(windType) {
    switch (windType) {
        case 'offshore':
            return 'excellent';
        case 'cross-shore':
            return 'fair';
        case 'onshore':
            return 'poor';
        default:
            return 'unknown';
    }
}

/**
 * Gets a human-readable description of the wind direction in Chinese
 * 
 * @param {number} direction - Wind direction in degrees
 * @returns {string} - Compass direction string (e.g., "北", "東北", "東", etc.)
 */
function getWindDirectionLabel(direction) {
    const normalized = normalizeAngle(direction);
    const directions = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
    const index = Math.round(normalized / 45) % 8;
    return directions[index];
}

/**
 * Analyze wind conditions for a surf spot
 * 
 * @param {string} windDirText - Wind direction text (e.g., "偏東風")
 * @param {number} windSpeed - Wind speed in km/h
 * @param {number} beachFacing - Beach facing direction in degrees
 * @returns {object} - Wind analysis result
 */
function analyzeWind(windDirText, windSpeed, beachFacing) {
    const windDirection = parseWindDirection(windDirText);

    if (windDirection === null || beachFacing === undefined) {
        return {
            type: 'unknown',
            quality: 'unknown',
            windDirection: null,
            windSpeed: windSpeed || 0,
            emoji: '❓'
        };
    }

    const windType = calculateWindType(windDirection, beachFacing);
    const quality = getWindQuality(windType);

    // Determine emoji based on wind type
    let emoji = '🌀';
    if (windType === 'offshore') emoji = '✨';
    else if (windType === 'cross-shore') emoji = '🌬️';
    else if (windType === 'onshore') emoji = '💨';

    return {
        type: windType,
        quality: quality,
        windDirection: windDirection,
        windSpeed: windSpeed || 0,
        emoji: emoji
    };
}

module.exports = {
    normalizeAngle,
    getAngularDifference,
    parseWindDirection,
    calculateWindType,
    getWindQuality,
    getWindDirectionLabel,
    analyzeWind
};
