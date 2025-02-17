let parseButton;
let currentThemeColor = '#1DA1F2'; // 默认颜色

async function getTranslation(key) {
    try {
        return new Promise((resolve) => {
            if (!chrome.runtime?.id) {
                // 扩展上下文无效时返回默认值
                console.warn('Extension context invalid, using default text');
                return resolve('Parse Tweet');
            }

            chrome.runtime.sendMessage({
                action: "getTranslation",
                key: key
            }, response => {
                if (chrome.runtime.lastError) {
                    console.warn('Runtime error:', chrome.runtime.lastError);
                    return resolve('Parse Tweet');
                }
                if (response && response.translation) {
                    resolve(response.translation);
                } else {
                    console.warn('Translation not found for key:', key);
                    resolve('Parse Tweet');
                }
            });
        });
    } catch (error) {
        console.warn('Error getting translation:', error);
        return 'Parse Tweet';
    }
}

async function createParseButton() {
    try {
        if (!(parseButton instanceof Node)) {
            parseButton = document.createElement('button');
            
            // 获取翻译文本
            const buttonText = await getTranslation("pageParseButton");
            parseButton.textContent = buttonText;
            
            parseButton.style.cssText = `
                background-color: ${currentThemeColor};
                color: white;
                border: none;
                border-radius: 20px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                margin-bottom: 10px;
                margin-right: 10px;
            `;
            parseButton.addEventListener('click', function() {
                if (!chrome.runtime?.id) {
                    console.warn('Extension context invalid');
                    return;
                }
                chrome.runtime.sendMessage({action: "parseTwitter", url: window.location.href});
            });
        }
    } catch (error) {
        console.warn('Error creating parse button:', error);
    }
}

function insertParseButton() {
    try {
        const tweetContainer = document.querySelector('article[data-testid="tweet"]');
        if (tweetContainer) {
            const actionsContainer = tweetContainer.querySelector('div[role="group"]');
            if (actionsContainer && parseButton instanceof Node && !actionsContainer.contains(parseButton)) {
                actionsContainer.insertBefore(parseButton, actionsContainer.firstChild);
            }
        }
    } catch (error) {
        console.warn('Error inserting parse button:', error);
    }
}

function toggleParseButton(show) {
    try {
        if (!chrome.runtime?.id) {
            console.warn('Extension context invalid');
            return;
        }

        if (show && isTweetPage()) {
            if (!parseButton) {
                createParseButton();
            }
            insertParseButton();
        } else if (parseButton && parseButton.parentNode) {
            parseButton.parentNode.removeChild(parseButton);
        }
    } catch (error) {
        console.warn('Error toggling parse button:', error);
    }
}

function isTweetPage() {
    return window.location.pathname.includes('/status/');
}

function updateButtonColor(color) {
    currentThemeColor = color;
    if (parseButton) {
        parseButton.style.backgroundColor = color;
    }
}

// 添加错误处理的消息监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    try {
        if (!chrome.runtime?.id) {
            console.warn('Extension context invalid');
            return;
        }

        if (request.action === "togglePageButton") {
            toggleParseButton(request.show);
        } else if (request.action === "updateThemeColor") {
            updateButtonColor(request.color);
        }
    } catch (error) {
        console.warn('Error handling message:', error);
    }
});

// 始化时检查设置
chrome.storage.sync.get(['showPageButton', 'themeColor'], function(data) {
    const showPageButton = data.showPageButton !== false;
    currentThemeColor = data.themeColor || '#1DA1F2';
    toggleParseButton(showPageButton);
});

// 监听URL变化和DOM变化
let lastUrl = location.href; 
const observer = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        chrome.storage.sync.get('showPageButton', function(data) {
            const showPageButton = data.showPageButton !== false;
            toggleParseButton(showPageButton);
        });
    } else if (isTweetPage()) {
        insertParseButton();
    }
});

observer.observe(document, {subtree: true, childList: true});

// 定期检查并插入按钮
setInterval(() => {
    if (isTweetPage()) {
        insertParseButton();
    }
}, 1000);

// 监听语言变化
chrome.storage.onChanged.addListener(async function(changes, namespace) {
    if (namespace === 'sync' && changes.language) {
        // 当语言设置改变时，更新按钮文本
        if (parseButton instanceof Node) {
            const buttonText = await getTranslation("pageParseButton");
            parseButton.textContent = buttonText;
        }
    }
});