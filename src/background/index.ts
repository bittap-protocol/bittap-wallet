/* eslint-disable no-case-declarations */
// import '@/assets/wasm_exec.js'
// // @ts-ignore
// import myWasmModule from '@/assets/main.wasm?url';

// import { phrases, getActiveAccount, activeAccount } from '@/stores/app.store'
import {
  sendMessage,
  encryptData,
  decryptData,
  TestPassword,
  REQUEST_CURRENT_SITE,
  saveLocalStoreKey,
  getLocalStoreKey,
  channelName,
  REQUEST_TARGET,
  RESPONSE_TARGET,
} from '@/popup/libs/tools'

import { createWindow, getCurrentAssets, Settings, WindowOptions } from './utils'

let sessionPassword: string | null = null





interface configOpt {
  activeAccount: number
  networkType: 0 | 1
  networkRpcUrl: string
  networkRpcToken: string
}

interface WcClient {
  ws: WebSocket
  putMsg: unknown
  send(data: unknown): unknown
  sendJSON(data: unknown): unknown
  subAll(): unknown
}

interface RequestItem {
  type: string
  data: unknown,
  requestId: string,
}

type WcClientObject = WcClient | null

const SdkRequestQueue:Array<RequestItem> = []

const findQueue = (requestId: string) =>{
  console.log('SdkRequestQueue: ', requestId, SdkRequestQueue)
  return SdkRequestQueue.find(item => item.requestId === requestId)
}
const removeQueue = (requestId: string) => {
  const index = SdkRequestQueue.findIndex(item => item.requestId === requestId)
  if (index!== -1) {
    console.log('Queue remove: ', index, SdkRequestQueue[index])
    SdkRequestQueue.splice(index, 1)
  }
}

chrome.storage.session.get(['sessionPassword'], (result) => {
  // Restore the password saved in the message
  if (result.sessionPassword && TestPassword(result.sessionPassword)) {
    sessionPassword = result.sessionPassword
  }
})


// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const sendChannelResponseMessage = (requestId:string, data:any) => {
  const queue = findQueue(requestId)
  if(queue) {
    const sendMsg = {
      data:{
        data,
        requestId: requestId,
        type: queue.type,
      },
      target: RESPONSE_TARGET,
      channel: channelName
    }
    console.log('sendChannelResponseMessage: ', sendMsg)
    chrome.tabs.query({ active: true,  }, (tabs) => {
      console.log('tabs: ', tabs)
      // if (tabs[0]) {
        tabs.forEach(tab => {
          // @ts-ignore
          chrome.tabs.sendMessage(tab.id, sendMsg, (response) => {
            console.log('Response from content script:', response);
            
          });
        })
        removeQueue(requestId)
      // }
    });
  }else{
    removeQueue(requestId)
    return false
  }
}


const encodes: string[] = []
const configs: configOpt = {
  activeAccount: 0,
  networkType: 0,
  networkRpcUrl: '',
  networkRpcToken: '',
}


const ws = {
  client: {},
}



const clearPassword = () => {
  sessionPassword = null
  chrome.storage.session.set({ sessionPassword: '' })
}

// const getExtensionsId = () => {
//   // @ts-ignore
//   if(chrome.runtime){ // 方法一
//       return chrome.runtime?.id || '-1';
//   }else if(chrome.i18n){ // 方法二
//       return chrome.i18n.getMessage("@@extension_id") || '-1';
//   }
//   return '-1'
// }

// window.addEventListener('message', (message) => {
//   console.log('background window on message: ', message)
// })

chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  clearPassword()

  if (opt.reason === 'install') {
    await chrome.storage.local.clear()

    chrome.tabs.create({
      active: true,
      // Open the setup page and append `?type=install` to the URL so frontend
      // can know if we need to show the install page or update page.
      url: chrome.runtime.getURL('./src/setup/index.html?type=install'),
    })
  }

  if (opt.reason === 'update') {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL('./src/setup/index.html?type=update'),
    })
  }

  chrome.runtime.onStartup.addListener(() => {
    clearPassword()
  })
  // console.log('chrome.runtime.onInstalled: ', new Date().toLocaleString(),getExtensionsId())
  
  // WebAssembly.instantiateStreaming(fetch(myWasmModule), go.importObject).then(result => {
  //   go.run(result.instance);
  // });
})
const checkUnlockSate = ()=>{
  if (sessionPassword === null) {
    try {
      sendMessage('isUnlocked', { status: false })
    } catch (error) {
      console.warn('checkUnlockSate send state on error: ', error)
    }
    return false
  } else {
    return true
  }
}
chrome.runtime.onConnect.addListener(async () => {
  // console.log('chrome.runtime.onConnect: ', new Date().toLocaleString())
  checkUnlockSate()
})



