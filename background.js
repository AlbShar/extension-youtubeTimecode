chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes('https://www.youtube.com/watch')) {
        const queryParametr = tab.url.split('?')[1];
        const urlParametr = new URLSearchParams(queryParametr);
        console.log(urlParametr);

        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParametr.get('v'),
        });


    }
});