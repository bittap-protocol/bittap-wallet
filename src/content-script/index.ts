import extension from 'extensionizer';
import { nanoid } from 'nanoid';
import './index.scss'

// const src = chrome.runtime.getURL('src/content-script/iframe/index.html')

// const iframe = new DOMParser().parseFromString(
//   `<iframe class="crx-iframe" src="${src}"></iframe>`,
//   'text/html'
// ).body.firstElementChild

// if (iframe) {
//   document.body?.append(iframe)
// }

chrome.runtime.onConnect.addListener(async () => {
    console.log('chrome.runtime.onConnect==Content script: ', new Date().toLocaleString());
})
// @ts-ignore
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script onMessage received == Content script', message, sender, sendResponse)
})

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Content script on Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}
