/**
 * Interaction Analysis Module
 * 互動分析模塊 - 分析浪、風、安全之間的關係
 */

/**
 * 分析浪力量 vs 風面紋理的互動
 */
function analyzeWavePowerVsTexture(wavePower, waveSize, windTexture) {
    // 浪面被吹亂
    if (windTexture === 'blown-out') {
        return {
            type: 'conflict',
            description: '浪面被風吹亂，影響浪況品質',
            impact: 'negative'
        };
    }

    // 鏡面或乾淨條件提升品質
    if (windTexture === 'glassy' || windTexture === 'clean') {
        // 特殊協同:小浪 + 鏡面 = 適合長板
        if (wavePower === 'weak' || wavePower === 'moderate') {
            return {
                type: 'synergy',
                description: '小浪配上鏡面般的浪面，適合長板',
                impact: 'positive'
            };
        }

        // 有力的浪 + 乾淨浪面 = 優異
        if (wavePower === 'solid' || wavePower === 'heavy') {
            return {
                type: 'synergy',
                description: '有力的浪配上乾淨的浪面',
                impact: 'positive'
            };
        }
    }

    // 浪面凌亂
    if (windTexture === 'choppy') {
        return {
            type: 'conflict',
            description: '浪面凌亂，降低浪況品質',
            impact: 'negative'
        };
    }

    // 中性
    return {
        type: 'neutral',
        description: '浪面質地普通',
        impact: 'neutral'
    };
}

/**
 * 分析週期 vs 浪高的互動
 */
function analyzePeriodVsHeight(period, size) {
    // 長週期 + 小浪 = 適合長板
    if (
        (period === 'ground-swell' || period === 'long-period') &&
        (size === 'ankle' || size === 'knee' || size === 'thigh' || size === 'waist')
    ) {
        return {
            type: 'synergy',
            description: '雖然浪小，但長週期帶來紮實的推力',
            impact: 'positive'
        };
    }

    // 短週期 + 大浪 = 缺乏能量
    if (
        period === 'wind-swell' &&
        (size === 'chest' || size === 'shoulder' || size === 'head' || size === 'overhead')
    ) {
        return {
            type: 'conflict',
            description: '浪雖大但週期短，缺乏推力',
            impact: 'negative'
        };
    }

    // 長週期 + 大浪 = 優異協同
    if (
        (period === 'ground-swell' || period === 'long-period') &&
        (size === 'chest' || size === 'shoulder' || size === 'head')
    ) {
        return {
            type: 'synergy',
            description: '長週期配上適中浪高，能量充沛',
            impact: 'positive'
        };
    }

    // 中性
    return {
        type: 'neutral',
        description: '浪高與週期搭配普通',
        impact: 'neutral'
    };
}

/**
 * 分析風 vs 安全的互動
 */
function analyzeWindVsSafety(windStrength, windImpact) {
    // 危險風速
    if (windStrength === 'dangerous') {
        return {
            type: 'conflict',
            description: '風速過強，存在安全疑慮',
            impact: 'negative'
        };
    }

    // 強風
    if (windStrength === 'strong') {
        return {
            type: 'conflict',
            description: '風力較強，需注意安全',
            impact: 'negative'
        };
    }

    // 理想風況
    if (windImpact === 'positive') {
        return {
            type: 'synergy',
            description: '風向風速理想',
            impact: 'positive'
        };
    }

    // 中性
    return {
        type: 'neutral',
        description: '風況普通',
        impact: 'neutral'
    };
}

/**
 * 判斷整體協同程度
 */
function determineOverallSynergy(wavePowerVsTexture, periodVsHeight, windVsSafety, safetyLevel) {
    // 安全疑慮 = 差
    if (safetyLevel === 'danger' || safetyLevel === 'warning') {
        return 'poor';
    }

    const interactions = [wavePowerVsTexture, periodVsHeight, windVsSafety];
    const positiveCount = interactions.filter(i => i.impact === 'positive').length;
    const negativeCount = interactions.filter(i => i.impact === 'negative').length;

    // 全部正面 = 優異
    if (positiveCount === 3) {
        return 'excellent';
    }

    // 大部分正面 = 良好
    if (positiveCount >= 2 && negativeCount === 0) {
        return 'good';
    }

    // 多數負面 = 差
    if (negativeCount >= 2) {
        return 'poor';
    }

    // 混合
    if (negativeCount === 1) {
        return 'mixed';
    }

    return 'mixed';
}

/**
 * 解決衝突 - 優先順序: 安全 > 品質 > 大小
 */
function resolveConflicts(waveFeatures, windFeatures, interactions, safetyLevel) {
    // 優先1: 安全疑慮覆蓋一切
    if (safetyLevel === 'danger') {
        return {
            dominantFactor: 'safety',
            resolution: '安全疑慮為首要考量，其他條件次之',
            priorityApplied: true
        };
    }

    if (safetyLevel === 'warning') {
        return {
            dominantFactor: 'safety',
            resolution: '需注意安全，建議謹慎評估',
            priorityApplied: true
        };
    }

    // 優先2: 品質 (風面紋理和週期) > 大小
    const hasQualityConflict =
        interactions.wavePowerVsTexture.type === 'conflict' ||
        interactions.periodVsHeight.type === 'conflict';

    if (hasQualityConflict) {
        // 紋理問題
        if (windFeatures.texture === 'blown-out' || windFeatures.texture === 'choppy') {
            return {
                dominantFactor: 'quality',
                resolution: '浪面品質影響整體體驗，比浪高更重要',
                priorityApplied: true
            };
        }

        // 週期問題
        if (waveFeatures.period === 'wind-swell' &&
            (waveFeatures.size === 'chest' || waveFeatures.size === 'shoulder')) {
            return {
                dominantFactor: 'quality',
                resolution: '週期短導致浪缺乏推力，儘管浪高看似足夠',
                priorityApplied: true
            };
        }
    }

    // 優先3: 大小考量
    if (waveFeatures.power === 'dangerous' || waveFeatures.size === 'double-overhead') {
        return {
            dominantFactor: 'size',
            resolution: '浪況強勁，適合進階玩家',
            priorityApplied: true
        };
    }

    // 無顯著衝突
    return {
        dominantFactor: 'none',
        resolution: '各項條件相對平衡',
        priorityApplied: false
    };
}

