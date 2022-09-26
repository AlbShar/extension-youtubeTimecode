import {getActiveTabURL} from "./utils.js";
const body = document.querySelector('.body');

const addNewBookmark = (bookmark) => {
    return `
    <li class="list-item">
        <span class="list-item__info timecode ">${bookmark.formatTime}</span>
        <div class="list-item__info time-description" data-timestamp="${bookmark.time}">${bookmark.desc}</div>
        <div class="list-item__info buttons">
            <img id="copyBtn" src="./assets/Copy.png" alt="Копировать таймкод и его описание" class="buttons__item copy">
            <img id="deleteBtn" src="./assets/Delete (2).png" alt="Удалить таймкод" class="buttons__item delete">
            <img id="playBtn" src="./assets/ok.png" alt="Перейти по таймкоду" class="buttons__item set">
        </div>
    </li>
    `
};


const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.querySelector('.list');
    bookmarksElement.innerHTML = '';

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            bookmarksElement.insertAdjacentHTML('beforeend', addNewBookmark(bookmark));
        }
    } else {
        bookmarksElement.innerHTML = '<li class="list-item"> No bookmarks to show</li>'
    }
};

const onPlay = async (e) => {
    const bookmarkTime = e.target.closest('.list-item__info').previousElementSibling.getAttribute('data-timestamp');
    const activeTab = await getActiveTabURL();
    console.log(bookmarkTime);
    console.log(activeTab);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    });
};

const copyTimecode = (e) => {
    let copyText = e.target.closest('.list-item').querySelector('.timecode').textContent + ' - ' + e.target.closest('.list-item__info').previousElementSibling.textContent;

    navigator.clipboard.writeText(copyText).then(function(copyText) {
        alert('Copying to clipboard was successful!');
      }, function(err) {
        console.log('Async: Could not copy text: ', err);
      });

};

const onDelete = async (e) => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.closest('.list-item__info').previousElementSibling.getAttribute('data-timestamp');

    e.target.closest('.list-item').remove();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    }, viewBookmarks)
};

const setTitleExtension = (nameVideo) => {
    document.querySelector("body > div > h1").textContent = 
    `Таймкоды для видео: '${(nameVideo.length > 18) ? nameVideo.slice(0,18) + '...' : nameVideo}'`;
};

document.addEventListener("DOMContentLoaded", async (e) => {
    const activeTab = await getActiveTabURL();
    const queryParametrs = activeTab.url.split("?")[1];
    const urlParametrs = new URLSearchParams(queryParametrs);
    const currentVideo = urlParametrs.get('v');


    if (activeTab.url.includes('youtube.com/watch') && currentVideo) {
        setTitleExtension(activeTab.title);
        let currentVideoBookmarks = '';
        chrome.storage.sync.get([currentVideo], data => {
            currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            console.log(currentVideoBookmarks);
            viewBookmarks(currentVideoBookmarks);
        })

        
        
    } else {
        const body = document.querySelector('.body');
        body.innerHTML = "<h1 class='title-extension'> This is not Youtube page. </h1>";
    }

});

body.addEventListener('click', (e) => {
    if (e.target.id === 'deleteBtn') {
        onDelete(e);
    } else if (e.target.id === 'playBtn') {
        onPlay(e);
    } else if (e.target.id === 'copyBtn') {
        copyTimecode(e);
    }
})

