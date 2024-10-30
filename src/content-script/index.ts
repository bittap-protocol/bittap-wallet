import { sendMessage, channelName, REQUEST_TARGET, RESPONSE_TARGET } from '@/popup/libs/tools';



// import extension from 'extensionizer';
// import { nanoid } from 'nanoid';
// import './index.scss'
// const channelName = nanoid();



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
script.src = chrome.runtime.getURL('injected.js'); // 引入外部脚本
(document.head || document.documentElement).appendChild(script);
script.onload = () => {
  console.log('成功注入脚本:', script)
  script.remove(); // 执行完毕后删除注入的 <script> 标签
};



window.addEventListener('message', (event) => {
  console.log('Content script onmessage received == Content script', JSON.stringify(event.data), window)
  if(event.data && event.data.target && event.data.channel && event.data.channel === channelName){
    if(event.data.target === REQUEST_TARGET){
      sendMessage(event.data.data.type, event.data)
    }
  }
})


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendResponseMessage = (data:any) => {
  return window.postMessage({channel:channelName , data, target: RESPONSE_TARGET},'*')
}

chrome.runtime.onConnect.addListener(async () => {
    console.log('chrome.runtime.onConnect==Content script: ', new Date().toLocaleString());
})
// @ts-ignore
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script onMessage received == Content script', message, sender, sendResponse)
  if(message.target && message.target === RESPONSE_TARGET && message.channel && message.channel === channelName){
    console.log('Content script onMessage is RESPONSE_TARGET : ',message )
    sendResponseMessage(message.data)
  }
  sendResponse()
  return true;
})


self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Content script on Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}