/**
 * 偵測特殊"化學反應"模式
 */
function detectChemistry(waveFeatures, windFeatures) {
    const { power, size, period } = waveFeatures;
    const { texture } = windFeatures;

    // 模式1: 完美條件
    if (
        (power === 'solid' || power === 'heavy') &&
        (texture === 'clean' || texture === 'glassy') &&
        (period === 'ground-swell' || period === 'long-period') &&
        (size === 'chest' || size === 'shoulder' || size === 'head')
    ) {
        return {
            hasChemistry: true,
            pattern: 'perfect-conditions',
            description: '理想的浪高、長週期與乾淨的浪面，完美組合'
        };
    }

    // 模式2: 浪費潛力
    if (
        (power === 'solid' || power === 'heavy') &&
        texture === 'blown-out'
    ) {
        return {
            hasChemistry: true,
            pattern: 'wasted-potential',
            description: '浪況本身不錯，但被風吹亂而浪費了潛力'
        };
    }

    // 模式3: 長板天堂
    if (
        power === 'weak' &&
        (texture === 'glassy' || texture === 'clean') &&
        (period === 'ground-swell' || period === 'long-period') &&
        (size === 'ankle' || size === 'knee')
    ) {
        return {
            hasChemistry: true,
            pattern: 'longboard-paradise',
            description: '小浪配上鏡面般的浪面與長週期，長板玩家的天堂'
        };
    }

    // 模式4: 隱藏好浪
    if (
        (size === 'thigh' || size === 'waist') &&
        (period === 'ground-swell' || period === 'long-period') &&
        texture !== 'blown-out' &&
        texture !== 'choppy'
    ) {
        return {
            hasChemistry: true,
            pattern: 'hidden-gem',
            description: '浪雖小但週期長，隱藏的好浪況'
        };
    }

    // 無特殊化學反應
    return {
        hasChemistry: false,
        pattern: 'none',
        description: ''
    };
}

/**
 * 生成綜合評估 (主函數)
 */
function generateOverallAssessment(waveFeatures, windFeatures, safetyLevel, safetyConcerns) {
    // 分析互動
    const wavePowerVsTexture = analyzeWavePowerVsTexture(
        waveFeatures.power,
        waveFeatures.size,
        windFeatures.texture
    );

    const periodVsHeight = analyzePeriodVsHeight(
        waveFeatures.period,
        waveFeatures.size
    );

    const windVsSafety = analyzeWindVsSafety(
        windFeatures.strength,
        windFeatures.impact || 'neutral'
    );

    const interactions = {
        wavePowerVsTexture,
        periodVsHeight,
        windVsSafety
    };

    // 判斷整體協同
    const overallSynergy = determineOverallSynergy(
        wavePowerVsTexture,
        periodVsHeight,
        windVsSafety,
        safetyLevel
    );

    // 解決衝突
    const conflictResolution = resolveConflicts(
        waveFeatures,
        windFeatures,
        interactions,
        safetyLevel
    );

    // 檢測化學反應
    const chemistry = detectChemistry(waveFeatures, windFeatures);

    // 生成評估文字
    let assessment = '';

    // 優先1: 安全疑慮
    if (safetyLevel === 'danger') {
        assessment = `危險海況，存在嚴重安全疑慮（${safetyConcerns.join('、')}），強烈建議不要下水。`;
    } else if (safetyLevel === 'warning') {
        assessment = `需注意安全（${safetyConcerns.join('、')}），${conflictResolution.resolution}。建議謹慎評估自身能力。`;
    }
    // 優先2: 特殊化學反應
    else if (chemistry.hasChemistry) {
        assessment = chemistry.description;
    }
    // 優先3: 整體協同評估
    else {
        if (overallSynergy === 'excellent') {
            assessment = '綜合來看，各項條件配合良好，浪況優異，適合衝浪。';
        } else if (overallSynergy === 'good') {
            assessment = '綜合來看，條件不錯，值得下水。';
        } else if (overallSynergy === 'mixed') {
            if (conflictResolution.priorityApplied) {
                assessment = `綜合來看，${conflictResolution.resolution}。`;
            } else {
                assessment = '綜合來看，條件普通，可以衝浪但非最佳狀態。';
            }
        } else {
            if (conflictResolution.priorityApplied) {
                assessment = `綜合來看，${conflictResolution.resolution}。不建議下水。`;
            } else {
                assessment = '綜合來看，條件不佳，建議等待改善。';
            }
        }
    }

    return assessment;
}

module.exports = {
    generateOverallAssessment,
    analyzeWavePowerVsTexture,
    analyzePeriodVsHeight,
    analyzeWindVsSafety,
    determineOverallSynergy,
    resolveConflicts,
    detectChemistry
};
