<template>
  <div class="home">
    <div class="top">
      <div class="w-full border-0 rounded-sm bg-gray-200 flex flex-col justify-between items-center py-2 px-2">
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
            Tab content 1
          </div>
          <!-- <div v-if="activeTab === 'nft'" class="content-tab">
            Tab content 2
          </div> -->
          <div v-if="activeTab === 'history'" class="content-tab">
            Tab content 3
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
import { getBalance, getBTCUSDTPrice } from '@/popup/api/btc/blockStream'




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
  created(){
    // this.store = useAppStore()
    setTimeout(() => {
      this.initAccount()
    }, 1000)
  },
  methods: {
    async initAccount() {
      const store = useAppStore()
      if(store.activeAccount < 0) {
        return 
      }
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.accountInfo.balance = await getBalance(this.account.address)
      this.btcPrice = await getBTCUSDTPrice()
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