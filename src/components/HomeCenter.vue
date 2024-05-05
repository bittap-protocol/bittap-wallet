<template>
  <div class="home">
    <div class="top">
      <div class="w-full border-0 rounded-md bg-gray-200 flex flex-col justify-between items-center py-2 px-2">
        <div class="address flex flex-row justify-between items-center space-x-2 w-full">
          <div class="label">
            {{ showAddress(account.address) }}
          </div>
          <div class="copy">
            <button class="link" @click="copyAddress(account.address)">
              <IconMdiContentCopy></IconMdiContentCopy>
            </button>
          </div>
        </div>
        <div class="assets flex flex-row justify-between items-center space-x-2 w-full mt-2">
          <div class="btc">
            {{ $root.formatAssets(accountInfo.balance) }}
          </div>
          <div class="usdt">
            {{ $root.formatAssets(usdtBalance, 4, 'USDT') }}
          </div>
        </div>
      </div>
      <div class="w-full my-3 flex flex-row justify-between items-center space-x-2">
        <router-link to="/common/send" class="button">Send</router-link>
        <router-link to="/common/receive" class="button">Receive</router-link>
      </div>
    </div>
    <div class="body">
      <div class="home-tab">
        <div class="tabs-container">
          <button v-for="tab in tabs" :key="'tab-'+tab.value"
            :class="['tab-btn', activeTab === tab.value ? 'active' : '']" @click.prevent="activeTab = tab.value">
            {{ tab.label }}
          </button>
        </div>
        <div class="contents">
          <div v-if="activeTab === 'token'" class="content-tab">
            <template v-if="assets.length > 0">
              <div v-for="ass in assets" :key="ass.asset_id"
                class="w-full my-2 flex flex-row justify-between items-center border-b border-gray-200 border-solid py-3 mb-2">
                <div class="font-bold name pl-2">{{ ass.name }}</div>
                <div class="balance pr-2">Balance: {{ $root.formatToken(ass.amount) }}</div>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col h-20 p-20">
                <div class="alert text-center">
                  No data
                </div>
              </div>
            </template>
          </div>
          <!-- <div v-if="activeTab === 'nft'" class="content-tab">
            Tab content 2
          </div> -->
          <div v-if="activeTab === 'history'" class="content-tab">

            <template v-if="transfers.length > 0">
              <div v-for="tr in transfers" :key="tr.anchor_tx_hash"
                class="w-full my-2 flex flex-col justify-between items-start rounded-md shadow-md shadow-gray-300  p-2 border border-gray-200 border-solid py-3 mb-4">
                <div class="font-bold name break-all">Hash: {{ tr.anchor_tx_hash }}</div>
                <div class="balance flex flex-row flex-nowrap justify-between items-center">
                  <div>Time: {{ new Date(tr.transfer_timestamp * 1000).toLocaleString() }}</div>
                  <div class="text-right pl-2">Fees: {{ tr.anchor_tx_chain_fees }}</div>
                </div>
                <div class="font-bold inputs" v-for="row in tr.inputs" :key="row.anchor_point">
                  <div class="info">
                    <div class="label">Assets: </div>
                    <div class="value">{{ $root.formatToken(row.amount, 8, showAssetName(row.asset_id)) }}</div>
                    <div class="label">Script_key: </div>
                    <div class="value  break-all">{{ row.script_key }}</div>
                  </div>
                </div>
                <div class="font-bold outputs" v-for="row in tr.outputs" :key="row.script_key">
                  <div class="info">
                    <div class="label">Assets amount: </div>
                    <div class="value">{{ $root.formatToken(row.amount) }}</div>
                    <div class="label">Script_key: </div>
                    <div class="value  break-all">{{ row.script_key }}</div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col h-20 p-20">
                <div class="alert text-center">
                  No data
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconMdiContentCopy from '~icons/mdi/content-copy';


import { useAppStore } from '@/stores/app.store'
// @ts-ignore
// import { getBalance, getBTCUSDTPrice } from '@/popup/api/btc/blockStream'


// import { ListAccounts, ImportAccount } from '@/popup/api/btc/blockStream'



