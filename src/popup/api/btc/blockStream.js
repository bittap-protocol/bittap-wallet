// import be from '@tevm/blockexplorer'
// import mempoolJS from "@mempool/mempool.js";

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