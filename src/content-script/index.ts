import extension from 'extensionizer';
import { nanoid } from 'nanoid';
// import './index.scss'
// const channelName = nanoid();

const channelName = 'BittapWallet'


// const src = chrome.runtime.getURL('src/content-script/iframe/index.html')

// const iframe = new DOMParser().parseFromString(
//   `<iframe class="crx-iframe" src="${src}"></iframe>`,
//   'text/html'
// ).body.firstElementChild

// if (iframe) {
//   document.body?.append(iframe)
// }

// const nonce = nanoid(); // 此处应确保 nonce 是唯一且随机生成的
// const script = document.createElement('script');
// script.textContent = `
//   window.myInjectedObject = {
//     sayHello: function() {
//       console.log('Hello from the injected object!');
//     },
//     myProperty: 'This is a property from the injected object'
//   };
//   console.log('Injected object has been added to the window!');
// `;
// script.setAttribute('nonce', nonce); // 设置 nonce 属性
// (document.head || document.documentElement).appendChild(script);
// script.remove();

// 创建一个 <script> 标签并加载外部 JS 文件
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content-script/injected.js'); // 引入外部脚本
(document.head || document.documentElement).appendChild(script);
script.onload = () => {
  console.log('成功注入脚本:', script)
  script.remove(); // 执行完毕后删除注入的 <script> 标签
};


// alert('content script')
// @ts-ignore
// document.BitTapWallet = {
//   sendRequestJsBridge:function(){
//     console.log('argrs: ', JSON.stringify([], arguments))
//   },
// }


// class BittapWalletTools {
//   constructor() {
//     this.channel = new BroadcastChannel(channelName)
//     this.channel.onmessage = this.onmessage.bind(this)
//   }
//   injectScript(){
//     const container = document.head || document.documentElement;
//     const scriptTag = document.createElement('script');
//     scriptTag.setAttribute('async', 'false');
//     scriptTag.setAttribute('channel', channelName);
//     scriptTag.src = extension.runtime.getURL('pageProvider.js');
//     container.insertBefore(scriptTag, container.children[0]);
//     container.removeChild(scriptTag);
//   }

//   onmessage(event) {
//     console.log('Content script onmessage received == Content script', event)
//     const { data } = event
//     const { type, payload } = data
//   }
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
