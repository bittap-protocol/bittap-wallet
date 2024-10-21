// @ts-ignore
window.BittapWalletInjected = {
    queue:[],
    channelName: 'bittap.jssdk.event',
    init(){
        chrome.extension.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Content-script chrome.extension.onMessage:', message)
            const jsonData = message && JSON.parse(message)
            if(jsonData) {
                // @ts-ignore
                const { type, data, requestId, event } = jsonData
                console.log('Content-script chrome.extension.onMessage json :', type, data, requestId)
                if(type && requestId){
                    const queue = BittapWalletInjected.getRequestQueueInfo(requestId)
                    queue.callback && queue.callback({ type,event, data, requestId })
                    BittapWalletInjected.removeQueueItem(requestId)
                }
            }
        })
        // @ts-ignore
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Content-script chrome.runtime.onMessage:', message)
            const jsonData = message && JSON.parse(message)
            if(jsonData) {
                // @ts-ignore
                const { type , data, requestId, event } = jsonData
                console.log('Content-script chrome.runtime.onMessage json :', type, data, requestId)
                if(type && requestId){
                    const queue = BittapWalletInjected.getRequestQueueInfo(requestId)
                    queue.callback && queue.callback({ type ,event, data, requestId })
                    BittapWalletInjected.removeQueueItem(requestId)
                }
            }
            // @ts-ignore
            sendResponse({ result: true })
        });
    },
    getExtensionsId(){
        if(!!chrome.runtime){ // 方法一
            return chrome.runtime?.id || '-1';
        }else if(chrome.i18n){ // 方法二
            return chrome.i18n.getMessage("@@extension_id") || '-1';
        }
        return '-1'
    },
    sendMessage(type, data){
        
        console.log('chrome.runtime.getManifest: ', chrome.runtime.getManifest)
        return chrome.runtime.sendMessage(BittapWalletInjected.getExtensionsId(), { type:type,  data: data })
    },
    sendRequestJsBridge (queue)  {
        if(!queue) {
            throw new Error('queue is empty')
        }
        if(!Object.prototype.hasOwnProperty.call(queue,'requestId')) {
            throw new Error('requestId is empty')
        }
        if(!Object.prototype.hasOwnProperty.call(queue,'type')) {
            throw new Error('type is empty')
        }
        queue.time = Date.now()
        queue.requestId = queue.time + Math.random().toString(36).substr(2, 9)
        queues.value.push(queue)
        BittapWalletInjected.sendMessage(BittapWalletInjected.channelName, queue)
    },
    getRequestQueueInfo(requestId) {
        const queue = queues.value.find((queue) => queue.requestId === requestId)
        return queue
    },
    removeQueueItem(){
        const queue = queues.value.find((queue) => queue.requestId === requestId)
        queues.value.splice(queue, 1)
    },

};




console.log('Injected object has been added to the window!');