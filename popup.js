import {getActiveTabURL} from "./utils.js";
const body = document.querySelector('.body');
const footer = document.querySelector('.footer');

const addNewBookmark = (bookmark) => {
    return `
    <li class="list-item">
        <span class="list-item__info timecode ">${bookmark.formatTime}</span>
        <div class="list-item__info time-description" data-timestamp="${bookmark.time}">${bookmark.desc}</div>
        <div class="list-item__info buttons">
            <img id="copyBtn" src="./assets/Copy.png" alt="Копировать таймкод и его описание" class="buttons__item copy">
            <img id="deleteBtn" src="./assets/delete.png" alt="Удалить таймкод" class="buttons__item delete">
            <img id="playBtn" src="./assets/ok.png" alt="Перейти по таймкоду" class="buttons__item set">
        </div>
    </li>`;
};

const addFooterButtons = () => {
    return `
    <div class="footer__buttons buttons-footer">
        <button class="buttons-footer__copy-all" id="copyallBtn">Copy Timecodes</button>
        <button class="buttons-footer__post-all" id="postallBtn">Insert in Comment</button>
    </div>`;
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
        bookmarksElement.innerHTML = '<li class="list-item_message"> No bookmarks to show</li>';
    }

    if (document.querySelectorAll('.list-item').length > 0 && !document.querySelector('.buttons-footer')) {
        footer.insertAdjacentHTML('beforeend', addFooterButtons());
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

const copyAllTimecode = () => {
    const listItem = document.querySelectorAll('.list-item');
    const listTimecodes = {};
    let listTimecodesText = '';

    listItem.forEach((item, index, array) => {
        listTimecodes[item.querySelector('.timecode').textContent] = item.querySelector('.time-description').textContent;
    });
    console.log(listTimecodes);
    
    for (let time in listTimecodes) {
        listTimecodesText += `${time} - ${listTimecodes[time]} \n`;
    }

    console.log(listTimecodesText);
    navigator.clipboard.writeText(listTimecodesText).then(function(copyText) {
        alert('Copying to clipboard was successful!');
      }, function(err) {
        console.log('Async: Could not copy text: ', err);
      });

};

const postAllTimecode = async () => {
    const listItem = document.querySelectorAll('.list-item');
    const listTimecodes = {};
    let listTimecodesText = '';

    listItem.forEach((item, index, array) => {
        listTimecodes[item.querySelector('.timecode').textContent] = item.querySelector('.time-description').textContent;
    });
    
    for (let time in listTimecodes) {
        listTimecodesText += `${time} - ${listTimecodes[time]} \n`;
    }
    const activeTab = await getActiveTabURL();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "POST",
        value: listTimecodesText
    });
    
};

const onDelete = async (e) => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.closest('.list-item__info').previousElementSibling.getAttribute('data-timestamp');

    if (document.querySelectorAll('.list-item').length === 0) {
        document.querySelector('.buttons-footer').remove();
    }

    e.target.closest('.list-item').remove();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    }, viewBookmarks);
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
        });

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
    } else if (e.target.id === 'copyallBtn') {
        copyAllTimecode();
    } else if (e.target.id === 'postallBtn') {
        postAllTimecode();
    }
});

