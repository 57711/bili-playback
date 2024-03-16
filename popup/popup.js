const ERROR_CODE = {
    NO_VIDEO: 'no-video',
    MULTI_VIDEO: 'multi-video',
}
let VIDEO_ELEMENT_SELECTOR = null;
const extensions = 'https://www.bilibili.com/video/'
const DOM = {
    list: document.querySelector('#li_template'),
    noVideo: document.querySelector('#no-video'),
    multiVideo: document.querySelector('#multi-video'),
    selector: document.querySelector('#multi-selector'),
}
document.addEventListener('DOMContentLoaded', function () {
    DOM.list.addEventListener('click', clickHandler);
    DOM.selector.addEventListener('click', elementClickHandler);
    DOM.selector.addEventListener('mouseover', elementMouseoverHandler);
    DOM.selector.addEventListener('mouseleave', elementMouseleaveHandler);
});

let isTapable = true;
const tab = await getCurrentTab()

chrome.scripting
    .executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: getVideoEl,
    })
    .then(injectionResults => {
        for (const { frameId, result } of injectionResults) {
            if (result && result.value) {
                setVideoElement(result.value)
            } else if (result && result.error && result.error == ERROR_CODE.NO_VIDEO) {
                DOM.list.classList.add("hide")
                DOM.noVideo.classList.remove("hide")
            } else if (result && result.error && result.error == ERROR_CODE.MULTI_VIDEO) {
                DOM.multiVideo.classList.remove("hide")
                generateOptionTag(result.values)
            }
        }
    });

function generateOptionTag(tags) {
    const frag = document.createDocumentFragment();
    tags.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item.src
        li.dataset.selector = `video[src='${item.src}']`
        frag.appendChild(li)
    })
    DOM.selector.appendChild(frag)
}
function getVideoElPlayback() {
    chrome.scripting
        .executeScript({
            target: { tabId: tab.id },
            func: getPlayback,
            args: [VIDEO_ELEMENT_SELECTOR]
        })
        .then(val => {
            const currentPlaybackRate = val[0].result
            setSelected(currentPlaybackRate)
        })
}



function getPlayback(selector) {
    const videoEL = document.querySelector(selector)
    return videoEL.playbackRate
}
function setPlayback(val, selector) {
    const videoEL = document.querySelector(selector)
    videoEL.playbackRate = val
}
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
const setSelected = (function aa() {
    let currentPlaybackRate = 1
    return function (id) {
        const prev = document.getElementById(currentPlaybackRate)
        prev.classList.remove('selected')
        const selected = document.getElementById(id)
        selected.classList.add('selected')
        currentPlaybackRate = id
    }
})()
function disableAll() {
    isTapable = false;
}
function enableAll() {
    isTapable = true;
}
function clickHandler(e) {
    if (!isTapable) return
    const target = e.target.id
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: setPlayback,
        args: [target, VIDEO_ELEMENT_SELECTOR]
    })
    setSelected(target)
}

function getVideoEl() {
    const videoEl = document.querySelectorAll('video');
    if (videoEl.length == 1) {
        return { value: 'video' }
    } else if (videoEl.length == 0) {
        return { error: 'no-video' }
    } else {
        const values = [...videoEl].map(item => ({ src: item.src, outerHeight: item.outerHTML }))
        return { error: 'multi-video', values }
    }
}

function elementClickHandler(e) {
    setVideoElementSelected(e.target.dataset.selector)
    setVideoElement(e.target.dataset.selector)
}
function elementMouseoverHandler(e) {
    const selector = e.target.dataset.selector
    chrome.scripting
        .executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: highlightElement,
            args: [selector]
        })
}
function elementMouseleaveHandler() {
    chrome.scripting
        .executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: hideHightlightElement,
        })
}

function highlightElement(selector) {
    const videoEL = document.querySelector(selector)
    const { left, top, width, height } = videoEL.getBoundingClientRect()

    let dom = document.querySelector("#bili-playback");
    if (!dom) {
        dom = document.createElement('div')
        dom.id = "bili-playback"
        dom.style.position = "fixed";
        dom.style.zIndex = 9999;
        dom.style.backgroundColor = '#97b1ff75'
        document.body.appendChild(dom)
    }
    dom.style.display = "block";
    dom.style.top = top + 'px';
    dom.style.left = left + 'px';
    dom.style.width = width + 'px';
    dom.style.height = height + 'px';

}
function hideHightlightElement() {
    let dom = document.querySelector("#bili-playback");
    if (dom) {
        dom.style.display = "none";
    }
}

function setVideoElement(val) {
    VIDEO_ELEMENT_SELECTOR = val
    getVideoElPlayback()
}

function setVideoElementSelected(val){
    if(VIDEO_ELEMENT_SELECTOR){
        const prev = document.querySelector(`li[data-selector="${VIDEO_ELEMENT_SELECTOR}"]`)
        prev.classList.remove('selected')
    }
    const current = document.querySelector(`li[data-selector="${val}"]`)
    current.classList.add('selected')
}
