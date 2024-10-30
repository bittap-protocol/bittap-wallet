// import be from '@tevm/blockexplorer'
// import mempoolJS from "@mempool/mempool.js";

// @ts-ignore
// import { useAppStore } from '@/stores/app.store'

import { postToast, toHex, hideLoading, isValidBitcoinAddress, isAssetId, getNetWorkConfig, getRpcToken, setRpcToken, getNetWorkType } from '../../libs/tools.ts'

// Request method
const OptionMethod = {
  POST: 'POST',
  GET: 'GET',
}
//Insensitive request status
let globalTokenRequested = false

/**
 * Insensitive request encapsulation
 * @param {String} api 
 * @param {Object} body 
 * @param {Object} options 
 * @returns {Promise<Object>}
 */
const requestRpc = async (api, body = null, options = {}) => {
  // const store = useAppStore()
  let rpcToken = getRpcToken()
  const { netType, url } = getNetWorkConfig()
  if (netType === 0) {
    throw new Error('Not currently supported')
  }
  console.log('netType, url: ', netType, url, import.meta.env.VITE_API_KEY)
  const fetchUrl = [url, api].join('').replace('//', '/')
  const opts = Object.assign({}, options, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    json: true,
  })
  const getGlobalRpcToken = async () => {
    globalTokenRequested = true
    const { token } = await getApiToken(import.meta.env.VITE_API_KEY)
    setRpcToken(token)
    rpcToken = getRpcToken()
    globalTokenRequested = false
  }
  if(!api.startsWith('/api/auth?')) {
    if(!rpcToken) {
      if(!globalTokenRequested) {
        // get token
        await getGlobalRpcToken()
      }else{
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            requestRpc(api, body, options).then(resolve).catch(reject)
          },1000)
        })
      }
    }
    if(rpcToken){
      if(globalTokenRequested){
        globalTokenRequested = false
      }
      // opts.headers['Authorization'] = 'Bearer ' + rpcToken
      opts.headers['Authorization'] = rpcToken
    }
  }
  opts.method = opts.method.toUpperCase()
  if (opts.method != 'GET' && body) {
    opts.body = JSON.stringify(body)
  } else {
    delete opts.body
  }
  console.log('requestRpc start: ', new URL(fetchUrl).pathname, ' is opts: ', body)
  return fetch(fetchUrl, opts)
    .then((res) => res.json())
    .then((data) => {
      console.log('requestRpc then: ', new URL(fetchUrl).pathname, ' is res: ', data)
      if (data) {
        if (data.code || data.message) {
          if(data.code === 4003) {
            setRpcToken('')
            return requestRpc(api, body, options).then(resolve).catch(reject)
          }
          if(!window){
            throw new Error('FetchError: ' + data.message)
          }else{
            postToast('FetchError: ' + data.message, 'error', 3000)
            hideLoading()
          }
          throw 'FetchError: ' + data.message
        } else {
          return data
        }
      } else {
        throw new Error('Request failed')
      }
    }).catch(e => {
      console.error('requestRpc catch: ', e)
      if(!window){
        throw new Error('FetchError: ' + e.message)
      }else{
        postToast('FetchError: ' + e.message, 'error', 3000)
        hideLoading()
        throw new Error('FetchError: ' + e.message)
      }
    })
}
/**
 * get request token
 * @param {String} API_KEY 
 * @returns Promise
 */
export async function getApiToken(API_KEY) {
  return requestRpc(
    '/api/auth?API_KEY='+API_KEY,
    {},
    { method: 'GET' }
  ).then(res=>res.data)
}
/**
 * Create a new wallet account
 * @param {String} asset_pubkey 
 * @param {String} account_pubkey 
 * @returns Promise
 */
export async function CreateWallet(asset_pubkey, account_pubkey) {
  return requestRpc(
    '/api/create-wallet',
    {
      asset_pubkey,
      account_pubkey,
    },
    { method: 'POST' }
  )
}
/**
 * New Asset Address
 * @param {String} wallet_id 
 * @param {String} asset_id 
 * @param {String} amount 
 * @returns Promise
 */
export async function NewAssetAddress(wallet_id, asset_id, amount) {
  return requestRpc(
    '/api/new-asset-address',
    {
      wallet_id,
      asset_id,
      amount: Number.parseInt(amount),
    },
    { method: 'POST' }
  )
}

