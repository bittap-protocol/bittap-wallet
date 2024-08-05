import { phrases } from '@/stores/app.store'
import { defineStore } from 'pinia'
import { RemovableRef, useStorage } from '@vueuse/core'

import ECPairFactory, { networks } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import {
  payments,
  initEccLib,
  crypto,
  address,
  Signer,
  Psbt,
} from 'bitcoinjs-lib'

import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39'
import BIP32Factory, { BIP32Interface } from 'bip32'

import { Buffer } from 'buffer'

import {
  CreateWallet,
  ListAssetsQuery,
  ListAssetHistory,
  QueryAddressList,
  QueryAssetBalance,
  getBTCPriceAll,
  getBTCUSDTPrice,
  QueryBtcBalance,
} from '@/popup/api/btc/blockStream'
import { sendMessage, convertXpubToOther, toHex } from '@/popup/libs/tools'

export interface Account {
  address: string
  phrase?: string
  phraseIndex: number
  publicKey?: string
  scriptPubKey?: string
  internalPubkey: string
  output: string
  path?: string
  WIF?: string
  privateKey?: string
  backup?: boolean
  import?: boolean
  name?: string
}
export type AccountInfo = Account | null

export const PathKey = {
  m44: "m/44'/0'/0'",
  m84: "m/84'/0'/0'",
  m86: "m/84'/0'/0'",
  m1017: "m/1017'/0'/212'",
}

export interface AccountRow {
  address: string 
  btcAddress?: string 
  phraseIndex: number
  b84PublicKey: string
  b1017PublicKey: string
  wallet_id?: string
  path: string
  backup: boolean
  import: boolean
  name: string,
  btcBalance?: number
}

export interface PhraseRow {
  phrase: string
  paths: string[]
}

export interface InternalKey {
  address: string | number | symbol | undefined
  rootKey: string
  scriptPubKey: unknown
  internalPubkey: string
  output: string
  path: string
  privateKey: string
  tweakPubKey: string
  encoded?: string
  taproot_output_key?: string
  status?: number
}

export interface tokenInfo {
  wallet_id?: string
  asset_id: string
  icon?: string
  amount: number
  name: string
  asset_type: string
}

