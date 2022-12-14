 (() => {
     let youtubeLeftControls, youtubePlayer;
     let currentVideo = '';
     let currentVideoBookmarks = [];
     const rightControlYtb = document.querySelector('.ytp-right-controls');


    // convert seconds to hh:mm:ss
    const getTime = t => {
        let date = new Date(0);
        date.setSeconds(t);

        return date.toISOString().substr(11,8);
    };

    const fetchBookmarks = async () => {
        return new Promise(resolve => {
            chrome.storage.sync.get([currentVideo], obj => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    };


    const addNewTimecodeEventHandler = async () => {
        const descriptionTimecode = prompt('Введите описание таймкода', `Описание таймкода`);
        const currentTime = document.querySelector('.video-stream').currentTime;
        const newBookmark = {
            time: currentTime,
            formatTime: getTime(currentTime),
            desc: descriptionTimecode
        };

        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a,b) => a.time - b.time))
        });
    };

    // createTimecodeBtn on  right control panel of Youtube video
    const newVideoLoaded = async () => {
        currentVideoBookmarks = await fetchBookmarks();

        if (!document.querySelector(".bookmark-btn")) {
            const createTimecodeBtn = document.createElement('img');
            createTimecodeBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            createTimecodeBtn.classList.add('ytp-button', 'bookmark-btn');
            createTimecodeBtn.style.filter = 'brightness(0) invert(1)';
            createTimecodeBtn.style.width = '46px';
            createTimecodeBtn.style.height = '46px';
            createTimecodeBtn.style.padding = '0px';

            rightControlYtb.prepend(createTimecodeBtn);
            createTimecodeBtn.addEventListener('click', addNewTimecodeEventHandler);
        }


    };

     chrome.runtime.onMessage.addListener((obj, sender, response) => {
         const {type, value, videoId} = obj;

         if (type === "NEW") {
             currentVideo = videoId;
            newVideoLoaded();
         } else if (type === "PLAY") {
            document.querySelector('.video-stream').currentTime = value;
         } else if (type === "DELETE") {
             currentVideoBookmarks = currentVideoBookmarks.filter(b => b.time != value);
             chrome.storage.sync.set({[currentVideo]: JSON.stringify(currentVideoBookmarks)});

             response(currentVideoBookmarks);
         } else if (type === "POST") {
            document.querySelector("#placeholder-area").click();
            document.querySelector("#contenteditable-root").textContent = '';
            document.querySelector("#contenteditable-root").textContent = `${value}`;
        }
     }); 

     newVideoLoaded();
 })();

