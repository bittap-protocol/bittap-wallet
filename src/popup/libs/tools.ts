import bs58check from 'bs58check-ts'
import { Buffer } from 'buffer'
import AES from 'crypto-js/aes'
import EncUtf8 from 'crypto-js/enc-utf8'

export function TestPassword(pwd: string) {
  return /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z\!\@\#\$\%\^\&\*\(\)\_\-+]{8,16}$/.test(
    pwd
  )
}

export function TestUrl(url: string) {
  // return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(url)
  return /^(http|ftp|https):\/\/[\w\-_]+/.test(url)
}

export function postMsg(eventType: string, data: unknown) {
  window.postMessage({ event: eventType, data: data }, '*')
}

export function postToast(text: string, type = 'error', delay = 3000) {
  postMsg('toast', { text, type, delay })
}
export function showLoading(text: string) {
  postMsg('showLoading', { text })
}
export function hideLoading() {
  postMsg('hideLoading', {})
}

export function sendMessage(
  type: string,
  data: unknown
): Promise<unknown | string | boolean> {
  return (
    chrome.runtime
      // @ts-ignore
      .sendMessage(null, { type: type, data: data })
      .then((r) => (r && r.data) || '')
  )
}
export function isValidBitcoinAddress(address: string): boolean {
  const regex = /^bcrt1q[a-zA-HJ-NP-Z0-9]{38}$/
  return regex.test(address)
}

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

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * max) + min
}

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
    data = Buffer.concat([Buffer.from(prefixes.get(targetFormat), 'hex'), data])
    return bs58check.encode(data)
  } catch (err) {
    return "Invalid extended public key! Please double check that you didn't accidentally paste extra data."
  }
}

export function encryptData(data: string, key: string): string {
  return AES.encrypt(data, key).toString()
}

export function decryptData(ciphertext: string, key: string): string {
  const bytes = AES.decrypt(ciphertext, key)
  console.log('bytes: ', bytes, EncUtf8)
  return bytes.toString(EncUtf8)
}

export async function encryptMnemonic(mnemonic: string, password: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(mnemonic)

  // 使用 PBKDF2 生成加密密钥
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

export async function decryptMnemonic(
  encryptedData: string,
  password: string,
  ivHex: string
) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const iv = Buffer.from(ivHex, 'hex')

  // 使用 PBKDF2 生成解密密钥
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

export async function getEncryptedMnemonic() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['encryptedMnemonic', 'iv'], (result) => {
      resolve(result)
    })
  })
}

export function toHex(o: string): string {
  return Buffer.from(o, 'base64').toString('hex')
}
