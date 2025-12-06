/**
 * Board Suitability Analysis Module
 * 板型適用性分析 - 評估長板、短板、趣味板的適用程度
 */

/**
 * 評估長板適用性
 * @param {object} waveFeatures - 浪況特徵 {power, size, period}
 * @param {object} windFeatures - 風況特徵 {texture, strength}
 * @param {string} safetyLevel - 安全等級
 * @returns {object} 評估結果
 */
function assessLongboard(waveFeatures, windFeatures, safetyLevel) {
    const { power, size, period } = waveFeatures;
    const { texture, strength } = windFeatures;

    // 安全優先:危險條件不適合任何板型
    if (safetyLevel === 'danger') {
        return {
            suitability: 'unsuitable',
            reasoning: '危險海況不適合任何板型',
            emoji: '❌'
        };
    }

    // 完美條件:小浪 + 長週期 + 乾淨浪面
    if (
        ['ankle', 'knee', 'thigh', 'waist'].includes(size) &&
        ['ground-swell', 'long-period'].includes(period) &&
        ['glassy', 'clean'].includes(texture)
    ) {
        return {
            suitability: 'perfect',
            reasoning: '小浪配上長週期與乾淨浪面,長板能輕鬆起乘並享受滑行',
            emoji: '✅'
        };
    }

    // 良好條件:適當週期 + 小中浪
    if (
        ['ankle', 'knee', 'thigh', 'waist', 'chest'].includes(size) &&
        ['ground-swell', 'long-period', 'mixed'].includes(period)
    ) {
        if (['glassy', 'clean'].includes(texture)) {
            return {
                suitability: 'good',
                reasoning: '浪況適中,週期足夠,長板能發揮優勢',
                emoji: '👍'
            };
        } else if (texture === 'textured') {
            return {
                suitability: 'fair',
                reasoning: '浪高與週期適合長板,但浪面略顯凌亂',
                emoji: '😐'
            };
        }
    }

    // 尚可:極小浪但週期長
    if (size === 'flat' && ['ground-swell', 'long-period'].includes(period)) {
        return {
            suitability: 'fair',
            reasoning: '浪極小但週期長,長板仍可能抓到一些浪',
            emoji: '😐'
        };
    }

    // 具挑戰性:浪太大
    if (['shoulder', 'head', 'overhead', 'double-overhead'].includes(size)) {
        if (['heavy', 'dangerous'].includes(power)) {
            return {
                suitability: 'challenging',
                reasoning: '浪況強勁,長板較難控制且有安全疑慮',
                emoji: '⚠️'
            };
        }
        return {
            suitability: 'fair',
            reasoning: '浪稍大但仍可控,有經驗的長板玩家可嘗試',
            emoji: '😐'
        };
    }

    // 不適合:風浪週期短
    if (period === 'wind-swell') {
        return {
            suitability: 'challenging',
            reasoning: '風浪週期短,長板難以獲得足夠推力',
            emoji: '⚠️'
        };
    }

    // 預設:普通條件
    return {
        suitability: 'fair',
        reasoning: '條件普通,長板可以使用但非最佳狀態',
        emoji: '😐'
    };
}

/**
 * 評估短板適用性
 */
function assessShortboard(waveFeatures, windFeatures, safetyLevel) {
    const { power, size, period } = waveFeatures;
    const { texture } = windFeatures;

    // 安全優先
    if (safetyLevel === 'danger') {
        return {
            suitability: 'unsuitable',
            reasoning: '危險海況不適合任何板型',
            emoji: '❌'
        };
    }

    // 完美條件:中大浪 + 有力 + 乾淨浪面
    if (
        ['chest', 'shoulder', 'head'].includes(size) &&
        ['solid', 'heavy'].includes(power) &&
        ['glassy', 'clean'].includes(texture) &&
        ['ground-swell', 'long-period'].includes(period)
    ) {
        return {
            suitability: 'perfect',
            reasoning: '理想浪高配上紮實推力與乾淨浪面,短板能盡情發揮',
            emoji: '✅'
        };
    }

    // 良好條件:適當大小 + 推力
    if (
        ['waist', 'chest', 'shoulder'].includes(size) &&
        ['moderate', 'solid'].includes(power) &&
        period !== 'wind-swell'
    ) {
        if (['glassy', 'clean'].includes(texture)) {
            return {
                suitability: 'good',
                reasoning: '浪高與推力適中,短板能順利起乘並做動作',
                emoji: '👍'
            };
        } else if (texture === 'textured') {
            return {
                suitability: 'fair',
                reasoning: '浪況基本符合短板需求,但浪面略顯凌亂',
                emoji: '😐'
            };
        }
    }

    // 具挑戰性:浪太小
    if (
        ['flat', 'ankle', 'knee', 'thigh'].includes(size) &&
        power === 'weak'
    ) {
        return {
            suitability: 'challenging',
            reasoning: '浪太小且缺乏推力,短板難以起乘',
            emoji: '⚠️'
        };
    }

    // 尚可但需技術:小浪 + 長週期
    if (
        ['thigh', 'waist'].includes(size) &&
        ['ground-swell', 'long-period'].includes(period) &&
        ['glassy', 'clean'].includes(texture)
    ) {
        return {
            suitability: 'fair',
            reasoning: '浪小但週期長,有經驗的短板玩家仍可起乘',
            emoji: '😐'
        };
    }

    // 具挑戰性:大浪 + 短週期
    if (
        ['chest', 'shoulder', 'head'].includes(size) &&
        period === 'wind-swell'
    ) {
        return {
            suitability: 'challenging',
            reasoning: '浪雖大但週期短,缺乏推力且容易關門',
            emoji: '⚠️'
        };
    }

    // 具挑戰性:太大太強
    if (
        ['overhead', 'double-overhead'].includes(size) ||
        power === 'dangerous'
    ) {
        if (safetyLevel === 'warning') {
            return {
                suitability: 'challenging',
                reasoning: '浪況強勁,僅適合進階玩家',
                emoji: '⚠️'
            };
        }
        return {
            suitability: 'fair',
            reasoning: '大浪條件,適合有經驗的短板玩家挑戰',
            emoji: '😐'
        };
    }

    // 不適合:浪面被吹亂
    if (texture === 'blown-out') {
        return {
            suitability: 'challenging',
            reasoning: '浪面被風吹亂,難以做動作',
            emoji: '⚠️'
        };
    }

    // 預設
    return {
        suitability: 'fair',
        reasoning: '條件普通,短板可以使用但非最佳狀態',
        emoji: '😐'
    };
}

