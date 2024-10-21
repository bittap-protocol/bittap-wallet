
export const Settings = {
    NETWORK: 'testnet',
    BASE_URL: '/src/popup/index.html#',
    UNLOCK_WALLET: '/common/unlock',
    CONNECTION_WALLET: '/common/connectionWallet',
    SIGN_MESSAGE: '/common/sginMessage',
    SIGN_TRANSFER: '/common/sginTransfer',
}

export interface WindowOptions {
    top?: number,
    left?: number,
    width?: number,
    height?: number,
    type?: 'popup',
    focused?: boolean,
}

export async function createWindow(url:string, opts:WindowOptions= {}){
    console.log('chrome:', chrome)
    return chrome.windows.create(Object.assign({}, {
        url,
        top: 300,
        left: 360,
        width: 360,
        height: 530,
        type: 'popup',
        focused: true,
    }, opts))
}