export default {
  components: {
    IconMdiContentCopy
  },
  setup: function() {
    const store = useAppStore()
    // @ts-ignore
    const account = computed(() => store.getActiveAccount())

    // console.log('account: ', account)
    const showAddress = (address:string) => {
        return address?[address.substring(0, 12), address.substring(address.length-12)].join('...') : ''
    }
    const tabs = reactive([
      { label: 'Token', value: 'token' },
      // { label: 'NFT', value: 'nft' },
      { label: 'History', value: 'history' },
    ])
    return {
      account, tabs, showAddress, store
    }
  },
  data() {
    // const store = useAppStore()
    return {
      btcPrice: 0,
      accountInfo: {
        balance: 0,
      },
      assets: [],
      transfers: [],
      activeTab: 'token',
    }
  },
  computed: {
    usdtBalance() {
      return this.btcPrice * this.accountInfo.balance
    },
    activeAccountIndex() {
      const store = useAppStore()
      return store.activeAccount
    }
  },
  // computed(() => store.getActiveAccount())

  watch: {
    'activeAccountIndex': function(k, v) {
      if(k>= 0 && k!=v) {
        this.initAccount()
      }
    },
    activeTab: function (k, v) { 
      if (k != v) { 
        this.updateCurrentData()
      }
    }
  },
  mounted(){
    // this.store = useAppStore()
    setTimeout(() => {
      this.initAccount()
    }, 1000)
  },
  methods: {
    showAssetName(asset_id: string): string { 
      const tokenInfo = this.assets.find(x => x.asset_id === asset_id)
      return tokenInfo ? tokenInfo.name : 'Unknown asset'
    },
    initAccount() {
      const store = useAppStore()
      if(store.activeAccount < 0) {
        return 
      }
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // this.accountInfo.balance = await getBalance(this.account.address)
      // this.btcPrice = await getBTCUSDTPrice()
      store.updateAssets().then(() => {
        return store.updateListTransfers()
      }).then(() => {
        this.updateCurrentData()
        // subscribe all encoded
        store.initConfig()
        store.subscribeReceiveAllEncoded()
        this.listenReceiveAllMessage()
      })
    },
    async updateCurrentData() { 
      const store = useAppStore()
      if (store.activeAccount < 0) {
        return
      }
      this.assets = store.getAssetsBalances()
      this.transfers = store.getTransferListForCurrent()
    },
    listenReceiveAllMessage() {
      const store = useAppStore()
      const self = this
      chrome.runtime.onConnect.addListener(async () => {
        console.log('chrome.runtime.onConnect==popup: ', new Date().toLocaleString());
      })
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Message received ==popup', message, sender, sendResponse)
        switch (message.type) {
          case 'ws.message':
            
            const result = message.data.result
            const { status } = result
            console.log('ws.message received: ', message, result, status)
            // transfer asset is finished  "ADDR_EVENT_STATUS_COMPLETED"
            if (status === 'ADDR_EVENT_STATUS_COMPLETED') {
              self.$root._toast('Transaction completed', 'success')
              store.updateAssets().then(() => { 
                this.assets = store.getAssetsBalances()
              });
              store.updateListTransfers().then(() => { 
                this.transfers = store.getTransferListForCurrent()
              })
            }
            break
          default:

            break
        }
        sendResponse()
      })
    },
    /* eslint-disable array-callback-return */
    async copyAddress(address: string) {
      await navigator.clipboard.writeText(address)
      // console.log('Copy successfully.')
      // @ts-ignore
      this.$root._toast('Copy successfully.', 'success')
    }
  }
}



</script>

<style lang="scss" scoped>
.home{
  @apply border-0 px-3;
  .home-tab{
    @apply py-3 my-4 border-t-2 border-solid border-gray-200 w-full;
    border-top-width: 1px;
    .tabs-container{
      @apply flex flex-row flex-nowrap justify-between items-center space-x-2 mb-3;
      .tab-btn{
        @apply rounded-full btn-sm w-1/2;
        &.active{
          @apply bg-blue-500 text-white;
        }
      }
      
    }
    .contents{
      @apply p-10 mx-4;
      .content-tab{
       
        .inputs,.outputs {
          @apply border border-solid border-pink-400 rounded mb-1;

          .info {
            @apply flex flex-wrap justify-between items-center;
            .label{
              width: 40%;
            }
            .value {
              width: 60%;
              @apply text-left;
            }
          }
        }
        .inputs {
          @apply border-sky-500;
        }
      }
      
    }

  }
}
</style>