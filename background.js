// 翻译数据
const translations = {
    'zh-CN': {
        pageParseButton: '解析推文'
    },
    'zh-TW': {
        pageParseButton: '解析推文'
    },
    'en': {
        pageParseButton: 'Parse Tweet'
    },
    'ja': {
        pageParseButton: 'ツイートを解析'
    },
    'ko': {
        pageParseButton: '트윗 분석'
    },
    'ru': {
        pageParseButton: 'Анализ твита'
    },
    'ar': {
        pageParseButton: 'تحليل التغريدة'
    },
    'fa': {
        pageParseButton: 'تجزیه توییت'
    },
    'fr': {
        pageParseButton: 'Analyser le tweet'
    },
    'es': {
        pageParseButton: 'Analizar tweet'
    },
    'pt': {
        pageParseButton: 'Analisar tweet'
    }
};

// 消息监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "parseTwitter") {
        chrome.storage.sync.get(['apiUrl', 'language'], function(data) {
            const userLang = data.language || 'en';
            const apiUrl = data.apiUrl || `https://tweetdown.pages.dev/${userLang}?tweet=`;
            const fullUrl = apiUrl + encodeURIComponent(request.url);
            chrome.tabs.create({ url: fullUrl });
        });
    } else if (request.action === "getTranslation") {
        chrome.storage.sync.get('language', function(data) {
            const lang = data.language || 'en';
            const translation = translations[lang]?.[request.key] || translations['en'][request.key];
            sendResponse({ translation: translation });
        });
        return true;
    }
});

// 标签页更新监听器
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('twitter.com') || tab.url.includes('x.com')) {
            chrome.storage.sync.get('showPageButton', function(data) {
                const showPageButton = data.showPageButton !== false;
                chrome.tabs.sendMessage(tabId, {action: "togglePageButton", show: showPageButton}, function(response) {
                    if (chrome.runtime.lastError) {
                        console.log("Could not establish connection: ", chrome.runtime.lastError.message);
                    }
                });
            });
        }
    }
});