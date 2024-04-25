// import '@/assets/wasm_exec.js'
// // @ts-ignore
// import myWasmModule from '@/assets/main.wasm?url';

import { Account } from '@/stores/app.store'
interface configOpt { 
  activeAccount: number,
  currentInfo: Account,
  networkType: 0 | 1,
  networkRpcUrl: string,
  networkRpcToken: string
}

const encodes: string[] = []
const configs: configOpt = {}
const ws = {
  client: []
}

chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
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
  
  // // @ts-ignore
  // const go = new Go(); // 假设你已经有了 Go 的实例化对象


  // WebAssembly.instantiateStreaming(fetch(myWasmModule), go.importObject).then(result => {
  //   go.run(result.instance);
  // });

})
chrome.runtime.onConnect.addListener(async () => { 
  console.log('chrome.runtime.onConnect: ',  new Date().toLocaleString());
})
chrome.runtime.onMessage.addListener((message,sender,sendResponse) => { 
  console.log('Message received', message, sender, sendResponse)
  switch (message.type) { 
    case 'SubscribeReceiveEvents':
      ReceiveEvents(message.data)
      break
    case 'InitConfig':
      InitConfig(message.data)
      break
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
  Object.keys(data).forEach(key => {
    configs[key] = data[key]
  })
  console.log('Config is updated', configs)
  ActionSubscribeReceive()
}

function ActionSubscribeReceive() { 
  const { networkRpcToken, networkRpcUrl, networkType } = configs
  if (!networkRpcUrl || !networkRpcUrl || !encodes || encodes.length <= 0) { 
    return 
  }
  
  var wc = null
  if (!ws.client.some(x => x.id === 'ActionSubscribeReceive')) {
    
    const REST_HOST = networkRpcUrl.split('://')[1]
    console.log('======ws: start ws client for network: ', `wss://${REST_HOST}/v1/taproot-assets/events/asset-receive?method=POST`)
    // @ts-ignore
    wc = {
      id: 'ActionSubscribeReceive',
      status: 'ing',
      ws: new WebSocket(`wss://${REST_HOST}/v1/taproot-assets/events/asset-receive?method=POST`, {
        rejectUnauthorized: false,
        headers: {
          'Grpc-Metadata-Macaroon': networkRpcToken,
        },
      }),
      putMsg: [],
    }
    wc.send = (data) => { 
      if (wc.status != 'ok') {
        wc.msg.push(data)
      } else { 
        wc.ws.sendJSON(data)
      }
    }
    wc.sendJSON = (data:any) => { 
       wc.ws.send(JSON.stringify(data))
    }
    wc.subAll = () => { 
      encodes.forEach((encoded, index) => { 
        console.log('======ws: send JSON data[%d]: ', encoded, index)
        wc.sendJSON({
          filter_addr: encoded,
          start_timestamp:  new Date().getTime() * 1000
        })
      })
    }
    wc.ws.onopen(() => { 
      console.log('======ws: ws is connected')
      wc.status = 'ok'
      wc.subAll()
    })
    wc.ws.onmessage((msg) => { 
      console.log('======ws: ws on message: ', msg)
    })
    wc.ws.onclose(() => { 
      console.log('======ws: ws on closed')
    })
    wc.ws.onerror((err) => { 
      console.log('======ws: ws on error: ', err)
    })
    ws.client.push(wc)
  } else { 
    wc = ws.client.find(x => x.id === 'ActionSubscribeReceive')
  }
  if (!wc) { 
    return 
  }
  wc.subAll()
}

console.log('hello world from background')

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}

export {}