const openWindowGoToUrl = (url:string, requestId:string, sender:chrome.runtime.MessageSender) => {
  let openerWin:chrome.windows.Window
  const queue = findQueue(requestId)
  if(!queue){
    return false
  }
  const winOpts: WindowOptions = {
    // @ts-ignore
    left: sender.tab?.width - 380 || 960,
  }

  const addRemovedListenerWindow = async (windowId:number)=>{
    if(windowId === openerWin.id){
      const queueTask = findQueue(requestId)
      if(queueTask) {
        await sendChannelResponseMessage(requestId, {})
      }
    }
  }
  // @ts-ignore
  const extParams = '&host='+new URL(sender.tab?.url).host
  if(!checkUnlockSate()){
    const [path, query] = url.split('?')
    console.log('path, query:')
    createWindow(Settings.BASE_URL + Settings.UNLOCK_WALLET+'?redirect='+path+'&'+query+extParams, winOpts).then(res => {
      // @ts-ignore
      openerWin = res
      chrome.windows.onRemoved.addListener(addRemovedListenerWindow)
    })
  }else{   
    createWindow(Settings.BASE_URL + url+extParams, winOpts).then(res => {
      // @ts-ignore
      openerWin = res
      chrome.windows.onRemoved.addListener(addRemovedListenerWindow)
    })
  }
}
// @ts-ignore
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Message received on background('+message.type+'): ', message, sender, sendResponse)
  if(message.data && message.data.channel && message.data.channel === channelName &&  message.data.target){
    if(message.data.target === REQUEST_TARGET){
      SdkRequestQueue.push(message.data.data)
      console.log('SdkRequestQueue on Request: ', SdkRequestQueue.length, SdkRequestQueue[SdkRequestQueue.length-1])
    }
  }
  switch (message.type) {
    case 'SubscribeReceiveEvents':
      if(!checkUnlockSate()){
        return false
      }
      ReceiveEvents(message.data)
      break
    case 'InitConfig':
      InitConfig(message.data)
      break
    case 'getQueue':
      // @ts-ignore
      return sendResponse({ type: 'getQueue', data: findQueue(message.data) })
    case 'isUnlocked':
      // @ts-ignore
      return sendResponse({
        type: 'isUnlocked',
        data: { status: sessionPassword ? true : false },
      })
    case 'getPassword':
      if(!checkUnlockSate()){
        return false
      }
      // @ts-ignore
      return sendResponse({ type: 'getPassword', data: sessionPassword })
    case 'setPassword':
      sessionPassword = message.data
      chrome.storage.session.set({ sessionPassword })
      // @ts-ignore
      return sendResponse({ type: 'setPassword' })
    case 'resetPassword':
      if(!checkUnlockSate()){
        return false
      }
      const { newPassword, phrases } = message.data
      // @ts-ignore
      const oldPassword: string = sessionPassword
      for (let i = 0; i < phrases.length; i++) {
        const { phrase } = phrases[i]
        phrases[i].phrase = encryptData(
          decryptData(phrase, oldPassword),
          newPassword
        )
      }
      // reset current password
      sessionPassword = newPassword
      // @ts-ignore
      return sendResponse({
        type: 'resetPassword',
        data: { status: true, phrases },
      })
    case 'clearPassword':
      if(!checkUnlockSate()){
        return false
      }
      // @ts-ignore
      return sendResponse({ type: 'setPassword' })
    case 'checkPassword':
      // console.log('Checking password: ', message.data.check, message.data.pwd)
      const decrypted: string = decryptData(
        message.data.check,
        message.data.pwd
      )
      // console.log('decrypted: ', decrypted)
      const result = decrypted ? 'Ok' : 'No'
      // @ts-ignore
      return sendResponse({ type: 'checkPassword', data:result })
    case 'encryptMnemonic':
      if(!checkUnlockSate()){
        return false
      }
      const encryptedMnemonic: string = encryptData(
        message.data,
        // @ts-ignore
        sessionPassword
      )
      // @ts-ignore
      return sendResponse({ type: 'encryptMnemonic', data: encryptedMnemonic })
    case 'decryptMnemonic':
      if(!checkUnlockSate()){
        return false
      }
      const decryptedMnemonic: string = decryptData(
        message.data,
        // @ts-ignore
        sessionPassword
      )
      // @ts-ignore
      return sendResponse({ type: 'decryptMnemonic', data: decryptedMnemonic })
    case 'connectionWallet':
      // @ts-ignore
      const { type, requestId } = message.data.data
      const networkType = message.data.data.data.network
      // @ts-ignore
      message.data.siteInfo.icon = message.data.siteInfo.icon || sender.tab?.favIconUrl
      console.log('connectionWallet data: ', type, requestId, networkType, message.data, message.data.siteInfo)
      await saveLocalStoreKey(REQUEST_CURRENT_SITE, message.data.siteInfo)
      const siteInfo = await getLocalStoreKey(REQUEST_CURRENT_SITE)
      console.log('createWindow siteInfo: ', siteInfo)
      openWindowGoToUrl(Settings.CONNECTION_WALLET+'?requestId='+requestId+'&networkType='+networkType, requestId, sender)
      return sendResponse();

    case 'RejectConnectionWallet':
      await sendChannelResponseMessage(message.data.requestId, {})
      return sendResponse()
    case 'ResolveConnectionWallet':
      const { account, network } = message.data
      await sendChannelResponseMessage(message.data.requestId, {
        account, network
      })
      return sendResponse()
    case 'getCurrentAssets': 
      await sendChannelResponseMessage(message.data.data.requestId, await getCurrentAssets())
      return sendResponse()
    case 'switchNetwork':
      openWindowGoToUrl(Settings.SWITCH_NETWORK+'?requestId='+message.data.data.requestId+'&networkType='+message.data.data.data.network, message.data.data.requestId,sender)
      return sendResponse()
    case 'RejectResult':
      await sendChannelResponseMessage(message.data.requestId, {})
      return sendResponse()
    case 'ResolveResult':
      const sendData = message.data
      delete sendData.requestId
      await sendChannelResponseMessage(message.data.requestId, sendData)
      return sendResponse()
    default:
      break
  }
  sendResponse()
  return true;
})

