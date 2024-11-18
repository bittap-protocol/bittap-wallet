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

