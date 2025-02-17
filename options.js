document.addEventListener('DOMContentLoaded', function() {
    // 初始化多语言支持
    initializeI18n();
    
    const apiUrlInput = document.getElementById('apiUrl');
    const languageSelect = document.getElementById('language');
    const themeColorSelect = document.getElementById('themeColor');
    const saveButton = document.getElementById('saveButton');

    // 加载保存的设置
    chrome.storage.sync.get(['apiUrl', 'themeColor', 'language'], function(data) {
        // 设置默认语言
        const defaultLang = getPreferredLanguage();
        languageSelect.value = data.language || defaultLang;
        
        // 如果没有保存的 API URL，则根据语言生成默认 URL
        const defaultApiUrl = `https://twitdloader.toolooz.com/${languageSelect.value}?tweet=`;
        apiUrlInput.value = data.apiUrl || defaultApiUrl;
        
        themeColorSelect.value = data.themeColor || '#1DA1F2';
        applyThemeColor(themeColorSelect.value);
    });

    // 语言选择变化时更新 API URL
    languageSelect.addEventListener('change', function() {
        const newLang = this.value;
        const newApiUrl = `https://twitdloader.toolooz.com/${newLang}?tweet=`;
        apiUrlInput.value = newApiUrl;
    });

    // 保存设置
    saveButton.addEventListener('click', function() {
        const apiUrl = apiUrlInput.value;
        const language = languageSelect.value;
        const themeColor = themeColorSelect.value;

        chrome.storage.sync.set({
            apiUrl: apiUrl,
            language: language,
            themeColor: themeColor
        }, async function() {
            // 立即重新初始化界面语言
            await initializeI18n();
            // 使用新的语言显示保存成功消息
            const savedMessage = await getMessage('settingsSaved');
            alert(savedMessage);
            applyThemeColor(themeColor);
        });
    });

    // 主题颜色变化时预览
    themeColorSelect.addEventListener('change', function() {
        applyThemeColor(this.value);
    });

    function applyThemeColor(color) {
        document.querySelectorAll('h2').forEach(h2 => h2.style.color = color);
        saveButton.style.backgroundColor = color;
    }
});