/**
 * Query all Taproot Assets metadata in Bittapd without regarding end users.
 * @param {number} page_num Page number, default 1
 * @param {number} page_size Page size, default 10
 * @param {string|undefined} asset_name asset name
 * @param {asset_id|undefined} asset_name asset id from hex
 * @returns Promise
 */
export async function ListAssetsQuery(asset_name, asset_id, page_num=1, page_size=10) {
  const sendData= {
    page_num, page_size, asset_name, asset_id
  }
  if(asset_id && isAssetId(asset_id)){
    sendData.asset_id = asset_id 
  }else{
    if(asset_name) {
      sendData.asset_name = asset_name 
    }
  }

  return requestRpc(
    '/api/query-asset-stats',
    {
      page_num, page_size, asset_name, asset_id
    },
    {
      method: OptionMethod.POST,
    }
  ).then((res) => res.data.asset_stats||[])
}



/**
 * Query all created Taproot Assets addresses in a wallet.
 * @param {Object} data 
 * @returns Promise
 */
export async function QueryAddressList(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  return requestRpc('/api/query-addrs', asset, { method: 'POST' })
    .then((res) => res.data.addrs)
    .catch((e) => [])
}

/**
 * Get all Taproot Assets balance in a wallet.
 * @param {Object} data 
 * @returns Promise
 */
export async function QueryAssetBalance(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  return requestRpc('/api/get-asset-balance', asset, { method: 'POST' }).then(
    (res) => res.data.assets_balance
  )
}
/**
 * Get BTC balance in a wallet.
 * @param {Object} data 
 * @returns 
 */
export async function QueryBtcBalance(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  return requestRpc('/api/get-btc-balance', asset, { method: 'POST' })
    .then((res) => res.data.balance / 10 ** 8)
    .catch((e) => 0)
}

/**
 * First step to transfer Taproot Assets to an address. 
 *  Virtual psbts for active assets and passive assets 
 *  will be returned in response for user's first time sign.
 * @param {Object} data 
 * @returns Promise
 */
export async function TransferAssets(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  if (!asset.address) {
    throw 'address is required'
  }
  return requestRpc('/api/transfer-asset', asset, { method: 'POST' })
}

/**
 * Second step to transfer Taproot Assets to an address. 
 *  This will accept the user's signed virtual psbt to verify, 
 *  and if valid, return anchored psbt for another signature.
 * @param {Object} data 
 * @returns Promise
 */
export async function AnchorVirtualPsbt(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  if (!asset.asset_psbts) {
    throw 'asset_psbts is required'
  }
  return requestRpc('/api/anchor-virtual-psbt', asset, { method: 'POST' })
}

/**
 * Third step to transfer Taproot Assets to an address. 
 *  This will accept the user's signed anchor psbt to 
 *  broadcast to BTC network, if confirmed send proof to receiver too.
 * @param {Object} data 
 * @returns Promise
 */
export async function PublishTransfer(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  if (!asset.anchor_psbt) {
    throw 'anchor_psbt is required'
  }
  return requestRpc('/api/publish-transfer', asset, { method: 'POST' })
}

/**
 * First step to transfer BTC to an address. 
 *  Psbt will be returned in response for user's sign.
 * @param {Object} data 
 * @returns Promise<string>
 */
export async function TransferBtc(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  if (!asset.recv_addr) {
    throw 'recv_addr is required'
  }
  if (!asset.amount) {
    throw 'amount is required'
  }
  if (!asset.min_conf) {
    throw 'min_conf is required'
  }
  if (!asset.fee_rate) {
    throw 'fee_rate is required'
  }
  return requestRpc('/api/transfer-btc', asset, { method: 'POST' })
}

/**
 * Second step to transfer BTC to an address. 
 * This will accept the user's signed psbt to broadcast in BTC network.
 * @param {*} data 
 * @returns Promise
 */
export async function PublishTransferBtc(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  if (!asset.final_psbt) {
    throw 'final_psbt is required'
  }
  return requestRpc('/api/publish-transfer-btc', asset, { method: 'POST' })
}

/**
 * Second step to transfer BTC to an address. 
 * This will accept the user's signed psbt to broadcast in BTC network.
 * @param {*} data 
 * @returns Promise
 */