/**
 * 評估趣味板適用性
 */
function assessFunboard(waveFeatures, windFeatures, safetyLevel) {
    const { power, size } = waveFeatures;
    const { texture } = windFeatures;

    // 安全優先
    if (safetyLevel === 'danger') {
        return {
            suitability: 'unsuitable',
            reasoning: '危險海況不適合任何板型',
            emoji: '❌'
        };
    }

    // 完美條件:中等浪況
    if (
        ['thigh', 'waist', 'chest'].includes(size) &&
        ['moderate', 'solid'].includes(power) &&
        ['glassy', 'clean', 'textured'].includes(texture)
    ) {
        return {
            suitability: 'perfect',
            reasoning: '中等浪況,趣味板能兼顧起乘容易度與操控性',
            emoji: '✅'
        };
    }

    // 良好條件:廣泛範圍
    if (
        ['knee', 'thigh', 'waist', 'chest', 'shoulder'].includes(size) &&
        power !== 'dangerous' &&
        texture !== 'blown-out'
    ) {
        return {
            suitability: 'good',
            reasoning: '浪況適合趣味板的多功能特性',
            emoji: '👍'
        };
    }

    // 尚可:浪太小(長板更好)
    if (
        ['flat', 'ankle'].includes(size) &&
        power === 'weak'
    ) {
        return {
            suitability: 'fair',
            reasoning: '浪太小,長板會更容易起乘',
            emoji: '😐'
        };
    }

    // 尚可:浪太大(短板更好)
    if (
        ['head', 'overhead'].includes(size) &&
        ['heavy', 'dangerous'].includes(power)
    ) {
        return {
            suitability: 'fair',
            reasoning: '浪況強勁,短板會更靈活',
            emoji: '😐'
        };
    }

    // 具挑戰性
    if (texture === 'blown-out' || safetyLevel === 'warning') {
        return {
            suitability: 'challenging',
            reasoning: '條件不佳,影響趣味板的表現',
            emoji: '⚠️'
        };
    }

    // 預設:良好(趣味板多功能)
    return {
        suitability: 'good',
        reasoning: '趣味板的多功能性適合當前條件',
        emoji: '👍'
    };
}

/**
 * 決定推薦板型
 */
function determineRecommendedBoard(longboard, shortboard, funboard) {
    const scoreMap = {
        'perfect': 5,
        'good': 4,
        'fair': 3,
        'challenging': 2,
        'unsuitable': 1
    };

    const scores = {
        longboard: scoreMap[longboard.suitability] || 0,
        shortboard: scoreMap[shortboard.suitability] || 0,
        funboard: scoreMap[funboard.suitability] || 0
    };

    const maxScore = Math.max(scores.longboard, scores.shortboard, scores.funboard);

    // 如果都不適合
    if (maxScore <= 2) {
        return 'none';
    }

    // 如果趣味板分數最高或並列最高,推薦趣味板(最多功能)
    if (scores.funboard === maxScore) {
        return 'funboard';
    }

    // 否則推薦分數最高的
    if (scores.longboard === maxScore) return 'longboard';
    if (scores.shortboard === maxScore) return 'shortboard';

    return 'funboard'; // 預設
}

/**
 * 分析板型適用性(主函數)
 */
function analyzeBoardSuitability(waveFeatures, windFeatures, safetyLevel) {
    const longboard = assessLongboard(waveFeatures, windFeatures, safetyLevel);
    const shortboard = assessShortboard(waveFeatures, windFeatures, safetyLevel);
    const funboard = assessFunboard(waveFeatures, windFeatures, safetyLevel);

    const recommended = determineRecommendedBoard(longboard, shortboard, funboard);

    const boardNames = {
        'longboard': '長板',
        'shortboard': '短板',
        'funboard': 'Fun Board',
        'none': '無'
    };

    return {
        longboard,
        shortboard,
        funboard,
        recommended,
        recommendedName: boardNames[recommended]
    };
}

module.exports = {
    analyzeBoardSuitability,
    assessLongboard,
    assessShortboard,
    assessFunboard
};
