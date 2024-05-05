import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import ECPairFactory, { networks } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { payments, initEccLib, crypto, address } from 'bitcoinjs-lib'

import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import BIP32Factory from 'bip32';


import { Buffer } from 'buffer'


import { ListAssets, ListTransfers } from '@/popup/api/btc/blockStream'
import { sendMessage } from '@/popup/libs/tools'

export interface Account { 
  address: string; 
  phrase?: string; 
  publicKey?: string; 
  scriptPubKey?: string; 
  internalPubkey: string, 
  output:string, 
  path?: string; 
  WIF?: string; 
  privateKey?: string; 
  backup?: boolean; 
  name?: string; 
};
type AccountInfo = Account | null;

export interface InternalKey {
  address: string | number | symbol | undefined; 
  rootKey: string; 
  scriptPubKey: unknown; 
  internalPubkey: string, 
  output:string, 
  path: string; 
  privateKey: string;
  tweakPubKey: string;
  encoded?: string;
  taproot_output_key?: string,
  status?: number,
};

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

  const networkType = useStorage('networkType', 1) // default network is 0 for mainnet
  const networkRpcUrl = useStorage('networkRpcUrl', 'https://devapi.onebits.org')
  const networkRpcToken = useStorage('networkRpcToken', '')

  const assetsList = useStorage('assetsList', [])
  const transferList = useStorage('transferList', [])
  const internalKeyList = useStorage('internalKeyList', [])

  const initConfig = () => {
    if (activeAccount.value < 0) { 
      return 
    }
    if (networkRpcUrl.value != '') { 
      sendMessage('InitConfig',{
        activeAccount: activeAccount.value,
        currentInfo: getActiveAccount(),
        networkType: networkType.value,
        networkRpcUrl: networkRpcUrl.value,
        networkRpcToken: networkRpcToken.value
      })
      
    }
    
  }
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
    initConfig()
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

  const getAssetsListForSelect = () => {
    const assetsListOk  = []
    assetsList.value.forEach(row => { 
      const rowInfo = assetsListOk.find(x => x.asset_id === row.asset_genesis.asset_id )
      if (rowInfo) {
        rowInfo.amount += Number(row.amount)
      } else { 
        assetsListOk.push({
          asset_id: row.asset_genesis.asset_id,
          amount: Number(row.amount),
          name: row.asset_genesis.name,
          version: row.version,
          asset_type: row.asset_genesis.asset_type
        })
      }
    })
    return assetsListOk
  }

  const getAssetsBalances = () => { 
    const teakKeys = getInternalKeyList().map(x => x.tweakPubKey)
    const assets = assetsList.value.filter(x => teakKeys.includes(x.script_key.substr(2)))
    const assetsListOk  = []
    assets.forEach(row => { 
      const rowInfo = assetsListOk.find(x => x.asset_id === row.asset_genesis.asset_id )
      if (rowInfo) {
        rowInfo.amount += Number(row.amount)
      } else { 
        assetsListOk.push({
          asset_id: row.asset_genesis.asset_id,
          amount: Number(row.amount),
          name: row.asset_genesis.name,
          version: row.version,
          asset_type: row.asset_genesis.asset_type
        })
      }
    })
    return  assetsListOk
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

  const getTransferListForCurrent = () => { 
    const teakKeys = getInternalKeyList().map(x => x.tweakPubKey)
    return transferList.value.filter(x => { 
      const keys = x.inputs.map(x => x.script_key.substr(2))
      x.outputs.forEach(x => keys.push(x.script_key.substr(2)))
      // console.log('keys: ', keys, teakKeys)
      return teakKeys.some(o => keys.includes(o))
    }).reverse()
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
    initConfig()
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
const getInternalKeyList = (): InternalKey[] => {
  const activeInfo: AccountInfo = getActiveAccount()
  // @ts-ignore
  return activeInfo ? internalKeyList.value.filter(k=> k.rootKey === activeInfo?.publicKey) : []
}

const generateInternalKey = (): InternalKey => {
  // @ts-ignore
  const { phrase, publicKey } = getActiveAccount()
  initEccLib(ecc)
  const seed =  mnemonicToSeedSync(phrase);

  const bip32 = BIP32Factory(ecc);
  const rootKey = bip32.fromSeed(seed);
  // @ts-ignore get next user index from internal key list
  const userKeys = internalKeyList.value.filter(k=> k.rootKey === publicKey).map(x => Number(x.path.split('/')[5])).sort((a,b) => b-a);
  const userIndex = userKeys.length <= 0 ? 1: Number(userKeys[0])+2
  const path = "m/86'/0'/0'/0/"+userIndex
  const childNodePrimary = rootKey.derivePath(path);

  const path2 = "m/86'/0'/0'/0/"+(userIndex+1)
  const childNodePrimary2 = rootKey.derivePath(path2);

  const childNodeXOnlyPubkeyPrimary2 = toXOnly(childNodePrimary2.publicKey);

  const tweakedChildNodePrimary2 = childNodePrimary.tweak(
    crypto.taggedHash('TapTweak', childNodeXOnlyPubkeyPrimary2),
  );
  // @ts-ignore
  const internalKeyInfo:InternalKey = {
    rootKey: publicKey,
    scriptPubKey: childNodePrimary2.publicKey.toString('hex'),
    tweakPubKey: toXOnly(tweakedChildNodePrimary2.publicKey).toString('hex'),
    internalPubkey: childNodePrimary.publicKey.toString('hex'),
    path,
  }
  console.log('generate InternalKeyInfo: ', internalKeyInfo)
  // @ts-ignore
  internalKeyList.value.unshift(internalKeyInfo)
  return internalKeyInfo
}

// @ts-ignore
const updateInternalKeyEncoded = (updateInfo, internalPubkey: string) => {
    const myList = getInternalKeyList()
    // @ts-ignore
    myList.forEach(row => {
      // console.log('my list row : ', row)
      if(row.internalPubkey === internalPubkey) {
        // update internal key info
        row.encoded = updateInfo.encoded
        row.taproot_output_key = updateInfo.taproot_output_key
        // add encoded to queue
        sendMessage('SubscribeReceiveEvents', row.encoded)
      }
    })
}
  
// @ts-ignore
const subscribeReceiveAllEncoded = () => { 
  const myList = getInternalKeyList()
  // @ts-ignore
  myList.forEach(row => { 
    sendMessage('SubscribeReceiveEvents', row.encoded)
  })
}
  
// @ts-ignore
const updateInternalKeyStatus = (status:number, internalPubkey: string) => {
    const myList = getInternalKeyList()
    // @ts-ignore
    myList.forEach(row => {
      // console.log('my list row : ', row)
      if(row.internalPubkey === internalPubkey) {
        // update internal key info
        row.status = status
      }
    })
}

const convertTaprootOutputKeyToBech32m = (taproot_output_key: string) => { 
  return address.toBech32(Buffer.from(taproot_output_key, 'hex'), 1, 'bc')
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
    getAssetsBalances,
    getAssetsListForSelect,
    updateListTransfers,
    getTransferList,
    getTransferListForCurrent,
    getInternalKeyList,
    generateInternalKey,
    updateInternalKeyEncoded,
    convertTaprootOutputKeyToBech32m,
    updateInternalKeyStatus,
    subscribeReceiveAllEncoded,
    initConfig
  }
})
