// chrome.runtime.onInstalled.addListener(() => {
//     chrome.action.setBadgeText({
//         text: "OFF",
//     });
// });
// chrome.action.onClicked.addListener(async (tab) => {
//     console.log(tab)
//     chrome.action.setBadgeText({
//         tabId: tab.id,
//         text: "ON",
//     });
//     if (tab.url.startsWith(extensions)) {
//         chrome.scripting
//             .executeScript({
//                 target: { tabId: tab.id },
//                 func: getPlayback,
//             })
//             .then(val => {
//                 console.log(val)
//             })
//     }
// })
