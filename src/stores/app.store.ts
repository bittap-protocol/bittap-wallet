import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import ECPairFactory, { networks } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { payments, initEccLib, crypto } from 'bitcoinjs-lib'

import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import BIP32Factory from 'bip32';
import BIP86 from 'bip86';

import { Buffer } from 'buffer'


import { ListAssets, ListTransfers } from '@/popup/api/btc/blockStream'

export interface Account { 
  address: unknown; 
  phrase?: string; 
  publicKey?: string; 
  scriptPubKey?: unknown; 
  internalPubkey: string, 
  output:string, 
  path?: unknown; 
  WIF?: string; 
  privateKey?: unknown; 
  backup?: boolean; 
  name?: string; 
};
type AccountInfo = Account | null;

// @ts-ignore
// import browserCrypto from 'browser-crypto';


// const {
  // *   randomBytes,
  // * } = await import('node:crypto');
  // *
  // * const buf = randomBytes(256);

// import * as ecc from 'tiny-secp256k1'
// import bip32 from 'bip32'  
// import bip39 from 'bip39'  
// @ts-ignore
// import bitcoin from '~/popup/bitcoinjs-lib.js'



export const useAppStore = defineStore('app', () => {
  const count = useStorage('count', 0)
  const name = useStorage('name', 'BitTap')
  const password = useStorage('password', '')
  const goBack = useStorage('goBack', false)
  const goBackUrl = useStorage('goBackUrl', '')

  const accountList = useStorage('accountList', [])
  const activeAccount = useStorage('activeAccount', -1)

  const networkType = useStorage('networkType', 0)
  const networkRpcUrl = useStorage('networkRpcUrl', '')
  const networkRpcToken = useStorage('networkRpcToken', '')

  const assetsList = useStorage('assetsList', [])
  const transferList = useStorage('transferList', [])

  const getNetWorkType = () => {
    const nt = networkType.value || 0
    if(nt<0 || nt > 1) {
      return 0
    }
    return nt
  }

  const getNetWorkConfig = () => {
    return {
      netType: getNetWorkType(),
      url: networkRpcUrl.value,
      token: networkRpcToken.value
    }
  }

  const changeNetWork = (nt:number, url = '', token = '') => { 
    if(![0,1].includes(nt)) {
      throw 'Network type not support'
    }
    if(nt === 1) {
      if(url === '') {
        throw 'Custom url must be specified'
      }
      networkRpcUrl.value = url
      networkRpcToken.value = token
    }
    // nt is 0 not supported by configuration
    networkType.value = nt
  }

  // chrome.storage.local.set({ key: value }).then(() => { console.log("Value is set"); });

  // chrome.storage.local.get(["key"]).then((result) => { console.log("Value is " + result.key); });

  // You should probably use chrome.storage API instead of localStorage since localStorage history can be cleared by the user.
  // See https://developer.chrome.com/docs/extensions/reference/api/storage

  const updateAccountCount = () => {
    count.value = accountList.value.length
  }
  const isGoBack = () => {
    goBack.value = true
  }
  const notGoBack = () => {
    goBack.value = false
  }
  const setGoBackUrl = (url: string | null ) => {
    goBackUrl.value = url
  }

  const updateAssets = async () => {
    return ListAssets().then(res => {
      if(res) {
        assetsList.value = res
      }
    })
  }
  const getAssetsList = () => {
    return  assetsList.value
  }
  const updateListTransfers = async () => {
    return ListTransfers().then(res => {
      if(res) {
        transferList.value = res
      }
    })
  }
  const getTransferList = () => {
    return  transferList.value
  }

  // const initConfig = async () => {
  //   return chrome.storage.local.get(["password"]).then((result) => {  
  //     password.value = result.key || null
  //   });
  // }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savePassword = async (pwd: any) => {
    // return chrome.storage.local.set({ password: pwd }).then(() => {
    //   password.value = pwd
    // });
    password.value = pwd
  }
  const switchActiveAccount = (index: number) => {
    activeAccount.value = index
  }

  const getActiveAccount = (): AccountInfo => {
    return getActiveAccountForIndex(activeAccount.value)
  }
  const getActiveAccountForIndex = (index: number): AccountInfo => {
    return accountList.value.length <= 0 || index <=-1 || index > accountList.value.length-1 ? null : accountList.value[index]
  }
  
  const AuthenticationPassword= (pwd: string) =>{
    return password.value != pwd
  }

  const createMnemonicPhrase = () => { 
    // console.log('browserCrypto', browserCrypto)
    // const mnemonic = entropyToMnemonic(browserCrypto.Buffer.alloc(16).toString('hex'))
    const mnemonic = generateMnemonic()
    if (!validateMnemonic(mnemonic)) {
        throw new Error("Invalid mnemonic generated!");
    }
    return {
        phrase: mnemonic
    }
}

const toXOnly = (publicKey:any) => {
  return publicKey.slice(1, 33);
}

// @ts-ignore
const createAccount = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // return chrome.storage.local.set({ password: pwd }).then(() => {
    //   password.value = pwd
    // });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    return new Promise<any>((_resolve, _reject) => {
      try {
        initEccLib(ecc)
        const ECPair = ECPairFactory(ecc);

        const phraseResult = createMnemonicPhrase();
        const phrase = phraseResult.phrase;

        const seed =  mnemonicToSeedSync(phrase);

        const bip32 = BIP32Factory(ecc);

        // console.log({seed, phrase, phraseResult}, bip32)
        
        const rootKey = bip32.fromSeed(seed);
        const path = "m/86'/0'/0'/0/0"
        const childNodePrimary = rootKey.derivePath(path);

        const childNodeXOnlyPubkeyPrimary = toXOnly(childNodePrimary.publicKey);
        const p2trPrimary = payments.p2tr({
            internalPubkey: childNodeXOnlyPubkeyPrimary,
            network: networks.bitcoin
        });
        console.log('p2trPrimary: ', p2trPrimary)

        // { "name":"p2tr",
        //   "network":{"messagePrefix":"\\u0018Bitcoin Signed Message:\\n","bech32":"bc","bip32":{"public":76067358,"private":76066276},"pubKeyHash":0,"scriptHash":5,"wif":128},
        //   "address":"bc1pmjas4wsx6jxcw75jf0fc4cj70gzrje8sk7lcnqm455nysfdy8rasy9f2k6",
        //   "hash":null,
        //   "output":{"type":"Buffer","data":[81,32,220,187,10,186,6,212,141,135,122,146,75,211,138,226,94,122,4,57,100,240,183,191,137,131,117,165,38,72,37,164,56,251]},
        //   "redeemVersion":192,
        //   "pubkey":{"type":"Buffer","data":[220,187,10,186,6,212,141,135,122,146,75,211,138,226,94,122,4,57,100,240,183,191,137,131,117,165,38,72,37,164,56,251]},
        //   "internalPubkey":{"type":"Buffer","data":[95,23,218,210,16,67,108,151,191,128,173,239,249,246,67,219,253,242,175,12,7,104,41,89,61,151,118,245,133,252,20,149]}
        // }

        if (!p2trPrimary.address || !p2trPrimary.output) {
          throw "error creating p2tr"
        }

        const scriptHash = crypto.sha256(p2trPrimary.output);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tweakedChildNodePrimary = childNodePrimary.tweak(
          crypto.taggedHash('TapTweak', childNodeXOnlyPubkeyPrimary),
        );
        // console.log('tweakedChildNodePrimary: ', tweakedChildNodePrimary)

        // Do a sanity check with the WIF serialized and then verify childNodePrimary is the same
        const wif = childNodePrimary.toWIF();
        const keypair = ECPair.fromWIF(wif);

        if (childNodePrimary.publicKey.toString('hex') !== keypair.publicKey.toString('hex')) {
            throw 'createKeyPair error child node not match sanity check'
        }
        const accountRaw =  {
            phrase,
            address: p2trPrimary.address,
            scriptPubKey: scriptHash.toString('hex'),
            output: p2trPrimary.output.toString('hex'),
            publicKey: childNodePrimary.publicKey.toString('hex'),
            internalPubkey: childNodeXOnlyPubkeyPrimary.toString('hex'),
            path,
            WIF: childNodePrimary.toWIF(),
            privateKey: childNodePrimary.privateKey?.toString('hex'),
            backup: false,
            name: 'Account-'+accountList.value.length
        }
        // console.log('account create for m86: ', accountRaw)
        // @ts-ignore
        accountList.value.push(accountRaw)
        switchActiveAccount(accountList.value.length-1)
        updateAccountCount()
        // console.log('account current: ', activeAccount)
        _resolve(accountRaw)
      } catch (err) {
        _reject(err)
      }
    })
  }

  // @ts-ignore
  const importAccountFromWords = (words, pk) => {
    console.log('importAccountFromWords initalization', words, pk)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    return new Promise<any>((_resolve, _reject) => {
      console.log('importAccountFromWords initalization 2')
      let phrase = ''
      let p2trPrimary = null;
      const path = "m/86'/0'/0'/0/0"
      // @ts-ignore
      let accountRaw: Account | null = null;
      try {
        console.log('importAccountFromWords initalization 3')
        initEccLib(ecc)
        const ECPair = ECPairFactory(ecc);
        console.log('importAccountFromWords initalization 4')
        if(!words && !pk) {
          throw 'Parameter error'
        }

        if(words && words.length >= 12){
          console.log('word import: ', words);
          phrase = words.join(' ');

          const seed =  mnemonicToSeedSync(phrase);

          const bip32 = BIP32Factory(ecc);

          // console.log({seed, phrase, phraseResult}, bip32)
          
          const rootKey = bip32.fromSeed(seed);
          
          const childNodePrimary = rootKey.derivePath(path);

          const childNodeXOnlyPubkeyPrimary = toXOnly(childNodePrimary.publicKey);
          p2trPrimary = payments.p2tr({
              internalPubkey: childNodeXOnlyPubkeyPrimary,
              network: networks.bitcoin
          });
          if (!p2trPrimary.address || !p2trPrimary.output) {
            throw "error creating p2tr"
          }
  
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const tweakedChildNodePrimary = childNodePrimary.tweak(
            crypto.taggedHash('TapTweak', childNodeXOnlyPubkeyPrimary),
          );
  
          // Do a sanity check with the WIF serialized and then verify childNodePrimary is the same
          const wif = childNodePrimary.toWIF();
          const keyPair = ECPair.fromWIF(wif);
  
          if (childNodePrimary.publicKey.toString('hex') !== keyPair.publicKey.toString('hex')) {
              throw 'createKeyPair error child node not match sanity check'
          }
          const scriptHash = crypto.sha256(p2trPrimary.output);
          accountRaw =  {
              phrase,
              address: p2trPrimary.address,
              publicKey: childNodePrimary.publicKey.toString('hex'),
              output: p2trPrimary.output.toString('hex'),
              scriptPubKey: scriptHash.toString('hex'),
              internalPubkey: internalPubkey.toString('hex'),
              path,
              WIF: childNodePrimary.toWIF(),
              privateKey: childNodePrimary.privateKey?.toString('hex'),
              backup: true,
              name: 'Import-'+accountList.value.length
          }
        }
        if(pk){
          console.log('privateKeyHex import: ', pk);
          const keyPair = ECPair.fromPrivateKey(Buffer.from(pk, 'hex'), { network: networks.bitcoin })
          console.log('importAccountFromWords initalization 5')
          const internalPubkey = toXOnly(keyPair.publicKey)
          console.log('importAccountFromWords initalization 6')
          p2trPrimary = payments.p2tr({
              internalPubkey: internalPubkey,
              network: networks.bitcoin
          });
          const scriptHash = crypto.sha256(p2trPrimary.output);
          console.log('importAccountFromWords initalization 7')
          accountRaw =  {
              phrase,
              address: p2trPrimary.address,
              output: p2trPrimary.output.toString('hex'),
              scriptPubKey: scriptHash.toString('hex'),
              internalPubkey: internalPubkey.toString('hex'),
              publicKey: keyPair.publicKey.toString('hex'),
              path,
              WIF: keyPair.toWIF(),
              privateKey: pk,
              backup: true,
              name: 'Import-'+accountList.value.length
          }
        }
        // @ts-ignore
        if(accountList.value.some(x => x.address === accountRaw.address)){
          throw 'Account already exists'
        }
        
        // @ts-ignore
        accountList.value.push(accountRaw)
        switchActiveAccount(accountList.value.length-1)
        updateAccountCount()
        // console.log('account current: ', activeAccount)
        _resolve(accountRaw)
      } catch (err) {
        console.error('on error: ', err)
        _reject(err)
      }
    })
  }

  const updateCurrentAccountBackupState = () => {
    // @ts-ignore
    accountList.value[activeAccount.value].backup = true
  }
  // @ts-ignore
  const changeAccountName = (name, index) => {
    if(accountList.value[index]) {
      // @ts-ignore
      accountList.value[index].name = name
    }
  }

  return {
    count,
    name,
    goBack,
    password,
    goBackUrl,
    accountList,
    activeAccount,

    changeAccountName,
    savePassword,
    AuthenticationPassword,
    createAccount,
    updateAccountCount,
    switchActiveAccount,
    isGoBack,
    notGoBack,
    setGoBackUrl,
    getActiveAccount,
    getActiveAccountForIndex,
    updateCurrentAccountBackupState,
    importAccountFromWords,
    getNetWorkConfig,
    changeNetWork,
    updateAssets,
    getAssetsList,
    updateListTransfers,
    getTransferList,
  }
})
