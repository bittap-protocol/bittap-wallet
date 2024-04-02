// import be from '@tevm/blockexplorer'
// import mempoolJS from "@mempool/mempool.js";

// @ts-ignore
import { useAppStore } from '@/stores/app.store'

import { postToast } from '../../libs/tools.ts'


const requestRpc = async (api, data = null, options = {}) => {
// export async function requestRpc(api, data = null, options = {}) {
  const store = useAppStore()
  const { netType, url, token } = store.getNetWorkConfig()
  if(netType === 0) {
    throw 'Not currently supported'
  }
  console.log('netType, url, token: ', netType, url, token)
  const fetchUrl = netType === 1 ? [url, api].join('').replace('//v1/','/v1/') : ''
  const opts = Object.assign({}, options, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      'Grpc-Metadata-macaroon': token,
    },
    json: true
  })
  opts.method = opts.method.toUpperCase()
  if(opts.method!= 'GET' && data) {
    opts.body = JSON.stringify(data)
  }else{
    delete opts.body
  }
  console.log('requestRpc: ', fetchUrl, opts)
  return fetch(fetchUrl, opts).then(async(res) => {
    const data = await res.json()
    console.log('res: ', data)
    if(data) {
      if(data.code || data.message) {
        postToast('FetchError: '+data.message)
        throw 'FetchError: '+data.message
      }else{
        return data
      }
    }else{
      return {}
    }
  });
}
// export async function requestRpc

export async function ListAssets() {
  return requestRpc('/v1/taproot-assets/assets').then(res => res.assets)
}
export async function MintAssets(data) {
  const asset = Object.assign({
    "asset_version": "ASSET_VERSION_V0",
    "asset_type": "NORMAL",
    "new_grouped_asset": false,
    "grouped_asset": false,
    "group_key": "",
    "group_anchor": ""
    }, data)
  if(!asset.name) {
    throw 'name is required'
  }
  if(!asset.amount || Number(asset.amount) <= 0) {
    throw 'amount is required'
  }

  // asset_meta = { data:'', type: 'META_TYPE_OPAQUE/META_TYPE_JSON', meta_hash: '' }
  return requestRpc('/v1/taproot-assets/assets', { asset, short_response: false }, { method: 'POST' }).then(res => res.pending_batch)
}
export async function NewAddressAssets(data) {
  const asset = Object.assign({
    "asset_version": "ASSET_VERSION_V0",
    }, data)
  if(!asset.asset_id) {
    throw 'asset_id is required'
  }
  if(!asset.amt || Number(asset.amt) <= 0) {
    throw 'amt is required'
  }

  // asset_meta = { data:'', type: 'META_TYPE_OPAQUE/META_TYPE_JSON', meta_hash: '' }
  return requestRpc('/v1/taproot-assets/addrs', asset, { method: 'POST' })
}
export async function SendAssets(data) {
  const asset = Object.assign({
    
    }, data)
  if(!asset.tap_addrs) {
    throw 'tap_addrs is required'
  }
  if(!asset.fee_rate || Number(asset.fee_rate) <= 0) {
    throw 'fee_rate is required'
  }
  return requestRpc('/v1/taproot-assets/send', asset, { method: 'POST' })
}
export async function DecodeAssetsAddress(data) {
  const asset = Object.assign({
    
    }, data)
  if(!asset.addr) {
    throw 'addr is required'
  }
  return requestRpc('/v1/taproot-assets/addrs/decode', asset, { method: 'POST' })
}

/**
 * @param { Object } request
 * @example name, extended_public_key, master_key_fingerprint
 */
export async function ImportAccount(params) {
  const { name, extended_public_key, master_key_fingerprint } = params
  return requestRpc('/v2/wallet/accounts/import', { 
    name, // <string> 
    extended_public_key, // <string> 
    master_key_fingerprint, // <bytes> (base64 encoded)
    address_type: 'TAPROOT_PUBKEY', // <AddressType> 
    dry_run: true, // <bool> 
   }, { method: 'POST' })
}



export async function AssetsFinalize() {
  return requestRpc('/v1/taproot-assets/assets/mint/finalize', { short_response: true, "fee_rate": 1000 }, { method: 'POST' })
}


export async function ListTransfers() {
  return requestRpc('/v1/taproot-assets/assets/transfers').then(res => res.transfers)
}
export async function ListAccounts() {
  return requestRpc('/v2/wallet/accounts').then(res => res.accounts)
}




export async function getBalance(p2trAddress) {
  // 替换为你选择的区块链浏览器API的URL
  const apiUrl = `https://blockchain.info/q/addressbalance/${p2trAddress}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching balance: ${response.statusText}`);
    }
    const balanceInSatoshis = await response.text();
    const balanceInBTC = Number(balanceInSatoshis) / 1e8;
    return balanceInBTC;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return 0;
  }
}

export async function getBTCUSDTPrice() {
  const response = await fetch("https://api.huobi.com/market/detail/merged?symbol=btcusdt");
  const data = await response.json();
  return data.tick.bid[0] || data.tick.close;
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
  const response = await fetch("https://mempool.space/api/v1/prices");
  const data = await response.json();
  return data;
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
  const response = await fetch("https://mempool.space/api/v1/validate-address/"+p2trAddress);
  const data = await response.json();
  return data;
}

// get current gas price
export async function getGas() {
  
  const response = await fetch("https://mempool.space/api/v1/fees/recommended");
  const data = await response.json();
  return data;
}

  // /**
  //  * get address information
  //  * @param {string} address 
  //  * @returns 
  //  */
  // export async function getAddressInfo(p2trAddress) {
  //   const { bitcoin: { addresses } } = mempoolJS({
  //     hostname: 'mempool.space'
  //   });
  
  //   const address = '1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv';
  //   const myAddress = await addresses.getAddress({ address:p2trAddress });
  //   // myAddress result:
  //   // {
  //   //   address: "1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv",
  //   //   chain_stats: {
  //   //     funded_txo_count: 5,
  //   //     funded_txo_sum: 15007599040,
  //   //     spent_txo_count: 5,
  //   //     spent_txo_sum: 15007599040,
  //   //     tx_count: 7
  //   //   },
  //   //   mempool_stats: {
  //   //     funded_txo_count: 0,
  //   //     funded_txo_sum: 0,
  //   //     spent_txo_count: 0,
  //   //     spent_txo_sum: 0,
  //   //     tx_count: 0
  //   //   }
  //   // }
  //   return myAddress
  // }

  // /**
  //  * Get unconfirmed transaction history
  //  * @param {*} address 
  //  */
  // export async function getAddressTxsMempool(p2trAddress) {
  //   const { bitcoin: { addresses } } = mempoolJS({
  //     hostname: 'mempool.space'
  //   });
  //   const addressTxsMempool = await addresses.getAddressTxsMempool({ address:p2trAddress });
  //   return addressTxsMempool
  // }