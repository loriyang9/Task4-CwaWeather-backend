/**
 * Wave Analysis Module
 * 浪況分析模塊 - 分析浪高、週期和能量
 */

/**
 * 將浪高轉換為身體比例描述
 * @param {number} height - 浪高(米)
 * @returns {string} 身體比例描述
 */
function getBodyHeightScale(height) {
    if (height < 0.2) return '平坦';
    if (height < 0.4) return '腳踝浪';
    if (height < 0.6) return '膝蓋浪';
    if (height < 0.8) return '大腿浪';
    if (height < 1.0) return '腰浪';
    if (height < 1.3) return '胸浪';
    if (height < 1.6) return '肩浪';
    if (height < 2.0) return '頭浪';
    if (height < 2.5) return '過頭浪';
    return '兩倍人高';
}

/**
 * 分類週期品質
 * @param {number} period - 週期(秒)
 * @returns {object} 週期分類和描述
 */
function categorizePeriod(period) {
    if (period < 6) {
        return { type: 'wind-swell', desc: '風浪', quality: '雜亂' };
    } else if (period < 9) {
        return { type: 'mixed', desc: '混合浪', quality: '普通' };
    } else if (period < 12) {
        return { type: 'ground-swell', desc: '湧浪', quality: '良好' };
    } else {
        return { type: 'long-period', desc: '長週期湧浪', quality: '優異' };
    }
}

/**
 * 根據浪高和週期判斷能量強度
 * @param {number} height - 浪高(米)
 * @param {number} period - 週期(秒)
 * @returns {string} 能量強度描述
 */
function determinePower(height, period) {
    // 短週期浪缺乏能量
    if (period < 6) {
        if (height < 0.8) return '軟弱';
        if (height < 1.5) return '普通';
        return '尚可';
    }

    // 混合週期 (6-9秒)
    if (period < 9) {
        if (height < 0.5) return '軟弱';
        if (height < 1.0) return '普通';
        if (height < 2.0) return '有力';
        return '強勁';
    }

    // 湧浪 (9-12秒) - 能量良好
    if (period < 12) {
        if (height < 0.4) return '軟弱';
        if (height < 0.8) return '普通';
        if (height < 1.5) return '有力';
        if (height < 2.5) return '強勁';
        return '危險';
    }

    // 長週期 (12+秒) - 能量優異
    if (height < 0.5) return '普通';
    if (height < 1.0) return '有力';
    if (height < 2.0) return '強勁';
    return '危險';
}

/**
 * 生成浪況自然語言描述
 * @param {number} height - 浪高(米)
 * @param {number} period - 週期(秒)
 * @returns {string} 自然語言描述
 */
function generateWaveNarrative(height, period) {
    // 處理無效數據
    if (height === undefined || period === undefined || height === 0 || period === 0) {
        return '浪況資訊不足,無法分析。';
    }

    const bodyScale = getBodyHeightScale(height);
    const periodInfo = categorizePeriod(period);
    const power = determinePower(height, period);

    // 生成描述
    const heightDesc = `浪高 ${height.toFixed(1)}m (${bodyScale})`;
    const periodDesc = `週期 ${period.toFixed(0)}秒（${periodInfo.desc}）`;
    const powerDesc = `浪況${power}`;

    return `${heightDesc}，${periodDesc}，${powerDesc}。`;
}

module.exports = {
    getBodyHeightScale,
    categorizePeriod,
    determinePower,
    generateWaveNarrative
};
