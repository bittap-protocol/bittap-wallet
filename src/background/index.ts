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
} from '@/popup/libs/tools'

let sessionPassword: string | null = null

chrome.storage.session.get(['sessionPassword'], (result) => {
  // Restore the password saved in the message
  if (result.sessionPassword && TestPassword(result.sessionPassword)) {
    sessionPassword = result.sessionPassword
  }
})

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

type WcClientObject = WcClient | null

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
  console.log('cleared password.')
}

chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  clearPassword()
  console.log('chrome runtime: ', opt.reason)
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

  // WebAssembly.instantiateStreaming(fetch(myWasmModule), go.importObject).then(result => {
  //   go.run(result.instance);
  // });
})
chrome.runtime.onConnect.addListener(async () => {
  console.log('chrome.runtime.onConnect: ', new Date().toLocaleString())
  if (sessionPassword === null) {
    sendMessage('isUnlocked', { status: false })
  }
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received', message, sender, sendResponse)
  switch (message.type) {
    case 'SubscribeReceiveEvents':
      ReceiveEvents(message.data)
      break
    case 'InitConfig':
      InitConfig(message.data)
      break
    case 'isUnlocked':
      // @ts-ignore
      return sendResponse({
        type: 'isUnlocked',
        data: { status: sessionPassword ? true : false },
      })
    case 'getPassword':
      // @ts-ignore
      return sendResponse({ type: 'getPassword', data: sessionPassword })
    case 'setPassword':
      sessionPassword = message.data
      chrome.storage.session.set({ sessionPassword })
      // @ts-ignore
      return sendResponse({ type: 'setPassword' })
    case 'resetPassword':
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
      clearPassword()
      // @ts-ignore
      return sendResponse({ type: 'setPassword' })
    case 'checkPassword':
      // console.log('Checking password: ', message.data.check, message.data.pwd)
      const decrypted: string = decryptData(
        message.data.check,
        message.data.pwd
      )
      console.log('decrypted: ', decrypted)
      const data = decrypted ? 'Ok' : 'No'
      // @ts-ignore
      return sendResponse({ type: 'checkPassword', data })
    case 'encryptMnemonic':
      const encryptedMnemonic: string = encryptData(
        message.data,
        // @ts-ignore
        sessionPassword
      )
      // @ts-ignore
      return sendResponse({ type: 'encryptMnemonic', data: encryptedMnemonic })
    case 'decryptMnemonic':
      const decryptedMnemonic: string = decryptData(
        message.data,
        // @ts-ignore
        sessionPassword
      )
      // @ts-ignore
      return sendResponse({ type: 'decryptMnemonic', data: decryptedMnemonic })
    default:
      break
  }
  sendResponse()
})

function ReceiveEvents(encoded: string) {
  if (!encodes.includes(encoded)) {
    encodes.push(encoded)
    console.log('ReceiveEvents is updated', encodes)
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
  console.log('Config is updated', configs)
  ActionSubscribeReceive()
}

function ActionSubscribeReceive() {
  const { networkRpcUrl } = configs
  // console.log('networkRpcUrl: ', networkRpcUrl, encodes)
  if (!networkRpcUrl || !encodes || encodes.length <= 0) {
    return
  }

  let wc: WcClientObject = null
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
        let enc = encodes.pop()
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

console.log('hello world from background')

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}

export {}
