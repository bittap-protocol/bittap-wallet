// import be from '@tevm/blockexplorer'
// import mempoolJS from "@mempool/mempool.js";

// @ts-ignore
import { useAppStore } from '@/stores/app.store'

import { postToast, toHex, hideLoading } from '../../libs/tools.ts'

const OptionMethod = {
  POST: 'POST',
  GET: 'GET',
}

const requestRpc = async (api, data = null, options = {}) => {
  // export async function requestRpc(api, data = null, options = {}) {
  const store = useAppStore()
  const { netType, url } = store.getNetWorkConfig()
  if (netType === 0) {
    throw 'Not currently supported'
  }
  // console.log('netType, url: ', netType, url)
  const fetchUrl =
    netType !== 0 ? [url, api].join('').replace('//v1/', '/v1/') : ''
  const opts = Object.assign({}, options, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    json: true,
  })
  opts.method = opts.method.toUpperCase()
  if (opts.method != 'GET' && data) {
    opts.body = JSON.stringify(data)
  } else {
    delete opts.body
  }
  console.log('requestRpc: ', fetchUrl, opts)
  return fetch(fetchUrl, opts)
    .then((res) => res.json())
    .then((data) => {
      // const data = await res.json()
      console.log('requestRpc ', new URL(fetchUrl).pathname, ' is res: ', data)
      if (data) {
        if (data.code || data.message) {
          postToast('FetchError: ' + data.message, 'error', 3000)
          hideLoading()
          throw 'FetchError: ' + data.message
        } else {
          return data
        }
      } else {
        throw 'Request failed'
        // return {}
      }
    })
}
// export async function requestRpc
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

export async function ListAssets() {
  return requestRpc('/v1/taproot-assets/assets').then((res) => res.assets)
}
export async function ListAssetsQuery() {
  return requestRpc(
    '/api/query-asset-stats',
    {},
    {
      method: OptionMethod.POST,
    }
  ).then((res) => res.data.asset_stats)
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

export async function QueryAddressList(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  return requestRpc('/api/query-addrs', asset, { method: 'POST' })
    .then((res) => res.data.addrs)
    .catch((e) => [])
}

export async function QueryAssetBalance(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  return requestRpc('/api/get-asset-balance', asset, { method: 'POST' }).then(
    (res) => res.data.assets_balance
  )
}
export async function QueryBtcBalance(data) {
  const asset = Object.assign({}, data)
  if (!asset.wallet_id) {
    throw 'wallet_id is required'
  }
  return requestRpc('/api/get-btc-balance', asset, { method: 'POST' })
    .then((res) => res.data.balance / 10 ** 8)
    .catch((e) => 0)
}

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
    } = res.data
    return {
      amount,
      asset_id: toHex(asset_id),
      encoded,
      // internal_key: toHex(internal_key),
      // proof_courier_addr,
      // script_key: toHex(script_key),
      // taproot_output_key: toHex(taproot_output_key),
    }
  })
}

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
export async function ListAssetHistory(params) {
  const data = Object.assign({}, params)
  if (!data.wallet_id) {
    throw 'wallet_id is required'
  }
  data.occurred_after = data.occurred_after || 0
  return requestRpc('/api/list-asset-history', data, { method: 'POST' })
    .then((res) => res.data.tx_histories)
    .catch((e) => [])
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
  // 替换为你选择的区块链浏览器API的URL
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
  const response = await fetch('https://mempool.space/api/v1/fees/recommended')
  const data = await response.json()
  return data
}
