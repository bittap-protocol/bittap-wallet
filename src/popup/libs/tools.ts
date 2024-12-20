import bs58check from 'bs58check-ts'
import { Buffer } from 'buffer'
// @ts-ignore
import AES from 'crypto-js/aes'
// @ts-ignore
import EncUtf8 from 'crypto-js/enc-utf8'
import { useStorage } from '@vueuse/core'


export const netWorkTypes = [
  'mainnet',
  'regtest',
  'testnet'
]

export enum TxsStatus {
  // Transaction status is pending.
  pending = "pending",
  // Transaction status is confirmed.
  confirmed = "confirmed",
  // Transaction status is failed.
  failed = "failed",
}

export const MainNetUrl = 'https://mainnet.bittap.org'
export const TestNetUrl = 'https://testnet.onebits.org'
export const LocalNetUrl = 'https://devapi.onebits.org'


export const channelName = 'bittap.jssdk.event'
export const REQUEST_TARGET = 'BITTAPWALLET_REQUEST'
export const RESPONSE_TARGET =  'BITTAPWALLET_RESPONSE'
export const REQUEST_CURRENT_SITE =  'REQUEST_CURRENT_SITE'

export const CURRENT_USER_ASSETS =  'CURRENT_USER_ASSETS'
export const CURRENT_USER_INDEX =  'CURRENT_USER_INDEX'
export const CURRENT_USER_WALLET_ID =  'CURRENT_USER_WALLET_ID'

export const ON_LISTEN_TRANSACTION_EVENT =  'Bittap-onListenTransaction'
export const ADD_LISTEN_TX_ID =  'Bittap-addListenTxId'

export const BROADCAST_ON_LISTEN_TRANSACTION_EVENT =  'broadcast-Bittap-onListenTransaction'


export const networkType = useStorage('networkType', 2)
export const networkRpcUrl = useStorage('networkRpcUrl',TestNetUrl)
export const networkRpcToken = useStorage('networkRpcToken', '')
export const networkRpcTokenExpiredTime = useStorage('networkRpcTokenExpiredTime', -1)


export interface RequestPageOptions{
  page_num?: number
  page_size?: number
}

export interface RequestItem {
  type: string
  data: never,
  requestId: string,
  client_id: string
}

export interface RequestSignTransaction{
  recv_addr: string
  // Amount to transfer.
  amount?: number
  // Minimum confirmations required.
  min_conf?: number
    // Fee rate.
  fee_rate?: number
  // network fee
  networkFee?: number
  receive_addr?: string
}


export interface SiteInfo {
  host: string
  href: string
  icon: string
  title: string
}

export interface CurrentUserAssetsItem {
  asset_id: string
  amount: number
  name: string
  asset_type: string|number
  timestamp?: number
}



export interface AccountChangeInfo {
  account: {
    btcAddress: string,
    name: string
  }
  network: {
    name: string
  }
}

export type CurrentUserAssetsBalance = CurrentUserAssetsItem[]

/**
 * verify password
 * @param {String} pwd password
 * @returns boolean
 */
export function TestPassword(pwd: string) {
  // eslint-disable-next-line no-useless-escape
  return /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z\!\@\#\$\%\^\&\*\(\)\_\-+]{8,12}$/.test(
    pwd
  )
}

/**
 * verify url parameters
 * @param url 
 * @returns boolean
 */
export function TestUrl(url: string) {
  // return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(url)
  return /^(http|ftp|https):\/\/[\w\-_]+/.test(url)
}

/**
 * verify asset_id
 * @param id
 * @returns boolean
 */
export function isAssetId(id:string):boolean {
  return /^[0-9a-f]{64}$/.test(id)
}

/**
 * verify txid
 * @param txid 
 * @returns 
 */
export function isTxId(txid: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(txid);
}

export function getNetWorkType () {
  const nt = networkType.value || 0
  if (nt < 0 || nt > 2) {
    return 0
  }
  return nt
}

export function getNetWorkConfig(): { netType: number, url: string, token: string } {
  
  return {
    netType: networkType.value,
    url: networkRpcUrl.value,
    token: networkRpcToken.value,
  }
}

export function setNetworkConfiguration(netType:number, url:string):void {
  networkType.value = netType
  networkRpcUrl.value = url
  // console.log('setNetworkConfiguration:', netType, url)
}

export function setRpcToken(rpcToken:string):void {
  networkRpcToken.value = rpcToken
  networkRpcTokenExpiredTime.value = UnixNow() + 3600
}

export function getRpcToken():string {
  if(networkRpcTokenExpiredTime.value < UnixNow() ){
    networkRpcToken.value = ''
    return networkRpcToken.value
  }
  return networkRpcToken.value.toString()
}

/**
 * send message to browser of channel
 * @param eventType 
 * @param data 
 */
export function postMsg(eventType: string, data: unknown) {
  window.postMessage({ event: eventType, data: data }, '*')
}

/**
 * get unix timestamp
 * @returns number of unix timestamp
 */
export function UnixNow(): number {
  return Math.floor(Date.now()/1000)
}

/**
 * send toast message to plugin
 * @param text 
 * @param type 
 * @param delay 
 */
export function postToast(text: string, type:string = 'error', delay:number = 3000) {
  postMsg('toast', { text, type, delay })
}

/**
 * show loading indicator
 * @param text 
 */
export function showLoading(text: string) {
  postMsg('showLoading', { text })
}

/**
 * hidden loading indicator
 */
export function hideLoading() {
  postMsg('hideLoading', {})
}
export function hideFullscreen() {
  postMsg('hideFullscreen', {})
}

/**
 * send message to plugin
 * @param {String} type message type
 * @param {Any} data message data
 * @returns void
 */
