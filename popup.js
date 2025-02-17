document.addEventListener('DOMContentLoaded', async function() {
    // 初始化多语言支持
    await initializeI18n();
    
    const parseButton = document.getElementById('parseButton');
    const pageButtonToggle = document.getElementById('pageButtonToggle');
    const settingsButton = document.getElementById('settingsButton');
    
    // 加载保存的设置
    chrome.storage.sync.get(['showPageButton', 'themeColor'], function(data) {
        pageButtonToggle.checked = data.showPageButton !== false;
        
        // 应用主题颜色
        const themeColor = data.themeColor || '#1DA1F2';
        applyThemeColor(themeColor);
    });

    parseButton.addEventListener('click', async function() {
        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
            const currentUrl = tabs[0].url;
            if (currentUrl.includes('twitter.com') || currentUrl.includes('x.com')) {
                chrome.runtime.sendMessage({action: "parseTwitter", url: currentUrl});
            } else {
                const errorMessage = await getMessage('useOnTwitter');
                alert(errorMessage);
            }
        });
    });

    pageButtonToggle.addEventListener('change', function() {
        const showPageButton = pageButtonToggle.checked;
        chrome.storage.sync.set({showPageButton: showPageButton});
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "togglePageButton", show: showPageButton}, function(response) {
                if (chrome.runtime.lastError) {
                    console.log("Could not establish connection: ", chrome.runtime.lastError.message);
                }
            });
        });
        updateToggleColor(showPageButton);
    });

    settingsButton.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    function applyThemeColor(color) {
        document.querySelectorAll('button, .switch input:checked + .slider, a').forEach(el => {
            if (el.tagName === 'BUTTON' && !el.classList.contains('settings-button')) {
                el.style.backgroundColor = color;
            } else if (el.classList.contains('slider')) {
                el.style.backgroundColor = pageButtonToggle.checked ? color : '#ccc'; // 设置关闭时的颜色
            } else if (el.tagName === 'A') {
                el.style.color = color;
            }
        });
        settingsButton.style.color = color;
    }

    function updateToggleColor(isChecked) {
        const slider = document.querySelector('.slider');
        slider.style.backgroundColor = isChecked ? currentThemeColor : '#ccc'; // 区分开关颜色
    }
});