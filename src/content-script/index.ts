import { sendMessage, channelName, REQUEST_TARGET, RESPONSE_TARGET } from '@/popup/libs/tools';



// import extension from 'webextension-polyfill';
// import { nanoid } from 'nanoid';
// // import './index.scss'
// const ScriptChannelName = nanoid();

// /**
//  * Checks the doctype of the current document if it exists
//  *
//  * @returns {boolean} {@code true} if the doctype is html or if none exists
//  */
// function doctypeCheck() {
//   const { doctype } = window.document;
//   if (doctype) {
//     return doctype.name === 'html';
//   }
//   return true;
// }

// /**
//  * Returns whether or not the extension (suffix) of the current document is prohibited
//  *
//  * This checks {@code window.location.pathname} against a set of file extensions
//  * that we should not inject the provider into. This check is indifferent of
//  * query parameters in the location.
//  *
//  * @returns {boolean} whether or not the extension of the current document is prohibited
//  */
// function suffixCheck() {
//   const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
//   const currentUrl = window.location.pathname;
//   for (let i = 0; i < prohibitedTypes.length; i++) {
//     if (prohibitedTypes[i].test(currentUrl)) {
//       return false;
//     }
//   }
//   return true;
// }

// /**
//  * Checks the documentElement of the current document
//  *
//  * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
//  */
// function documentElementCheck() {
//   const documentElement = document.documentElement.nodeName;
//   if (documentElement) {
//     return documentElement.toLowerCase() === 'html';
//   }
//   return true;
// }

// function iframeCheck() {
//   const isInIframe = self != top;
//   if (isInIframe) {
//     return true;
//   } else {
//     return false;
//   }
// }

// /**
//  * Determines if the provider should be injected
//  *
//  * @returns {boolean} {@code true} Whether the provider should be injected
//  */
// function shouldInjectProvider() {
//   return doctypeCheck() && suffixCheck() && documentElementCheck() && !iframeCheck();
// }

// // const src = chrome.runtime.getURL('src/content-script/iframe/index.html')

// // const iframe = new DOMParser().parseFromString(
// //   `<iframe class="crx-iframe" src="${src}"></iframe>`,
// //   'text/html'
// // ).body.firstElementChild

// // if (iframe) {
// //   document.body?.append(iframe)
// // }

// // const nonce = nanoid(); 
// // const script = document.createElement('script');
// // script.textContent = `
// //   window.myInjectedObject = {
// //     sayHello: function() {
// //       console.log('Hello from the injected object!');
// //     },
// //     myProperty: 'This is a property from the injected object'
// //   };
// //   console.log('Injected object has been added to the window!');
// // `;
// // script.setAttribute('nonce', nonce);
// // (document.head || document.documentElement).appendChild(script);
// // script.remove();

// // const script = document.createElement('script');
// // script.src = chrome.runtime.getURL('injected.js'); 
// // (document.head || document.documentElement).appendChild(script);
// // script.onload = () => {
// //   script.remove(); 
// // };


// /**
//  * Injects a script tag into the current document
//  *
//  */
// function injectScript() {
//   try{
//     const container = document.head || document.documentElement;
//     const scriptTag = document.createElement('script');
//     scriptTag.setAttribute('async', 'false');
//     scriptTag.setAttribute('channel', ScriptChannelName);
//     scriptTag.setAttribute('nonce', ScriptChannelName);
    
//     scriptTag.src = extension.runtime.getURL('injected.js');
//     container.insertBefore(scriptTag, container.children[0]);
//     container.removeChild(scriptTag);

//     document.addEventListener('beforeunload', () => {
//       console.log('bittap wallet disconnect.')
//     });
//     console.log('document.title: ', document.title);
//   }catch(e){
//     console.error('Bittap wallet Provider injection failed: ', e);
//   }
// }



window.addEventListener('message', (event) => {
  // console.log('Content script onmessage received == Content script', JSON.stringify(event.data), window)
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
    // console.log('chrome.runtime.onConnect==Content script: ', new Date().toLocaleString());
})
// @ts-ignore
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log('Content script onMessage received == Content script', message, sender, sendResponse)
  if(message.target && message.target === RESPONSE_TARGET && message.channel && message.channel === channelName){
    // console.log('Content script onMessage is RESPONSE_TARGET : ',message )
    sendResponseMessage(message.data)
  }
  sendResponse()
  return true;
})

// if(shouldInjectProvider()){
//   injectScript();
// }

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Content script on Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}