function ReceiveEvents(encoded: string) {
  if (!encodes.includes(encoded)) {
    encodes.push(encoded)
    // console.log('ReceiveEvents is updated', encodes)
    ActionSubscribeReceive()
  } else {
    ActionSubscribeReceive()
  }
}

function InitConfig(data: configOpt) {
  Object.keys(data).forEach((key) => {
    // @ts-ignore
    configs[key] = data[key]
  })
  if (sessionPassword === null) {
    sendMessage('isUnlocked', { status: false })
  }
  // console.log('Config is updated', configs)
  ActionSubscribeReceive()
}

function ActionSubscribeReceive() {
  const { networkRpcUrl } = configs
  // console.log('networkRpcUrl: ', networkRpcUrl, encodes)
  if (!networkRpcUrl || !encodes || encodes.length <= 0) {
    return
  }

  let wc: WcClientObject
  if (
    !Object.prototype.hasOwnProperty.call(ws.client, 'ActionSubscribeReceive')
  ) {
    const REST_HOST = networkRpcUrl.split('://')[1]
    console.log(
      '======ws: start ws client for network: ',
      `wss://${REST_HOST}/v1/taproot-assets/events/asset-receive?method=POST`
    )
    // @ts-ignore
    wc = {
      ws: new WebSocket(
        `wss://${REST_HOST}/v1/taproot-assets/events/asset-receive?method=POST`
      ),
      // ws: new WebSocket(`wss://${REST_HOST}/v1/taproot-assets/events/asset-receive?method=POST`,[{
      //   rejectUnauthorized: false,
      //   headers: {
      //     'Grpc-Metadata-Macaroon': networkRpcToken,
      //   },
      // }] ),
      putMsg: [],
    }
    // @ts-ignore
    wc.send = (data) => {
      console.log('wc.send wc.status: ', wc.ws.readyState, data)
      if (!wc.ws || wc.ws.readyState != 1) {
        if (!wc.putMsg.includes(data)) {
          wc.putMsg.push(data)
        }
      } else {
        wc.sendJSON(data)
      }
    }
    // @ts-ignore
    wc.sendJSON = (data: any) => {
      console.log('wc.sendJSON wc.ws.send: ', data)
      wc.ws.send(JSON.stringify(data))
    }
    wc.subAll = () => {
      while (encodes.length > 0) {
        const enc = encodes.pop()
        // wc.send({
        //   filter_addr: enc,
        //   // start_timestamp:  new Date('2024-04-20').getTime() * 1000
        //   start_timestamp:  0
        // })
      }
    }
    console.log('======ws: wc.ws', wc)
    wc.ws.onopen = () => {
      console.log('======ws: ws is connected')
      // wc.subAll()
      wc.send({
        filter_addr: '',
        // start_timestamp:  new Date('2024-04-20').getTime() * 1000
        start_timestamp: 0,
      })
    }
    wc.ws.onmessage = (msg) => {
      const json = JSON.parse(msg.data.toString())
      console.log('======ws: ws on message: ', msg, json)
      sendMessage('ws.message', json)
    }
    wc.ws.onclose = () => {
      console.log('======ws: ws on closed')
      // ws.client.ActionSubscribeReceive = null
      // delete ws.client.ActionSubscribeReceive
      // setTimeout(() => {
      //   ActionSubscribeReceive()
      // }, 1500)
    }
    wc.ws.onerror = (err) => {
      console.log('======ws: ws on error: ', err)
      // ws.client.ActionSubscribeReceive = null
      // delete ws.client.ActionSubscribeReceive
      // setTimeout(() => {
      //   ActionSubscribeReceive()
      // }, 1500)
    }
    // @ts-ignore
    ws.client.ActionSubscribeReceive = wc
  } else {
    // @ts-ignore
    wc = ws.client.ActionSubscribeReceive
  }
  if (!wc) {
    return
  }
  setTimeout(() => {
    wc.subAll()
  }, 15000)
}

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}

export {}
