window.BittapWalletInjected = {
    queues:[],
    channelName: 'bittap.jssdk.event',
    REQUEST_TARGET: 'BITTAPWALLET_REQUEST',
    RESPONSE_TARGET: 'BITTAPWALLET_RESPONSE',
    init(){
        // const res = chrome.runtime.connect('ekgmcbpgglflmgcfajnglpbcbdccnnge', {name: 'bittap-wallet'})
        // console.log('res: ', res)
        // @ts-ignore
        window.addEventListener('message',(message, sender) => {
            console.log('BittapWalletInjected 1 window.addEventListener(message):', JSON.stringify(message), sender)
            if(message.data) {
                if(event.data && event.data.target && event.data.target === window.BittapWalletInjected.RESPONSE_TARGET && event.data.channel && event.data.channel === window.BittapWalletInjected.channelName){
                    const { type , data } = message.data.data
                    const requestId = message.data.data.requestId
                    console.log('BittapWalletInjected 2 window.addEventListener(message):', type, data, requestId)
                    if(type && requestId){
                        const queue = window.BittapWalletInjected.getRequestQueueInfo(requestId)
                        console.log('queue: ', queue)
                        if(!queue){
                            return false
                        }
                        if(Object.prototype.hasOwnProperty.call(queue,'callback')){
                            queue.callback && queue.callback({ type, data, requestId })
                        }
                        window.BittapWalletInjected.removeQueueItem(requestId)
                    }
                }
            }
        });
    },
    sendMessage(data){
        return window.postMessage({
            channel:window.BittapWalletInjected.channelName , 
            data, 
            target: window.BittapWalletInjected.REQUEST_TARGET, 
            siteInfo: {
                title: document.title, 
                host: window.location.hostname, 
                href: window.location.href, 
                icon: window.location.protocol+"//"+window.location.host + "/favicon.ico"
            }
        },'*')
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
    removeQueueItem(requestId){
        const queueIndex = window.BittapWalletInjected.queues.findIndex((queue) => queue.requestId === requestId)
        if(queueIndex > -1) {
            window.BittapWalletInjected.queues.splice(queueIndex, 1)
        }
    },

};

console.log('Bittap Wallet Injected');