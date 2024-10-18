import { defineStore } from 'pinia'
import { RemovableRef, useStorage } from '@vueuse/core'

import ECPairFactory, { networks } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import {
  payments,
  initEccLib,
  crypto,
  // address,
  Signer,
  Psbt,
} from 'bitcoinjs-lib'

import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39'
import BIP32Factory from 'bip32'

import { Buffer } from 'buffer'

import {
  CreateWallet,
  ListAssetsQuery,
  ListAssetHistory,
  QueryAddressList,
  QueryAssetBalance,
  getBTCPriceAll,
  QueryBtcBalance,
  getGas,
} from '@/popup/api/btc/blockStream'
import { sendMessage, convertXpubToOther, toHex, UnixNow } from '@/popup/libs/tools'

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
  asset_type: string|number
}

export interface TransferRow {
  timestamp: number
  tx_id: string
  asset_id: string
  wallet_id?: string
  amount: number
  op_type: string
}

/**
 * fees
 */
export interface Fees {
  fastestFee: number
  halfHourFee:number
  hourFee:number
  economyFee:number
  minimumFee:number
  lastTime: number
}

export interface ReceiveAddrInfo {
  amount: number,
  asset_id: string,
  asset_type: string
  asset_version: string
  encoded: string
  internal_key: string
  proof_courier_addr: string
  script_key: string
  taproot_output_key: string
  asset_name?: string
}
export type ReceiveAddrRow = ReceiveAddrInfo
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
const MainNetUrl = 'https://mainnet.bittap.org'
const TestNetUrl = 'https://testnet.onebits.org'
const LocalNetUrl = 'https://devapi.onebits.org'

