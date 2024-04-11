// import '@/assets/wasm_exec.js'
// // @ts-ignore
// import myWasmModule from '@/assets/main.wasm?url';

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

console.log('hello world from background')

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}

export {}