export async function PublishTransferBtcV2(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  if (!asset.final_psbt) {
    throw 'final_psbt is required'
  }
  return requestRpc('/api/publish-transfer-btc-v2', asset, { method: 'POST' })
}



/**
 * Decode a Taproot Assets address.
 * @param {Object} data 
 * @returns Promise
 */
export async function DecodeAssetsAddress(data) {
  const asset = Object.assign({}, data)
  if (!asset.addr) {
    throw 'addr is required'
  }
  return requestRpc('/api/decode-addr', asset, {
    method: 'POST',
  }).then((res) => {
    const {
      amount,
      asset_id,
      encoded,
      internal_key,
      proof_courier_addr,
      script_key,
      taproot_output_key,
      asset_name
    } = res.data
    return {
      amount,
      asset_id: toHex(asset_id),
      encoded,
      asset_name,
      internal_key: internal_key,
      proof_courier_addr,
      script_key: script_key,
      taproot_output_key: toHex(taproot_output_key),
    }
  })
}

/**
 * Estimate Max Btc
 * @param {Object} data 
 * @returns Promise<number>
 */
export async function EstimateMaxBtc(data) {
  const params = Object.assign({}, data)
  if (!params.wallet_id) {
    throw 'wallet_id is required'
  }
  if (!params.min_conf) {
    throw 'min_conf is required'
  }
  if (!params.fee_rate) {
    throw 'fee_rate is required'
  }
  return requestRpc('/api/estimate-max-btc', params, { method: 'POST' }).then(res => res.data.amount)
}
/**
 * Estimate tx fee
 * @param {Object} data 
 * @returns Promise<number>
 */
export async function EstimateTxFee(data) {
  const params = Object.assign({}, data)
  if (!params.wallet_id) {
    throw 'wallet_id is required'
  }
  if (!params.type) {
    throw 'type is required'
  }
  if (!params.fee_rate) {
    throw 'fee_rate is required'
  }
  return requestRpc('/api/estimate-tx-fee', params, { method: 'POST' }).then(res => res.data.tx_fee)
}


/**
 * Import a Taproot Asset from other universe.
 * @param {Object} data 
 * @returns Promise
 */
export async function ImportAsset(data) {
  const asset = Object.assign({}, data)
  if (!asset.asset_id) {
    throw 'asset_id is required'
  }
  if (!asset.universe_host) {
    throw 'universe_host is required'
  }
  return requestRpc('/api/import-asset', asset, { method: 'POST' })
}

/**
 * Import a Taproot Asset from other universe.
 * @param {Object} params 
 * @returns Promise
 */
export async function ListAssetHistory(params) {
  const data = Object.assign({}, params)
  if (!data.wallet_id) {
    throw 'wallet_id is required'
  }
  data.occurred_after = data.occurred_after || 0
  return requestRpc('/api/list-asset-history', data, { method: 'POST' })
    .then((res) => res.data.tx_histories||[])
    .catch((e) => [])
}



export async function MintAssets(data) {
  const asset = Object.assign(
    {
      asset_version: 'ASSET_VERSION_V0',
      asset_type: 'NORMAL',
      new_grouped_asset: false,
      grouped_asset: false,
      group_key: '',
      group_anchor: '',
    },
    data
  )
  if (!asset.name) {
    throw 'name is required'
  }
  if (!asset.amount || Number(asset.amount) <= 0) {
    throw 'amount is required'
  }

  // asset_meta = { data:'', type: 'META_TYPE_OPAQUE/META_TYPE_JSON', meta_hash: '' }
  return requestRpc(
    '/v1/taproot-assets/assets',
    { asset, short_response: false },
    { method: 'POST' }
  ).then((res) => res.pending_batch)
}
export async function NewAddressAssets(data) {
  const asset = Object.assign(
    {
      asset_version: 'ASSET_VERSION_V0',
    },
    data
  )
  if (!asset.asset_id) {
    throw 'asset_id is required'
  }
  if (!asset.amt || Number(asset.amt) <= 0) {
    throw 'amt is required'
  }

  // asset_meta = { data:'', type: 'META_TYPE_OPAQUE/META_TYPE_JSON', meta_hash: '' }
  return requestRpc('/v1/taproot-assets/addrs', asset, { method: 'POST' })
}

