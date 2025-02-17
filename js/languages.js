const SUPPORTED_LANGUAGES = {
    'zh-CN': 'zh-CN', // 简体中文
    'zh-TW': 'zh-TW', // 繁体中文
    'en': 'en',       // 英文
    'ja': 'ja',       // 日语
    'ko': 'ko',       // 韩语
    'ru': 'ru',       // 俄语
    'ar': 'ar',       // 阿拉伯语
    'fa': 'fa',       // 波斯语
    'fr': 'fr',       // 法语
    'es': 'es',       // 西班牙语
    'pt': 'pt'        // 葡萄牙语
};

function getPreferredLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0];
    
    // 检查完整的语言代码（例如 zh-CN）
    if (SUPPORTED_LANGUAGES[userLang]) {
        return SUPPORTED_LANGUAGES[userLang];
    }
    
    // 检查语言基础代码（例如 zh）
    if (SUPPORTED_LANGUAGES[langCode]) {
        return SUPPORTED_LANGUAGES[langCode];
    }
    
    // 默认返回英文
    return 'en';
} 