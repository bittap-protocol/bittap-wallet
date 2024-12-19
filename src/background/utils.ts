import { CURRENT_USER_ASSETS, CURRENT_USER_WALLET_ID, getLocalStoreKey, RequestPageOptions } from '@/popup/libs/tools';
import { DecodeAssetsAddress, ListAssetsQuery, NewAssetAddress, QueryAddressList } from '@/popup/api/btc/blockStream';



export const Settings = {
    BASE_URL: '/src/popup/index.html#',
    UNLOCK_WALLET: '/common/unlock',
    CONNECTION_WALLET: '/common/connectionWallet',
    SIGN_MESSAGE: '/common/signMessage',
    SIGN_TRANSFER: '/common/signTransfer',
    SWITCH_NETWORK: '/common/switchNetwork',
}

export enum CreateType {
    normal='normal',
    popup='popup',
    panel='panel',
}

export interface WindowOptions {
    top?: number,
    left?: number,
    width?: number,
    height?: number,
    type?: CreateType.popup,
    focused?: boolean,
    setSelfAsOpener?: boolean,
    tabId?:number,
}


export interface AssetInfoItem {
    asset_name: string,
    asset_id: string,
    total_supply: number,
    asset_type:number,
}

export interface AssetInfo{ 
    asset: AssetInfoItem,
    total_proofs: number
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BittapWalletInjected {
    queues: Queue[];
    channelName: string;
    REQUEST_TARGET: string;
    RESPONSE_TARGET: string;
    notRemoveTypes: string[];
    init(): ClientWallet;
    sendMessage(data: any): void;
    sendRequestJsBridge(queue: Queue): void;
    getRequestId(): string;
    getRequestQueue(): Queue[];
    getRequestQueueInfo(requestId: string): Queue | undefined;
    removeQueueItem(requestId: string): void;
}

interface Queue {
    type: string;
    client_id: string;
    data?: any;
    time?: number;
    requestId?: string;
    callback?: (response: ResponseData) => void;
    reject?: (error: ErrorData) => void;
}

interface ResponseData {
    type: string;
    data: any;
    requestId: string;
}

interface ErrorData extends ResponseData {
    err: Error;
}

interface ClientWallet {
    client_id: string;
    toString(): string;
}
declare global {
    interface Window {
        BittapWalletInjected: BittapWalletInjected;
    }
}


export function getTabId():number{
    return Math.floor(Math.random()*10**4)+10000;
}


export async function createWindow(url:string, opts:WindowOptions= {}, openerWin = null){
    // @ts-ignore
    if(!openerWin || !openerWin.id){
        const createData = Object.assign({}, {
            url,
            top: 300,
            left: 360,
            width: 360,
            height: 558,
            // height: 660,
            type: CreateType.popup,
            focused: true,
            // setSelfAsOpener: true,
            // tabId: 0,

        }, opts)
        // console.log('create options: ', createData)
        return chrome.windows.create(createData)
    }else{
        // @ts-ignore
        return chrome.windows.update(openerWin.id, { focused: true })
    }
}
export function getCurrentActiveUserInfo(){
    // try{
    //     const app = createApp()
    //     const pinia = createPinia()
    //     const store = useAppStore(pinia)
    //     return store.getActiveAccount()
    // }catch(e){
    //     console.log('getCurrentActiveUserInfo error: ', e)
    //     return null
    // }
}
export async function getCurrentAssets(){
    const result = await getLocalStoreKey(CURRENT_USER_ASSETS)
    // console.log('getCurrentAssets result: ', result)
    return result
}

export async function getInvoices(_opt: RequestPageOptions={}){
    const wallet_id:string = (await getLocalStoreKey(CURRENT_USER_WALLET_ID)) as string 
    const result = await QueryAddressList({wallet_id, ..._opt })
    // console.log('getInvoices result: ', result)
    return result
}

export async function createInvoice({ asset_id, amount }: { asset_id: string, amount: string}){
    const wallet_id:string = (await getLocalStoreKey(CURRENT_USER_WALLET_ID)) as string 
    // console.log('createInvoice wallet_id: ', wallet_id, asset_id, amount)
    // @ts-ignore
    return await DecodeAssetsAddress({addr: await NewAssetAddress(wallet_id, asset_id, amount).then(res => res.data.address)})
}



export async function searchAssets({asset_name, asset_id, page_num=1, page_size=10  }: { asset_name?:string, asset_id?:string, page_num?:number, page_size?:number}): Promise<AssetInfoItem[]>{
    // @ts-ignore
    return await ListAssetsQuery(asset_name, asset_id, page_num, page_size).then(res => {
        return res.map((row:AssetInfo) => {
            return {
                asset_name: row.asset.asset_name,
                asset_id: row.asset.asset_id,
                total_supply: row.asset.total_supply,
                asset_type: row.asset.asset_type,
            }
        })
    })
}




export function jsInjectInit(){
    /**
     * Checks the doctype of the current document if it exists
     *
     * @returns {boolean} {@code true} if the doctype is html or if none exists
     */
    const  doctypeCheck = ()  => {
        const { doctype } = window.document;
        if (doctype) {
        return doctype.name === 'html';
        }
        return true;
    }
    if ((Object.prototype.hasOwnProperty.call(window,'BittapWalletInjected') && window.BittapWalletInjected) || 
        !doctypeCheck()) {
        return 
    }
    window.BittapWalletInjected = {
        queues: [],
        channelName: 'bittap.jssdk.event',
        REQUEST_TARGET: 'BITTAPWALLET_REQUEST',
        RESPONSE_TARGET: 'BITTAPWALLET_RESPONSE',
        notRemoveTypes: ['Bittap-onListenTransaction', 'Bittap-onAccountChange'],
        init(): ClientWallet {
            // const clientWallet: ClientWallet = new (function(this: ClientWallet) {
            //     this.client_id = window.BittapWalletInjected.getRequestId();
            //     this.toString = function() { return 'client id: ' + this.client_id; };
            // })();
            const clientWallet: ClientWallet = {
                client_id: window.BittapWalletInjected.getRequestId(),
                toString() { return 'client id: ' + this.client_id; }
            }

            window.addEventListener('message', (event: MessageEvent) => {
                const message = event.data;
                if (message && 
                    message.target === window.BittapWalletInjected.RESPONSE_TARGET &&
                    message.channel === window.BittapWalletInjected.channelName &&
                    message.data.client_id === clientWallet.client_id
                ) {
                    const { type, data, requestId } = message.data;
                    if (type && requestId) {
                        const queue = window.BittapWalletInjected.getRequestQueueInfo(requestId);
                        if (!queue) {
                            return false;
                        }
                        if (!data) {
                            queue.reject?.({ type, data, requestId, err: new Error('result data is empty.') });
                            return;
                        }
                        if (data.rejectResult) {
                            const msg = data.rejectMessage || 'The queue task was rejected.';
                            queue.reject?.({ type, data, requestId, err: new Error(msg) });
                            return;
                        } else {
                            queue.callback?.({ type, data, requestId });
                        }
                        if (!window.BittapWalletInjected.notRemoveTypes.includes(type)) {
                            window.BittapWalletInjected.removeQueueItem(requestId);
                        }
                    }
                }
            });

            return clientWallet;
        },
        sendMessage(data: any): void {
            window.postMessage({
                channel: window.BittapWalletInjected.channelName,
                data,
                target: window.BittapWalletInjected.REQUEST_TARGET,
                siteInfo: {
                    title: document.title,
                    host: window.location.hostname,
                    href: window.location.href,
                    icon: window.location.protocol + "//" + window.location.host + "/favicon.ico"
                }
            }, '*');
        },
        sendRequestJsBridge(queue: Queue): void {
            if (!queue) {
                throw new Error('queue is empty');
            }
            if (!queue.type) {
                throw new Error('type is empty');
            }
            if (!queue.client_id) {
                throw new Error('client_id is empty');
            }

            queue.time = Date.now();
            queue.type = ['Bittap', queue.type].join('-');
            queue.requestId = !window.BittapWalletInjected.notRemoveTypes.includes(queue.type) ? window.BittapWalletInjected.getRequestId() : queue.type;
            let queueInfo = window.BittapWalletInjected.getRequestQueueInfo(queue.requestId);
            if (queueInfo) {
                queueInfo.data = queue.data;
                queueInfo.callback = queue.callback;
            } else {
                window.BittapWalletInjected.queues.push(queue);
            }
            window.BittapWalletInjected.sendMessage({
                type: queue.type,
                data: queue.data,
                client_id: queue.client_id,
                requestId: queue.requestId,
            });

            if (queue.type === 'Bittap-DisConnection') {
                const removeQueueForClient = () => {
                    window.BittapWalletInjected.queues.forEach((que, queueIndex) => {
                        if (!window.BittapWalletInjected.notRemoveTypes.includes(que.type) && que.client_id === queue.client_id) {
                            window.BittapWalletInjected.queues.splice(queueIndex, 1);
                        }
                    });
                };
                setTimeout(removeQueueForClient, 0);
            }
        },
        getRequestId(): string {
            return Date.now() + Math.random().toString(36).substr(2, 9);
        },
        
        getRequestQueue(): Queue[] {
            return window.BittapWalletInjected.queues;
        },
        getRequestQueueInfo(requestId: string): Queue | undefined {
            return window.BittapWalletInjected.queues.find((queue) => queue.requestId === requestId);
        },
        removeQueueItem(requestId: string): void {
            const queueIndex = window.BittapWalletInjected.queues.findIndex((queue) => queue.requestId === requestId);
            if (queueIndex > -1) {
                window.BittapWalletInjected.queues.splice(queueIndex, 1);
            }
        },
    };

    console.log('Bittap Wallet Injected');
}