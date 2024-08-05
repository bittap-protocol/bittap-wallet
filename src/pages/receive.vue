<template>
  <div class="w-full min-box receive">
    <div class="home-tab">
      <div class="tabs-container">
        <button v-for="tab in tabs" :key="'receive-tab-'+tab.value" :class="['tab-btn', activeTab === tab.value ? 'active' : '']" @click.prevent="activeTab = tab.value">
          {{ tab.label }}
        </button>
      </div>
      <div class="contents">
        <div v-show="activeTab === 'receiveBtc'" class="content-tab" >
          <ReceiveBtc></ReceiveBtc>
        </div>
        <div v-show="activeTab === 'receiveTaproot'" class="content-tab" >
          <ReceiveTaproot></ReceiveTaproot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store'


export default {
  // components: { sendBtc },
  // components: {
  //   SendBtc,
  //   SendTaproot,
  // },
  setup() {
    
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('/')
    store.isGoBack()
    return {
      store
    }
  },
  data() {
    return {
      activeTab: 'receiveBtc',
      tabs:[
        { label: 'BTC Assets', value: 'receiveBtc' },
        { label: 'Taproot Assets', value: 'receiveTaproot' },
      ]
    }
  },
  created() {
    
    this.initData()
  },
  methods: {
    initData() {
      // @ts-ignore
      this.$root.setTitle('Receive')
      const { backup } = this.store.getActiveAccount()
      if (!backup) {
        // @ts-ignore
        this.$root._toast('Please Backup Your Mnemonic Phrase First', 'warning', 2000)
        this.$router.push('/common/backupKey?auth=yes')
        
      }
    }
  }
}


</script>

<style lang="scss" scoped>
.receive{
  @apply px-0;
  .home-tab{
    @apply py-1 my-2 w-full border-none;
    border-top-width: 1px;
    .tabs-container {
        @apply flex flex-row flex-nowrap justify-between items-center space-x-2 mb-3 border-b border-solid border-gray-200;
    
        .tab-btn {
          @apply btn-sm w-1/2 border-b-2 border-solid rounded-none border-transparent;
    
          &.active {
            @apply text-primary border-primary;
          }
        }
    
      }
    .contents{
      
    }

  }
}
</style>