export function sendMessage(
  type: string,
  data: unknown
): Promise<unknown | string | boolean | never> {
  return (
    chrome.runtime
      // @ts-ignore
      .sendMessage({ type: type, data: data })
      .then((r) => (r && r.data) || '')
  )
}

/**
 * add transaction status listen
 * @param txIds txids to listen
 * @returns Promise<unknown>
 */
export function addTransactionStatusListen(txIds: string[]){
  // message.data.data.data.txIds
  return sendMessage(ADD_LISTEN_TX_ID, {
    data:{
      data:{
        txIds
      }
    }
  })
}

/**
 * verify btc address
 * @param address 
 * @returns boolean
 */
export function isValidBitcoinAddress(address: string): boolean {
  const regex = /^(bc1p|bcrt|tb1q)[a-zA-HJ-NP-Z0-9]{38,40}$/
  return regex.test(address)
}

/**
 * get url query string
 * @param key 
 * @returns string
 */
export function getQuery(key: string): string {
  if (decodeURI(window.location.href).split('?').length <= 1) {
    return ''
  }
  const vRow = decodeURI(window.location.href)
    .split('?')[1]
    .split('&')
    .map((xo) => {
      // @ts-ignore
      const x = xo.split('=')
      const vk = x[0]
      // @ts-ignore
      x.shift()
      return {
        k: vk,
        // @ts-ignore
        v: x.join(''),
      }
    })
    .find((x) => x.k === key)
  return vRow ? vRow.v : ''
}

/**
 * show address and asset_id
 * @param address
 * @param left
 * @param right
 * @returns
 */
export function showAddressAndAssetId(
  address: string,
  left: number = 8,
  right: number = 8,
  centerString: string = '...'
): string {
  return address
    ? [
        address.substring(0, left),
        address.substring(address.length - right),
      ].join(centerString)
    : ''
}

/**
 * random int number generator
 * @param {number} min min value
 * @param {number} max max value
 * @returns 
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * max) + min
}

/**
 * conver xpub to target format string
 * @param xpub xpub string
 * @param targetFormat target format string
 * @returns 
 */
export function convertXpubToOther(xpub: string, targetFormat: string) {
  const prefixes: Map<string, string> = new Map([
    ['xpub', '0488b21e'],
    ['ypub', '049d7cb2'],
    ['Ypub', '0295b43f'],
    ['zpub', '04b24746'],
    ['Zpub', '02aa7ed3'],
    ['tpub', '043587cf'],
    ['upub', '044a5262'],
    ['Upub', '024289ef'],
    ['vpub', '045f1cf6'],
    ['Vpub', '02575483'],
  ])
  if (!prefixes.has(targetFormat)) {
    return 'Invalid target version'
  }

  try {
    let data = bs58check.decode(xpub.trim())
    data = data.slice(4)
    // @ts-ignore
    data = Buffer.concat([Buffer.from(prefixes.get(targetFormat), 'hex'), data])
    return bs58check.encode(data)
  } catch (err) {
    return "Invalid extended public key! Please double check that you didn't accidentally paste extra data."
  }
}

/**
 * encrypt a string
 * @param data data to encrypt
 * @param key key
 * @returns 
 */
export function encryptData(data: string, key: string): string {
  return AES.encrypt(data, key).toString()
}

/**
 * decrypt a string
 * @param ciphertext cipher text
 * @param key cipher key
 * @returns string
 */
export function decryptData(ciphertext: string, key: string): string {
  const bytes = AES.decrypt(ciphertext, key)
  // console.log('bytes: ', bytes, EncUtf8)
  return bytes.toString(EncUtf8)
}

/**
 * encrypt mnemonic
 * @param mnemonic 
 * @param password 
 * @returns 
 */
export async function encryptMnemonic(mnemonic: string, password: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(mnemonic)

  // Generate the encryption key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: crypto.getRandomValues(new Uint8Array(16)),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  )

  return {
    encrypted: Buffer.from(encrypted).toString('hex'),
    iv: Buffer.from(iv).toString('hex'),
  }
}

/**
 * decrypt mnemonic
 * @param encryptedData 
 * @param password 
 * @param ivHex 
 * @returns 
 */
export async function decryptMnemonic(
  encryptedData: string,
  password: string,
  ivHex: string
) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const iv = Buffer.from(ivHex, 'hex')

  // Use PBKDF2 to generate the decryption key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: crypto.getRandomValues(new Uint8Array(16)),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    Buffer.from(encryptedData, 'hex')
  )

  return decoder.decode(decrypted)
}

/**
 * save the encrypted data
 * @param encryptedMnemonic 
 * @param iv 
 * @returns 
 */
export async function saveEncryptedMnemonic(
  encryptedMnemonic: string,
  iv: string
) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ encryptedMnemonic, iv }, () => {
      resolve(true)
    })
  })
}

export async function getLocalStoreKey(key:string) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result && Object.prototype.hasOwnProperty.call(result, key) ? result[key] : null)
    })
  })
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveLocalStoreKey(key:string, value:any) {
    return chrome.storage.local.set({[key]:value})
}

/**
 * get encrypted mnemonic
 * @returns 
 */
export async function getEncryptedMnemonic() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['encryptedMnemonic', 'iv'], (result) => {
      resolve(result)
    })
  })
}

/**
 * convert to hex string
 * @param o original string
 * @returns hex string
 */
export function toHex(o: string): string {
  return Buffer.from(o, 'base64').toString('hex')
}


export function getTxUrl(tx_id:string, netType: string =''):string{
  return [['https://mempool.space', netType].join('/'),'tx', tx_id].join('/')
}