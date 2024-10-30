
window.BittapWalletInjected = {
    queues:[],
    channelName: 'bittap.jssdk.event',
    REQUEST_TARGET: 'BITTAPWALLET_REQUEST',
    RESPONSE_TARGET: 'BITTAPWALLET_RESPONSE',
    notRemoveTypes: ['onListenTransaction','onAccountChange'],
    init(){
        const clientWallet = new  (function(){
            this.client_id = window.BittapWalletInjected.getRequestId();
            this.toString = function(){  return 'client id: '+ this.client_id }
        })
        window.addEventListener('message',(message, sender) => {
            console.log('BittapWalletInjected 1 window.addEventListener(message):', JSON.stringify(message), sender)
            if(message && message.data) {
                if(message.data 
                    && message.data.target 
                    && message.data.target === window.BittapWalletInjected.RESPONSE_TARGET 
                    && message.data.channel 
                    && message.data.channel === window.BittapWalletInjected.channelName
                    && message.data.data.client_id === clientWallet.client_id
                ){
                    const { type , data, client_id } = message.data.data
                    const requestId = message.data.data.requestId
                    console.log('BittapWalletInjected 2 window.addEventListener(message):', type, data, requestId, client_id)
                    if(type && requestId){
                        const queue = window.BittapWalletInjected.getRequestQueueInfo(requestId)
                        console.log('queue: ', queue, type , data)
                        if(!queue){
                            return false
                        }
                        if(!data){
                            if(Object.prototype.hasOwnProperty.call(queue,'reject') && queue.reject && typeof queue.reject === 'function'){
                                queue.reject && queue.reject({ type, data, requestId, err:new Error('result data is empty.') })
                            }
                            return 
                        }
                        if(Object.prototype.hasOwnProperty.call(data,'rejectResult') && data.rejectResult){
                            if(Object.prototype.hasOwnProperty.call(queue,'reject') && queue.reject && typeof queue.reject === 'function'){
                                const msg = Object.prototype.hasOwnProperty.call(data,'rejectMessage') && data.rejectMessage ? data.rejectMessage : 'The queue task was rejected.'
                                queue.reject && queue.reject({ type, data, requestId, err: new Error(msg) })
                            }
                            return
                        }else{
                            if(Object.prototype.hasOwnProperty.call(queue,'callback') && queue.callback && typeof queue.callback === 'function'){
                                queue.callback && queue.callback({ type, data, requestId })
                            }
                        }
                        if(!window.BittapWalletInjected.notRemoveTypes.includes(type)){
                            window.BittapWalletInjected.removeQueueItem(requestId)
                        }
                    }
                }
            }
        });
        return clientWallet
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
        if(!Object.prototype.hasOwnProperty.call(queue,'client_id')) {
            throw new Error('client_id is empty')
        }
        queue.time = Date.now()
        queue.requestId = !window.BittapWalletInjected.notRemoveTypes.includes(queue.type) ? window.BittapWalletInjected.getRequestId() :queue.type
        let queueInfo = window.BittapWalletInjected.getRequestQueueInfo(queue.requestId)
        if(queueInfo){
            queueInfo.data = queue.data
            queueInfo.callback = queue.callback && typeof queue.callback === 'function' ? queue.callback : queueInfo.callback
        }else{
            queue.reject = Object.prototype.hasOwnProperty.call(queue,'reject') && queue.reject && typeof queue.reject === 'function'? queue.reject : undefined
            window.BittapWalletInjected.queues.push(queue)
        }
        window.BittapWalletInjected.sendMessage({
            type: queue.type,
            data: queue.data,
            client_id: queue.client_id,
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