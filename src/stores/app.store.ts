import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import ECPairFactory, { networks } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { payments, initEccLib, crypto } from 'bitcoinjs-lib'

import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import BIP32Factory from 'bip32';
import { Buffer } from 'buffer'


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
  const password = useStorage('password', null)
  const goBack = useStorage('goBack', false)
  const goBackUrl = useStorage('goBackUrl', '')

  const accountList = useStorage('accountList', [])
  const activeAccount = useStorage('activeAccount', -1)

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

  const getActiveAccount = () => {
    return getActiveAccountForIndex(activeAccount.value)
  }
  const getActiveAccountForIndex = (index: number) => {
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

        if (!p2trPrimary.address || !p2trPrimary.output) {
          throw "error creating p2tr"
          
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tweakedChildNodePrimary = childNodePrimary.tweak(
          crypto.taggedHash('TapTweak', childNodeXOnlyPubkeyPrimary),
        );

        // Do a sanity check with the WIF serialized and then verify childNodePrimary is the same
        const wif = childNodePrimary.toWIF();
        const keypair = ECPair.fromWIF(wif);

        if (childNodePrimary.publicKey.toString('hex') !== keypair.publicKey.toString('hex')) {
            throw 'createKeyPair error child node not match sanity check'
        }
        const accountRaw =  {
            phrase,
            address: p2trPrimary.address,
            publicKey: childNodePrimary.publicKey.toString('hex'),
            publicKeyXOnly: childNodeXOnlyPubkeyPrimary.toString('hex'),
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

  const importAccountFromWords = (words, pk) => {
    console.log('importAccountFromWords initalization', words, pk)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    return new Promise<any>((_resolve, _reject) => {
      console.log('importAccountFromWords initalization 2')
      let phrase = ''
      let p2trPrimary = null;
      const path = "m/86'/0'/0'/0/0"
      let accountRaw: { address: any; phrase?: string; publicKey?: string; publicKeyXOnly?: any; path?: any; WIF?: string; privateKey?: any; backup?: boolean; name?: string; } | null = null;
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
          accountRaw =  {
              phrase,
              address: p2trPrimary.address,
              publicKey: childNodePrimary.publicKey.toString('hex'),
              publicKeyXOnly: childNodeXOnlyPubkeyPrimary.toString('hex'),
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
          console.log('importAccountFromWords initalization 7')
          accountRaw =  {
              phrase,
              address: p2trPrimary.address,
              publicKey: keyPair.publicKey.toString('hex'),
              publicKeyXOnly: internalPubkey.toString('hex'),
              path,
              WIF: keyPair.toWIF(),
              privateKey: pk,
              backup: true,
              name: 'Import-'+accountList.value.length
          }
        }
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
    importAccountFromWords
  }
})
