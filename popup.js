import {getActiveTabUrl} from "./utils.js";
const body = document.querySelector('.body');

const addNewBookmark = (bookmark) => {
    return `
    <li class="list-item">
        <span class="list-item__info timecode">${bookmark.formatTime}</span>
        <div class="list-item__info time-description">${bookmark.desc}</div>
        <div class="list-item__info buttons">
            <img src="./assets/Copy.png" alt="Копировать таймкод и его описание" class="buttons__item copy">
            <img id="deleteBtn" src="./assets/Delete (2).png" alt="Удалить таймкод" class="buttons__item delete">
            <img src="./assets/ok.png" alt="Перейти по таймкоду" class="buttons__item set">
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

const onPlay = e => {};

const onDelete = e => {
    e.target.closest('.list-item').remove();
};

const setTitleExtension = (nameVideo) => {
    document.querySelector("body > div > h1").textContent = 
    `Таймкоды для видео: '${(nameVideo.length > 18) ? nameVideo.slice(0,18) + '...' : nameVideo}'`;
};

const setBookmarkAttributes =  () => {};

document.addEventListener("DOMContentLoaded", async (e) => {
    const activeTab = await getActiveTabUrl();
    const queryParametrs = activeTab.url.split("?")[1];
    const urlParametrs = new URLSearchParams(queryParametrs);
    const currentVideo = urlParametrs.get('v');


    if (activeTab.url.includes('youtube.com/watch') && currentVideo) {
        setTitleExtension(activeTab.title);
        chrome.storage.sync.get([currentVideo], data => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            console.log(currentVideoBookmarks);
            viewBookmarks(currentVideoBookmarks);
        })
        
    } else {
        const body = document.querySelector('.body');
        body.innerHTML = "<h1 class='title-extension'> This is not Youtube page. </h1>";
    }

});

body.addEventListener('click', e => {
    if (e.target.id === 'deleteBtn') {
        onDelete(e);
    }
})
