import {getActiveTabUrl} from "./utils.js";

const createTimecodeBtn = document.querySelector('.bookmark-btn');

const addNewBookmark = (bookmarksElement, bookmark) => {
    console.log(bookmarksElement);
    console.log(bookmark);
};


const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.querySelector('.list');
    bookmarksElement.innerHTML = '';

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    } else {
        bookmarksElement.innerHTML = '<li class="list-item"> No bookmarks to show</li>'
    }
};

const onPlay = e => {};

const onDelete = e => {};

const setTitleExtension = (nameVideo) => {
    document.querySelector("body > div > h1").textContent = 
    `Таймкоды для видео: '${(nameVideo.length > 18) ? nameVideo.slice(0,18) + '...' : nameVideo}'`;
};

const setBookmarkAttributes =  () => {};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabUrl();
    const queryParametrs = activeTab.url.split("?")[1];
    const urlParametrs = new URLSearchParams(queryParametrs);
    const currentVideo = urlParametrs.get('v');


    if (activeTab.url.includes('youtube.com/watch') && currentVideo) {
        setTitleExtension(activeTab.title);
        chrome.storage.sync.get([currentVideo], data => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            viewBookmarks(currentVideoBookmarks);
        })
    } else {
        const body = document.querySelector('.body');
        body.innerHTML = "<h1 class='title-extension'> This is not Youtube page. </h1>";
    }
});