export async function SendAssets(data) {
  const asset = Object.assign({}, data)
  if (!asset.tap_addrs) {
    throw 'tap_addrs is required'
  }
  if (!asset.fee_rate || Number(asset.fee_rate) <= 0) {
    throw 'fee_rate is required'
  }
  return requestRpc('/v1/taproot-assets/send', asset, { method: 'POST' })
}
export async function AddrReceives(filter_addr, filter_status) {
  return requestRpc(
    '/v1/taproot-assets/addrs/receives',
    { filter_addr, filter_status },
    {
      method: 'POST',
    }
  )
}

export async function getAddressReceives(data) {
  const asset = Object.assign({}, data)
  return requestRpc('/v1/taproot-assets/addrs/receives', asset, {
    method: 'POST',
  })
}

export async function getInfo() {
  return requestRpc('/v1/taproot-assets/getinfo', { method: 'GET' })
}

/**
 * @param { Object } request
 * @example name, extended_public_key, master_key_fingerprint
 */
export async function ImportAccount(params) {
  const { name, extended_public_key, master_key_fingerprint } = params
  return requestRpc(
    '/v2/wallet/accounts/import',
    {
      name, // <string>
      extended_public_key, // <string>
      master_key_fingerprint, // <bytes> (base64 encoded)
      address_type: 'TAPROOT_PUBKEY', // <AddressType>
      dry_run: true, // <bool>
    },
    { method: 'POST' }
  )
}

export async function AssetsFinalize() {
  return requestRpc(
    '/v1/taproot-assets/assets/mint/finalize',
    { short_response: true, fee_rate: 1000 },
    { method: 'POST' }
  )
}

export async function ListTransfers() {
  return requestRpc('/v1/taproot-assets/assets/transfers').then(
    (res) => res.transfers
  )
}
export async function ListAccounts() {
  return requestRpc('/v2/wallet/accounts').then((res) => res.accounts)
}

export async function getBalance(p2trAddress) {
  // Replace with the URL of the blockchain browser API of your choice
  const apiUrl = `https://blockchain.info/q/addressbalance/${p2trAddress}`

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`Error fetching balance: ${response.statusText}`)
    }
    const balanceInSatoshis = await response.text()
    const balanceInBTC = Number(balanceInSatoshis) / 1e8
    return balanceInBTC
  } catch (error) {
    console.error('Failed to fetch balance:', error)
    return 0
  }
}

/**
 * fetch btc price from huobi
 * @returns 
 */
export async function getBTCUSDTPrice() {
  const response = await fetch(
    'https://api.huobi.com/market/detail/merged?symbol=btcusdt'
  )
  const data = await response.json()
  return data.tick.bid[0] || data.tick.close
}

/**
 * get btc price multi price
 * @returns {
    "time": 1711568104,
    "USD": 68552,
    "EUR": 63398,
    "GBP": 54161,
    "CAD": 92995,
    "CHF": 61939,
    "AUD": 105153,
    "JPY": 10386000
  }
  */
export async function getBTCPriceAll() {
  const response = await fetch('https://mempool.space/api/v1/prices')
  const data = await response.json()
  return data
}
/**
 * 
 * @param {string} address 
 * @returns {
    isvalid: true,
    address: "1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY",
    scriptPubKey: "76a914c825a1ecf2a6830c4401620c3a16f1995057c2ab88ac",
    isscript: false,
    iswitness: false
  }
  */
export async function validateAddress(p2trAddress) {
  const response = await fetch(
    'https://mempool.space/api/v1/validate-address/' + p2trAddress
  )
  const data = await response.json()
  return data
}

// get current gas price
export async function getGas() {
  // const store = useAppStore()
  const testnet = getNetWorkType() === 0 ? '': '/testnet'
  try {
    const response = await fetch('https://mempool.space'+testnet+'/api/v1/fees/recommended')
    const data = await response.json()
    return data
  } catch (err) {
    console.error('getGas onerro :', err)
  }
}


// get current gas price
export async function nslookupDomainInfo(domainOrAddress) {
  const isAddress = isValidBitcoinAddress(domainOrAddress)
  
  // const store = useAppStore()
  const testnet = getNetWorkType() === 0 ? '': ''
  const result = { isAddress, data: null, }
  if(!isAddress){
    const response = await fetch('https://tna-btc.com'+testnet+'/api/tapnames/profile?name='+domainOrAddress)
    result.data = (await response.json()).data
  }else{

  }
  return result
}
