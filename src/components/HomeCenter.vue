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
          <button v-for="tab in tabs" :key="'tab-'+tab.value" :class="['tab-btn', activeTab === tab.value ? 'active' : '']" @click.prevent="activeTab = tab.value">
            {{ tab.label }}
          </button>
        </div>
        <div class="contents">
          <div v-if="activeTab === 'token'" class="content-tab">
            <template v-if="assets.length > 0">
              <div v-for="ass in assets" :key="ass.asset_genesis.asset_id" class="w-full my-2 flex flex-row justify-between items-center border-b border-gray-200 border-solid py-3 mb-2">
                <div class="font-bold name pl-2">{{ ass.asset_genesis.name }}</div>
                <div class="balance pr-2">Balance: {{ ass.amount }}</div>
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
              <div v-for="tr in transfers" :key="tr.anchor_tx_hash" class="w-full my-2 flex flex-col justify-between items-start rounded-md shadow-md shadow-gray-300  p-2 border border-gray-200 border-solid py-3 mb-4">
                <div class="font-bold name break-all">Hash: {{ tr.anchor_tx_hash }}</div>
                <div class="balance">Time: {{ new Date(tr.transfer_timestamp * 1000).toLocaleString() }}</div>
                <div class="font-bold name">Fees: {{ tr.anchor_tx_chain_fees }}</div>
                <div class="font-bold balance">Height: {{ tr.anchor_tx_height_hint }}</div>
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
    const activeTab = ref('token')
    return {
      account, tabs, showAddress, activeTab, store
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
    }
  },
  mounted(){
    // this.store = useAppStore()
    setTimeout(() => {
      this.initAccount()
    }, 1000)
  },
  methods: {
    initAccount() {
      const store = useAppStore()
      if(store.activeAccount < 0) {
        return 
      }
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // this.accountInfo.balance = await getBalance(this.account.address)
      // this.btcPrice = await getBTCUSDTPrice()
      store.updateAssets().then(()=> {
        return store.updateListTransfers()
      }).then(() => {
        this.assets = store.getAssetsList()
        this.transfers = store.getTransferList()
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
    }

  }
}
</style>