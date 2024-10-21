window.BittapWalletInjected = {
    queues:[],
    channelName: 'bittap.jssdk.event',
    REQUEST_TAGET: 'BITTAPWALLET',
    RESPONSE_TAGET: 'BITTAPWALLET_RESPONSE',
    init(){
        // const res = chrome.runtime.connect('ekgmcbpgglflmgcfajnglpbcbdccnnge', {name: 'bittap-wallet'})
        // console.log('res: ', res)
        // @ts-ignore
        window.addEventListener('message',(message, sender) => {
            console.log('BittapWalletInjected 1 window.addEventListener(message):', JSON.stringify(message), sender)
            if(message.data) {
                if(event.data && event.data.target && event.data.target === window.BittapWalletInjected.RESPONSE_TAGET && event.data.channel && event.data.channel === window.BittapWalletInjected.channelName){
                    const { type , data, requestId, event } = message.data.data
                    console.log('BittapWalletInjected 2 window.addEventListener(message):', type, data, requestId, event, message.data.data)
                    if(type && requestId){
                        const queue = window.BittapWalletInjected.getRequestQueueInfo(requestId)
                        queue.callback && queue.callback({ type ,event, data, requestId })
                        window.BittapWalletInjected.removeQueueItem(requestId)
                    }
                }
            }
        });
    },
    sendMessage(data){
        return window.postMessage({channel:window.BittapWalletInjected.channelName , data, target: window.BittapWalletInjected.REQUEST_TAGET, siteInfo: {title: document.title, host: window.location.hostname, href: window.location.href}},'*')
    },
    sendRequestJsBridge (queue)  {
        if(!queue) {
            throw new Error('queue is empty')
        }
        if(!Object.prototype.hasOwnProperty.call(queue,'type')) {
            throw new Error('type is empty')
        }
        queue.time = Date.now()
        queue.requestId = window.BittapWalletInjected.getRequestId()
        window.BittapWalletInjected.queues.push(queue)
        window.BittapWalletInjected.sendMessage({
            type: queue.type,
            data: queue.data,
            requestId: queue.requestId,
        })
    },
    getRequestId(){
        return Date.now() + Math.random().toString(36).substr(2, 9)
    },
    getRequestQueue() {
        return queues
    },
    getRequestQueueInfo(requestId) {
        const queue = window.BittapWalletInjected.queues.find((queue) => queue.requestId === requestId)
        return queue
    },
    removeQueueItem(){
        const queueINdex = window.BittapWalletInjected.queues.findIndex((queue) => queue.requestId === requestId)
        window.BittapWalletInjected.queues.splice(queueINdex, 1)
    },

};

console.log('Bittap Wallet Injected');