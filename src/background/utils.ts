// import { RemovableRef, useStorage } from '@vueuse/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { useAppStore } from '@/stores/app.store'
import { CURRENT_USER_ASSETS, getLocalStoreKey } from '@/popup/libs/tools';



export const Settings = {
    NETWORK: 'testnet',
    BASE_URL: '/src/popup/index.html#',
    UNLOCK_WALLET: '/common/unlock',
    CONNECTION_WALLET: '/common/connectionWallet',
    SIGN_MESSAGE: '/common/sginMessage',
    SIGN_TRANSFER: '/common/sginTransfer',
    SWITCH_NETWORK: '/common/switchNetwork',
}

export enum CreateType {
    normal='normal', 
    popup='popup', 
    panel='panel'
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


export function getTabId():number{
    return Math.floor(Math.random()*10**4)+10000;
}

export async function createWindow(url:string, opts:WindowOptions= {}){
    const createData = Object.assign({}, {
        url,
        top: 300,
        left: 360,
        width: 360,
        height: 560,
        type: CreateType.popup,
        focused: true,
        // setSelfAsOpener: true,
        // tabId: 0,

    }, opts)
    console.log('create options: ', createData)
    return chrome.windows.create(createData)
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
    console.log('getCurrentAssets result: ', result)
    return result
}