export interface TransferRow {
  timestamp: number
  tx_id: string
  asset_id: string
  wallet_id?: string
  amount: number
  op_type: string
}

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
  const btcPrice = useStorage('btcPrice', {
    time: 0,
    USD: 0,
    EUR: 0,
    GBP: 0,
    CAD: 0,
    CHF: 0,
    AUD: 0,
    JPY: 0,
  })
  const name = useStorage('name', 'BitTap')
  const goBack = useStorage('goBack', false)
  const goBackUrl = useStorage('goBackUrl', '')

  const tokens: RemovableRef<tokenInfo[]> = useStorage('tokens', [])

  const accountList: RemovableRef<AccountRow[]> = useStorage('accountList', [])
  const activeAccount = useStorage('activeAccount', -1)

  const phrases: RemovableRef<PhraseRow[]> = useStorage('phrases', [])

  const networkType = useStorage('networkType', 1) // default network is 0 for mainnet
  const networkRpcUrl = useStorage(
    'networkRpcUrl',
    'https://devapi.onebits.org'
  )
  const networkRpcToken = useStorage('networkRpcToken', '')
  const currentBtcBalance = useStorage('currentBtcBalance', 0)

  const assetsList = useStorage('assetsList', [])
  const transferList: RemovableRef<TransferRow[]> = useStorage(
    'transferList',
    []
  )
  const internalKeyList = useStorage('internalKeyList', [])
  const receiveAddressList = useStorage('receiveAddressList', [])

  const initConfig = () => {
    if (activeAccount.value < 0) {
      return
    }
    if (networkRpcUrl.value != '') {
      sendMessage('InitConfig', {
        activeAccount: activeAccount.value,
        currentInfo: getActiveAccount(),
        networkType: networkType.value,
        networkRpcUrl: networkRpcUrl.value,
        networkRpcToken: networkRpcToken.value,
      })
    }
  }
  const getNetWorkType = () => {
    const nt = networkType.value || 0
    if (nt < 0 || nt > 1) {
      return 0
    }
    return nt
  }

  const getNetWorkConfig = () => {
    return {
      netType: getNetWorkType(),
      url: networkRpcUrl.value,
      token: networkRpcToken.value,
    }
  }

  const changeNetWork = (nt: number, url = '', token = '') => {
    if (![0, 1].includes(nt)) {
      throw 'Network type not support'
    }
    if (nt === 1) {
      if (url === '') {
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
  const setGoBackUrl = (url: string | null) => {
    goBackUrl.value = url
  }

  const getActiveAccount = (): AccountRow => {
    return getActiveAccountForIndex(activeAccount.value)
  }
  const getActiveAccountForIndex = (index: number): AccountRow => {
    // @ts-ignore
    return accountList.value.length <= 0 ||
      index <= -1 ||
      index > accountList.value.length - 1
      ? null
      : accountList.value[index]
  }
  const updateAssets = async () => {
    return ListAssetsQuery().then((res) => {
      if (res) {
        assetsList.value = res.map((x) => {
          x.asset.asset_id = toHex(x.asset.asset_id)
          return x
        })
      }
    })
  }
  const getAssetsList = () => {
    return assetsList.value
  }

  const getAssetsListForSelect = () => {
    // @ts-ignore
    const assetsListOk = []
    assetsList.value.forEach((row) => {
      // @ts-ignore
      const rowInfo = assetsListOk.find(
        // @ts-ignore
        (x) => x.asset_id === row.asset.asset_id
      )
      if (rowInfo) {
        // @ts-ignore
        rowInfo.total_supply += Number(row.total_supply)
      } else {
        // @ts-ignore
        assetsListOk.push({
          // @ts-ignore
          asset_id: row.asset.asset_id,
          // @ts-ignore
          total_supply: Number(row.asset.total_supply),
          // @ts-ignore
          name: row.asset.asset_name,
        })
      }
    })
    // @ts-ignore
    return assetsListOk
  }
  const getAssetsNameForAssetID = (asset_id: string):string => {
    // @ts-ignore
    const info = assetsList.value.find((x) => x.asset.asset_id === asset_id)
    // @ts-ignore
    return info ? info.asset.asset_name : 'Unknown'
  }

  const getAssetsBalances = async () => {
    const { wallet_id } = getActiveAccount()
    return QueryAssetBalance({ wallet_id }).then((res) => {
      console.log('QueryAssetBalance res: ', res)
      return res.map((x) => {
        const { amount, asset_id, asset_tag, type } = x
        return {
          asset_id: toHex(asset_id),
          amount: amount,
          name: asset_tag,
          asset_type: type,
        }
      })
    })
  }

  const getUserAssetsBalance = async (): Promise<tokenInfo[]> => {
    const wallet_id = getCurrentWalletId()
    const assets: tokenInfo[] = (await getAssetsBalances()) as tokenInfo[]
    
    assets.forEach((row) => {
      const tokenItem = tokens.value.find(
        (token) =>
          token.wallet_id === wallet_id && token.asset_id === row.asset_id
      )
      if (tokenItem) {
        tokenItem.amount = row.amount
      }
    })
    const currentTokens = tokens.value.filter((x: tokenInfo) => x.wallet_id === wallet_id) 
    console.log('tokens.value.length: ', tokens.value.length, tokens.value, currentTokens)
    return currentTokens.length >0 ? currentTokens : assets
  }

  const getCurrentWalletForAssetBalance = async (
    asset_id: string
  ): Promise<number> => {
    const userAssets = await getUserAssetsBalance()
    const currentAsset = userAssets.find((x) => x.asset_id === asset_id)
    console.log('userAssets:', userAssets, currentAsset, asset_id)
    return currentAsset ? currentAsset.amount : 0
  }

  const updateListTransfers = async () => {
    const wallet_id = getCurrentWalletId()
    return ListAssetHistory({ wallet_id }).then((logs) => {
      transferList.value = []
      if (logs && logs.length > 0) {
        logs.forEach((row: TransferRow) => {
          row.wallet_id = wallet_id
          transferList.value.push(row)
        })
      }
    })
  }
  const getTransferList = () => {
    return transferList.value
  }

  const getTransferListForCurrent = () => {
    const teakKeys = getInternalKeyList().map((x) => x.tweakPubKey)
    return transferList.value
      .filter((x) => {
        const keys = x.inputs.map((x) => x.script_key.substr(2))
        x.outputs.forEach((x) => keys.push(x.script_key.substr(2)))
        // console.log('keys: ', keys, teakKeys)
        return teakKeys.some((o) => keys.includes(o))
      })
      .reverse()
  }

  const switchActiveAccount = (index: number) => {
    activeAccount.value = index
    transferList.value = []
    receiveAddressList.value = []
    setCurrentBtcBalance(0)
    initConfig()
  }

  const AuthenticationPassword = async (pwd: string): Promise<boolean> => {
    if (phrases.value.length <= 0) {
      return Promise.resolve(false)
    }
    return await sendMessage('checkPassword', {
      // @ts-ignore
      check: phrases.value[0].phrase,
      pwd,
    }).then((res: unknown) => res === 'Ok')
  }
  const resetPassword = async (newPassword: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      //
      sendMessage('resetPassword', {
        newPassword,
        phrases: JSON.parse(JSON.stringify(phrases.value)),
      }).then((res) => {
        // @ts-ignore
        if (res && res.status) {
          // @ts-ignore
          phrases.value = res.phrases
          // reset password finish
          resolve(true)
        } else {
          reject(false)
        }
      })
    })
  }

  const createMnemonicPhrase = () => {
    // console.log('browserCrypto', browserCrypto)
    // const mnemonic = entropyToMnemonic(browserCrypto.Buffer.alloc(16).toString('hex'))
    const mnemonic = generateMnemonic()
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic generated!')
    }
    return {
      phrase: mnemonic,
    }
  }

  const validateMnemonicWords = (mnemonic: string) => {
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic generated!')
    }
    try {
      mnemonicToSeedSync(mnemonic)
    } catch (e) {
      throw new Error('Invalid mnemonic generated!')
    }
    return true
  }

  const toXOnly = (publicKey: any) => {
    return publicKey.slice(1, 33)
  }

  // @ts-ignore
  const getInternalKeyList = (): InternalKey[] => {
    const activeInfo: AccountInfo = getActiveAccount()
    // @ts-ignore
    return activeInfo
      ? internalKeyList.value.filter((k) => k.rootKey === activeInfo?.publicKey)
      : []
  }

  const generateInternalKey = (): InternalKey => {
    // @ts-ignore
    const { phrase, publicKey } = getActiveAccount()
    initEccLib(ecc)
    const seed = mnemonicToSeedSync(phrase)

    const bip32 = BIP32Factory(ecc)
    const rootKey = bip32.fromSeed(seed)
    // @ts-ignore get next user index from internal key list
    const userKeys = internalKeyList.value
      .filter((k) => k.rootKey === publicKey)
      .map((x) => Number(x.path.split('/')[5]))
      .sort((a, b) => b - a)
    const userIndex = userKeys.length <= 0 ? 1 : Number(userKeys[0]) + 2
    const path = "m/86'/0'/0'/0/" + userIndex
    const childNodePrimary = rootKey.derivePath(path)

    const path2 = "m/86'/0'/0'/0/" + (userIndex + 1)
    const childNodePrimary2 = rootKey.derivePath(path2)

    const childNodeXOnlyPubkeyPrimary2 = toXOnly(childNodePrimary2.publicKey)

    const tweakedChildNodePrimary2 = childNodePrimary.tweak(
      crypto.taggedHash('TapTweak', childNodeXOnlyPubkeyPrimary2)
    )
    // @ts-ignore
    const internalKeyInfo: InternalKey = {
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
    myList.forEach((row) => {
      // console.log('my list row : ', row)
      if (row.internalPubkey === internalPubkey) {
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
    myList.forEach((row) => {
      sendMessage('SubscribeReceiveEvents', row.encoded)
    })
  }

  // @ts-ignore
  const updateInternalKeyStatus = (status: number, internalPubkey: string) => {
    const myList = getInternalKeyList()
    // @ts-ignore
    myList.forEach((row) => {
      // console.log('my list row : ', row)
      if (row.internalPubkey === internalPubkey) {
        // update internal key info
        row.status = status
      }
    })
  }

  const convertTaprootOutputKeyToBech32m = (taproot_output_key: string) => {
    return address.toBech32(Buffer.from(taproot_output_key, 'hex'), 1, 'bc')
  }

  const createNewUser = async (
    _importMnemonic: string = ''
  ): Promise<AccountRow> => {
    let phrase: string = ''
    let dePhrase: string = ''
    let phraseIndex = -1
    if (!_importMnemonic || _importMnemonic === '') {
      const phraseResult = createMnemonicPhrase()
      phrase = phraseResult.phrase
      // @ts-ignore
      dePhrase = await sendMessage('encryptMnemonic', phrase)
    } else {
      // from to active user's mnemonic phrase
      phrase = _importMnemonic
      validateMnemonic(phrase)
      // @ts-ignore
      dePhrase = await sendMessage('encryptMnemonic', phrase)
    }
    return new Promise<AccountRow>((_resolve, _reject) => {
      try {
        initEccLib(ecc)
        const seed = mnemonicToSeedSync(phrase)
        const bip32 = BIP32Factory(ecc)
        const network =
          networkType.value === 0 ? networks.bitcoin : networks.testnet
        const rootKey = bip32.fromSeed(seed, network)

        // console.log('phrase: %s', phrase)
        const path = "m/84'/" + networkType.value + "'/0'"
        const childNodePrimary = rootKey.derivePath(path)
        const childNodeXOnlyPubkeyPrimary = toXOnly(childNodePrimary.publicKey)

        // console.log('childNodePrimary.publicKey: %s\nprivateKey: %s \ntoBase58: %s', childNodePrimary.publicKey.toString('hex'), childNodePrimary.privateKey?.toString('hex'), childNodePrimary.toBase58())
        // console.log('Path: %s\nchild neutered().toBase58(): ', path, childNodePrimary.neutered().toBase58())
        // console.log('child neutered().toBase58() for zpub: ', childNodePrimary.neutered().toBase58().replace('xpub', 'zpub'))
        // console.log('vpub: ', convertXpubToOther(childNodePrimary.neutered().toBase58(), 'vpub'))
        const p2trPrimary = payments.p2tr({
          internalPubkey: childNodeXOnlyPubkeyPrimary,
          network: network,
        })

        const path2 = "m/1017'/" + networkType.value + "'/212'"
        const childNodeScript = rootKey.derivePath(path2)

        // console.log('Path: %s\nchild neutered().toBase58(): ', path2, childNodeScript.neutered().toBase58())
        // console.log('child neutered().toBase58() for zpub: ', childNodeScript.neutered().toBase58().replace('xpub', 'zpub'))
        // console.log('vpub: ', convertXpubToOther(childNodeScript.neutered().toBase58(), 'vpub'))

        // console.log('p2trPrimary: ', p2trPrimary)
        if (!p2trPrimary.address || !p2trPrimary.output) {
          throw 'error creating p2tr'
        }

        // const scriptHash = crypto.sha256(p2trPrimary.output);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // const tweakedChildNodePrimary = childNodePrimary.tweak(
        //   crypto.taggedHash('TapTweak', childNodeXOnlyPubkeyPrimary),
        // );
        // const wif = childNodePrimary.toWIF();
        // const keypair = ECPair.fromWIF(wif);

        // if (childNodePrimary.publicKey.toString('hex') !== keypair.publicKey.toString('hex')) {
        //     throw 'createKeyPair error child node not match sanity check'
        // }
        const b84PublicKey = convertXpubToOther(
          childNodePrimary.neutered().toBase58(),
          'vpub'
        )
        const b1017PublicKey = convertXpubToOther(
          childNodeScript.neutered().toBase58(),
          'vpub'
        )
        // @ts-ignore
        if (accountList.value.some((r) => r.b84PublicKey === b84PublicKey)) {
          throw 'Mnemonics already exist'
        }

        // add request to web service
        // main for b84PublicKey
        CreateWallet(b1017PublicKey, b84PublicKey)
          .then((res) => {
            console.log('createWallet res: ', res)
            // @ts-ignore
            phrases.value.push({
              phrase: dePhrase,
              paths: [path],
            })
            phraseIndex = phrases.value.length - 1
            console.log('accountList: ', accountList, accountList.value)
            const result: AccountRow = {
              phraseIndex,
              address: p2trPrimary.address,
              b84PublicKey,
              b1017PublicKey,
              path,
              backup: _importMnemonic ? true : false,
              import: _importMnemonic ? true : false,
              name: _importMnemonic
                ? 'Import ' + (accountList.value.length + 1)
                : 'Account ' + (accountList.value.length + 1),
              wallet_id: res.data.wallet_id,
              btcAddress: res.data.address,
            }
            console.log('create account result: ', result)
            // @ts-ignore
            accountList.value.push(result)
            switchActiveAccount(accountList.value.length - 1)
            updateAccountCount()
            _resolve(result)
          })
          .catch((e) => {
            _reject(e)
          })
      } catch (err) {
        _reject(err)
      }
    })
  }
  const signTapprootAssetTransfer = async (psbt: Psbt): Promise<Psbt> => {
    for (let i = 0; i < psbt.data.inputs.length; i++) {
      const input = psbt.data.inputs[i]
      // @ts-ignore
      const { path } = input.tapBip32Derivation[0]
      // console.log('path: ', path)
      const KeyPair = await getCurrentAccountKeyPair(path, true)
      psbt.signInput(i, KeyPair)
    }
    // psbt.finalizeAllInputs()
    return psbt
  }
  const signAnchorPsbt = async (psbt: Psbt): Promise<Psbt> => {
    console.log('signAnchorPsbt psbt: ', psbt)

    for (let i = 0; i < psbt.data.inputs.length; i++) {
      const input = psbt.data.inputs[i]
      // @ts-ignore
      // const path = ['m', "84'", networkType.value + "'", "0'", 0, 0].join('/')

      let path = input.bip32Derivation[0].path
      if (path.startsWith("m/84'/0'") && networkType.value !== 0) {
        path = path.replace("m/84'/0'", "m/84'/1'")
      }
      const isTweak = path.startsWith('m/1017')
      const KeyPair = await getCurrentAccountKeyPair(
        path,
        isTweak,
        isTweak ? { tweakHash: input.tapMerkleRoot } : {}
      )
      console.log(
        'path: %s isTweak: ',
        path,
        isTweak,
        isTweak ? { tweakHash: input.tapMerkleRoot } : {}
      )
      psbt.signInput(i, KeyPair)
    }
    psbt.finalizeAllInputs()
    return psbt
  }
  const getNetwork = () => {
    return networkType.value === 0 ? networks.bitcoin : networks.testnet
  }
  // @ts-ignore
  const getCurrentAccountKeyPair = async (
    path: string = "m/84'/0'/0'",
    isTweak = false,
    opts = {}
  ) => {
    const { phraseIndex } = getActiveAccount()
    const dePhrase: PhraseRow = phrases.value[phraseIndex]
    //
    if (!dePhrase || !dePhrase.phrase) {
      throw Error('Invalid dePhrase')
    }
    console.log(
      'getCurrentAccountKeyPair phraseIndex: %d dePhrase: %s',
      phraseIndex,
      dePhrase
    )
    // @ts-ignore
    const phrase: string = await sendMessage('decryptMnemonic', dePhrase.phrase)
    if (!phrase || phrase.split(' ').length != 12) {
      throw Error('Invalid phrase')
    }
    initEccLib(ecc)
    console.log(
      'getCurrentAccountKeyPair path: %s phrase: ',
      path,
      phrase,
      dePhrase
    )
    const seed = mnemonicToSeedSync(phrase)
    const bip32 = BIP32Factory(ecc)
    const network = getNetwork()
    const rootKey = bip32.fromSeed(seed, network)
    const childNodePrimary = rootKey.derivePath(path)
    if (isTweak) {
      const tweakedSigner = tweakSigner(
        childNodePrimary,
        Object.assign({}, { network }, opts)
      )
      console.log('tweakedSigner:', tweakedSigner)
      return tweakedSigner
      // tweakSigner
      // const tweakedChildNodePrimary = childNodePrimary.tweak(
      //   crypto.taggedHash('TapTweak', toXOnly(childNodePrimary.publicKey)),
      // );
      // return tweakedChildNodePrimary
    }
    return childNodePrimary
  }

  function tweakSigner(signer: Signer, opts: any = {}): Signer {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey: Uint8Array | undefined = signer.privateKey!
    if (!privateKey) {
      throw new Error('Private key is required for tweaking signer!')
    }
    if (signer.publicKey[0] === 3) {
      privateKey = ecc.privateNegate(privateKey)
    }

    const tweakedPrivateKey = ecc.privateAdd(
      privateKey,
      tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash)
    )
    if (!tweakedPrivateKey) {
      throw new Error('Invalid tweaked private key!')
    }
    const ECPair = ECPairFactory(ecc)
    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
      network: opts.network,
    })
  }

  function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
    return crypto.taggedHash(
      'TapTweak',
      Buffer.concat(h ? [pubKey, h] : [pubKey])
    )
  }

  const updateCurrentAccountBackupState = () => {
    // @ts-ignore
    accountList.value[activeAccount.value].backup = true
  }
  // @ts-ignore
  const changeAccountName = (name, index) => {
    if (accountList.value[index]) {
      // @ts-ignore
      accountList.value[index].name = name
    }
  }
  const getReceiveAddress = () => {
    const accountInfo = getActiveAccount()
    const { wallet_id } = accountInfo
    return QueryAddressList({ wallet_id }).then((addrs) => {
      receiveAddressList.value = addrs.map((x) => {
        const {
          amount,
          asset_id,
          asset_type,
          asset_version,
          encoded,
          internal_key,
          proof_courier_addr,
          script_key,
          taproot_output_key,
        } = x
        return {
          amount,
          asset_id: toHex(asset_id),
          asset_type,
          asset_version,
          encoded,
          internal_key: toHex(internal_key),
          proof_courier_addr,
          script_key: toHex(script_key),
          taproot_output_key: toHex(taproot_output_key),
          asset_name: getAssetsNameForAssetID(toHex(asset_id)),
        }
      })
      console.log('receiveAddressList.value: ', receiveAddressList.value)
      return receiveAddressList.value
    })
  }
  const setCurrentBtcBalance = (btcBalance: number) => {
    currentBtcBalance.value = btcBalance
    const ac = getActiveAccount()
    ac.btcBalance = btcBalance
  }

  const updateAllAccountsBtcBalance = async ():Promise<void> => {
    for(let i =0 ; i < accountList.value.length; i ++ ){
      const { wallet_id, btcAddress } = accountList.value[i]
      accountList.value[i].btcBalance = await QueryBtcBalance({ wallet_id, btc_addr: btcAddress })
    }
  }

  const updateBtcPrices = async () => {
    const nowTime = Math.floor(Date.now() / 1000)
    if (nowTime - 30 < btcPrice.value.time) {
      return false
    }
    // @ts-ignore
    const { time, USD, EUR, GBP, CAD, CHF, AUD, JPY } = await getBTCPriceAll()
    if (time && USD) {
      btcPrice.value = { time, USD, EUR, GBP, CAD, CHF, AUD, JPY }
    }
    return btcPrice.value
  }

  const getCurrentWalletId = (): string => {
    const { wallet_id } = getActiveAccount()
    return wallet_id as string
  }
  const getTokens = (): tokenInfo[] => {
    const wallet_id = getCurrentWalletId()
    return tokens.value.filter((token) => token.wallet_id === wallet_id)
  }
  const addToken = (token: tokenInfo): void => {
    token.wallet_id = getCurrentWalletId()
    tokens.value.push(token)
  }
  const removeToken = (asset_id: string): void => {
    const wallet_id = getCurrentWalletId()
    const isFound = tokens.value.findIndex(
      (token) => token.wallet_id === wallet_id && token.asset_id === asset_id
    )
    console.log('isFound:', isFound)
    if (isFound >= 0) {
      tokens.value.splice(isFound, 1)
    }
  }
  /**
   * get transaction details
   * @param hash
   * @returns TransferRow
   * @throws Error
   */
  const getTransactionDetails = (hash: string): TransferRow | undefined => {
    if (!hash) {
      throw 'hash invalidity'
    }
    const wallet_id = getCurrentWalletId()
    const info = transferList.value.find(
      (row) => row.wallet_id === wallet_id && row.tx_id === hash
    )
    if (info) {
      throw 'transaction data not found'
    }
    return info
  }

  const clearAllTokens = (): void => {
    tokens.value = []
  }

  const clearAllData = (): void => {
    count.value = 0

    accountList.value = []
    activeAccount.value = -1

    phrases.value = []
    currentBtcBalance.value = 0

    assetsList.value = []
    transferList.value = []
    internalKeyList.value = []
    receiveAddressList.value = []
  }

  return {
    count,
    name,
    goBack,
    goBackUrl,
    accountList,
    activeAccount,
    phrases,
    receiveAddressList,
    currentBtcBalance,
    btcPrice,

    validateMnemonicWords,
    changeAccountName,
    AuthenticationPassword,
    resetPassword,
    updateAccountCount,
    switchActiveAccount,
    isGoBack,
    notGoBack,
    setGoBackUrl,
    getActiveAccount,
    getActiveAccountForIndex,
    updateCurrentAccountBackupState,
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
    initConfig,
    getCurrentAccountKeyPair,
    createNewUser,
    clearAllData,
    getReceiveAddress,
    getNetwork,
    signTapprootAssetTransfer,
    signAnchorPsbt,
    setCurrentBtcBalance,
    updateBtcPrices,
    getCurrentWalletId,
    getTokens,
    addToken,
    removeToken,
    getUserAssetsBalance,
    clearAllTokens,
    getCurrentWalletForAssetBalance,
    getTransactionDetails,
    getAssetsNameForAssetID,
    updateAllAccountsBtcBalance
  }
})