let RequestFeesLoading = false

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
  const fees: RemovableRef<Fees> = useStorage('mempoolFees', {"fastestFee":0,"halfHourFee":0,"hourFee":0,"economyFee":0,"minimumFee":0, lastTime: -1})

  const networkType = useStorage('networkType', 2) // default network:  0 mainnet / 1 local / 2 Testnet
  const networkRpcUrl = useStorage(
    'networkRpcUrl',
    TestNetUrl
  )
  const networkRpcToken = useStorage('networkRpcToken', '')
  const networkRpcTokenExpiredTime = useStorage('networkRpcTokenExpiredTime', -1)
  const currentBtcBalance = useStorage('currentBtcBalance', 0)

  const assetsList = useStorage('assetsList', [])
  const transferList: RemovableRef<TransferRow[]> = useStorage(
    'transferList',
    []
  )
  const receiveAddressList = useStorage('receiveAddressList', [])

  const getRpcToken = ()=>{
    if(networkRpcTokenExpiredTime.value < UnixNow() ){
      networkRpcToken.value = ''
      return networkRpcToken.value
    }
    return networkRpcToken.value.toString()
  }
  const setRpcToken = (rpcToken:string):void=>{
    // console.log('setRpcToken', networkRpcToken.value, rpcToken, new Date().toLocaleDateString())
    networkRpcToken.value = rpcToken
    networkRpcTokenExpiredTime.value = UnixNow() + 3600
  }
  const initConfig = () => {
    if (!networkRpcUrl.value) {
      return 
    }
    switch (networkType.value) {
      case 0:
        networkRpcUrl.value = MainNetUrl
        break;
      case 1:
        networkRpcUrl.value = LocalNetUrl
        break;
      case 2:
        networkRpcUrl.value = TestNetUrl
        break;
    }
    if (activeAccount.value < 0) {
      return
    }
    sendMessage('InitConfig', {
      activeAccount: activeAccount.value,
      currentInfo: getActiveAccount(),
      networkType: networkType.value,
      networkRpcUrl: networkRpcUrl.value,
      networkRpcToken: networkRpcToken.value,
    })
  }
  const getNetWorkType = () => {
    const nt = networkType.value || 0
    if (nt < 0 || nt > 2) {
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

  const changeNetWork = async (nt: number, url = '', token = '') => {
    if (![0, 1, 2].includes(nt)) {
      throw 'Network type not support'
    }
    if (nt === 1) {
      if (url === '') {
        throw 'Custom url must be specified'
      }
      networkRpcUrl.value = url
      networkRpcToken.value = token
    }
    // if (nt === 1) {
    //   networkRpcUrl.value = LocalNetUrl
    // }
    if (nt === 2) {
      networkRpcUrl.value = TestNetUrl
    }
    // nt is 0 not supported by configuration
    //Rebuild all users
    for(let i = 0; i< accountList.value.length; i++){
      const acc = accountList.value[i]
      try{
        const enPhrase = phrases.value[acc.phraseIndex]
        // @ts-ignore
        const phrase: string = await sendMessage('decryptMnemonic', enPhrase.phrase)
        if (!phrase || phrase.split(' ').length != 12) {
          throw Error('Invalid phrase')
        }
        initEccLib(ecc)
          const seed = mnemonicToSeedSync(phrase)
          const bip32 = BIP32Factory(ecc)
          const network =
            networkType.value === 0 ? networks.bitcoin : networks.testnet
          const rootKey = bip32.fromSeed(seed, network)
          const networkId = networkType.value === 0 ? 0 : 1
          const path = "m/84'/" + networkId + "'/0'"
          const childNodePrimary = rootKey.derivePath(path)
          // @ts-ignore
          const childNodeXOnlyPubkeyPrimary = toXOnly(childNodePrimary.publicKey)
          const p2trPrimary = payments.p2tr({
            internalPubkey: childNodeXOnlyPubkeyPrimary,
            network: network,
          })
          const path2 = "m/1017'/" + networkId + "'/212'"
          const childNodeScript = rootKey.derivePath(path2)
          if (!p2trPrimary.address || !p2trPrimary.output) {
            throw 'error creating p2tr'
          }
          const b84PublicKey = convertXpubToOther(
            childNodePrimary.neutered().toBase58(),
            'vpub'
          )
          const b1017PublicKey = convertXpubToOther(
            childNodeScript.neutered().toBase58(),
            'vpub'
          )
          CreateWallet(b1017PublicKey, b84PublicKey)
          .then(async (res) => {
            // @ts-ignore
            acc.address =  p2trPrimary.address
            acc.b84PublicKey = b84PublicKey
            acc.b1017PublicKey = b1017PublicKey
            acc.path = path
            // @ts-ignore
            acc.wallet_id = res.data.wallet_id
            // @ts-ignore
            acc.btcAddress = res.data.address
            acc.btcBalance = await QueryBtcBalance({ wallet_id: acc.wallet_id, btc_addr: acc.btcAddress })
            updateAssets()
          })
      }catch (err) {
        console.error(`switch account for ${i} on error: `, err)
      }
    }
    networkType.value = nt
    initConfig()
  }


  // chrome.storage.local.set({ key: value }).then(() => { console.log("Value is set"); });029-61199530

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
    const page_size = 10
    const loadData = async (page= 1) => {
      return ListAssetsQuery(undefined, undefined, page, page_size).then((res) => {
        if (res) {
          // @ts-ignore
          res.forEach((x) => {
            // eslint-disable-next-line no-self-assign
            x.asset.asset_id = x.asset.asset_id
            // @ts-ignore
            assetsList.value.push(x)
          })
        }
        return assetsList.value
      })
    }
    assetsList.value = []
    for(let i = 1; i<=3;i++){
      const re = await loadData(i)
      // console.log('re: ', re)
      if(re.length % page_size !== 0) {
        break
      }
    }
    return assetsList.value
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
        rowInfo.total_supply += row.total_supply ? Number(row.total_supply) : 0
      } else {
        // @ts-ignore
        assetsListOk.push({
          // @ts-ignore
          asset_id: row.asset.asset_id,
          // @ts-ignore
          asset_type: row.asset.asset_type || 0,
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

  const getAssetsInfoForAssetID = async (asset_id: string) => {
    const info = await ListAssetsQuery(undefined, asset_id, 1, 10)
    // @ts-ignore
    const currentInfo = info.find((x) => x.asset.asset_id === asset_id)
    if(currentInfo) {
      
      const assets = await getAssetsBalances()
      const asset_info = assets.find(x=>x.asset_id === asset_id)
      if(asset_info) {
        currentInfo.asset.balance = asset_info.amount
        currentInfo.asset.asset_type = asset_info.asset_type
      }else{
        currentInfo.asset.balance = 0
        // TODO: Type here is incorrect
        currentInfo.asset.asset_type = 0
      }
    }
    return currentInfo
  }

  const getAssetsBalances = async ():Promise<tokenInfo[]> => {
    const { wallet_id } = getActiveAccount()
    return QueryAssetBalance({ wallet_id }).then((res) => {
      // @ts-ignore
      return res.map((x) => {
        const { amount, asset_id, asset_tag, type } = x
        return {
          wallet_id,
          asset_id: toHex(asset_id),
          amount: amount,
          name: asset_tag,
          asset_type: type,
        }
      })
    })
  }

  const getUserAssetsBalance = async (): Promise<tokenInfo[]> => {
    if(accountList.value.length <= 0){
      return []
    }
    const wallet_id = getCurrentWalletId()
    const assets = await getAssetsBalances()
    const currentTokens = getTokens()

    assets.forEach((row) => {
      const tokenItem = tokens.value.find(
        (token) =>
          token.wallet_id === wallet_id && token.asset_id === row.asset_id
      )
      // console.log('tokenItem: ', tokenItem)
      if (tokenItem) {
        tokenItem.amount = row.amount
        tokenItem.asset_type = row.asset_type || 0
      }
    })
    
    // console.log('tokens.value.length: ', tokens.value.length, tokens.value, currentTokens)
    if(currentTokens.length <= 0){
      assets.forEach((token:tokenInfo) => {
        addToken(token)
      })
    }
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
    return ListAssetHistory({ wallet_id, asset_id: 'all' }).then((logs) => {
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

  const switchActiveAccount = (index: number) => {
    const oldIndex = activeAccount.value
    activeAccount.value = index
    transferList.value = []
    receiveAddressList.value = []
    setCurrentBtcBalance(0)
    sendMessage('switchActiveAccount', { oldIndex, newIndex:index })
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

  // @ts-ignore
  const toXOnly:Buffer = (publicKey: Buffer):Buffer => {
    return publicKey.slice(1, 33)
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
        const networkId = networkType.value === 0 ? 0 : 1
        const rootKey = bip32.fromSeed(seed, network)

        // console.log('phrase: %s', phrase)
        const path = "m/84'/" + networkId + "'/0'"
        const childNodePrimary = rootKey.derivePath(path)
        // @ts-ignore
        const childNodeXOnlyPubkeyPrimary = toXOnly(childNodePrimary.publicKey)

        // console.log('childNodePrimary.publicKey: %s\nprivateKey: %s \ntoBase58: %s', childNodePrimary.publicKey.toString('hex'), childNodePrimary.privateKey?.toString('hex'), childNodePrimary.toBase58())
        // console.log('Path: %s\nchild neutered().toBase58(): ', path, childNodePrimary.neutered().toBase58())
        // console.log('child neutered().toBase58() for zpub: ', childNodePrimary.neutered().toBase58().replace('xpub', 'zpub'))
        // console.log('vpub: ', convertXpubToOther(childNodePrimary.neutered().toBase58(), 'vpub'))
        const p2trPrimary = payments.p2tr({
          internalPubkey: childNodeXOnlyPubkeyPrimary,
          network: network,
        })

        const path2 = "m/1017'/" + networkId + "'/212'"
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
            // console.log('createWallet res: ', res)
            // @ts-ignore
            phrases.value.push({
              phrase: dePhrase,
              paths: [path],
            })
            phraseIndex = phrases.value.length - 1
            const result: AccountRow = {
              phraseIndex,
              // @ts-ignore
              address: p2trPrimary.address,
              b84PublicKey,
              b1017PublicKey,
              path,
              backup: _importMnemonic ? true : false,
              import: _importMnemonic ? true : false,
              name: _importMnemonic
                ? 'Import ' + (accountList.value.length + 1)
                : 'Account ' + (accountList.value.length + 1),
              // @ts-ignore
              wallet_id: res.data.wallet_id,
              // @ts-ignore
              btcAddress: res.data.address,
            }
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
      psbt.signInput(i, KeyPair)
    }
    psbt.finalizeAllInputs()
    return psbt
  }
  const getNetwork = () => {
    return networkType.value === 0 ? networks.bitcoin : networks.testnet
  }

  const getNetWorks = () => {
    return [
      {url: MainNetUrl, id: 0,},
      {url: LocalNetUrl, id: 1, custom:true },
      {url: TestNetUrl, id: 2 }
    ]
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
    // @ts-ignore
    const phrase: string = await sendMessage('decryptMnemonic', dePhrase.phrase)
    if (!phrase || phrase.split(' ').length != 12) {
      throw Error('Invalid phrase')
    }
    initEccLib(ecc)
    const seed = mnemonicToSeedSync(phrase)
    const bip32 = BIP32Factory(ecc)
    const network = getNetwork()
    const rootKey = bip32.fromSeed(seed, network)
    const childNodePrimary = rootKey.derivePath(path)
    if (isTweak) {
      const tweakedSigner = tweakSigner(
        childNodePrimary,
        // @ts-ignore
        Object.assign({}, { network }, opts)
      )
      return tweakedSigner
    }
    return childNodePrimary
  }

  function tweakSigner(signer: Signer, opts = {network:undefined}): Signer {
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
      // @ts-ignore
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
      // @ts-ignore
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
  const getReceiveAddress = (): Promise<ReceiveAddrInfo[]> => {
    const accountInfo = getActiveAccount()
    const { wallet_id } = accountInfo
    return QueryAddressList({ wallet_id }).then((addrs) => {
      // @ts-ignore
      return addrs.map((x) => {
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
    token.wallet_id = token.wallet_id ? token.wallet_id : getCurrentWalletId()
    const isFound = tokens.value.findIndex(
      (token) => token.wallet_id === token.wallet_id && token.asset_id === token.asset_id
    )
    if(!isFound) {
      tokens.value.push(token)
    }
  }
  const removeToken = (asset_id: string): void => {
    const wallet_id = getCurrentWalletId()
    const isFound = tokens.value.findIndex(
      (token) => token.wallet_id === wallet_id && token.asset_id === asset_id
    )
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
    receiveAddressList.value = []
  }

  /**
   * update fees
   */
  const updateGasFees = async (): Promise<Fees> => {
    const feesRes = await getGas()
    feesRes.lastTime = UnixNow()
    fees.value = Object.assign({},fees.value, feesRes)
    RequestFeesLoading = false
    return fees.value
  }
  /**
   * get fees
   */
  const getGasFees = async (): Promise<Fees> => {
    return new Promise<Fees>((resolve, reject) => {
      if(fees.value.lastTime <=0 || fees.value.lastTime + 30 < UnixNow()) {
        if(RequestFeesLoading === true) {
            setTimeout(() => {
              getGasFees().then(res => {
                resolve(res)
              }).catch(e => {
                reject(e)
              })
            }, 1000)
        }else{
          RequestFeesLoading = true
          updateGasFees().then(() => {
            resolve(fees.value)
          })
        }
      }else{
        resolve(fees.value)
      }
  })
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
    getAssetsInfoForAssetID,
    updateAllAccountsBtcBalance,
    getNetWorks,
    getNetWorkType,
    getRpcToken,
    setRpcToken,
    getGasFees,
    updateGasFees
  }
})
