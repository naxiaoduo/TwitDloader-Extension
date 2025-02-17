// 假设我们有一个默认主题颜色
let currentThemeColor = '#1DA1F2';

// 从存储中加载主题颜色
chrome.storage.sync.get(['themeColor'], function(data) {
    if (data.themeColor) {
        currentThemeColor = data.themeColor;
    }
    applyThemeColor(currentThemeColor);
});

function applyThemeColor(color) {
    document.documentElement.style.setProperty('--theme-color', color);
    
    // 更新按钮颜色
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.classList.contains('settings-button')) {
            button.style.backgroundColor = color;
        }
    });

    // 更新链接颜色
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.style.color = color;
    });

    // 更新开关按钮颜色
    const slider = document.querySelector('.slider');
    if (document.getElementById('pageButtonToggle').checked) {
        slider.style.backgroundColor = color;
    }
}

// 监听来自选项页面的主题颜色更改消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "updateThemeColor") {
        currentThemeColor = request.color;
        applyThemeColor(currentThemeColor);
        sendResponse({status: "Theme color updated"});
    }
});