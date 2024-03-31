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

    }
  },
  data() {
    return {
      activeTab: 'receiveBtc',
      tabs:[
        { label: 'Receive BTC', value: 'receiveBtc' },
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
    }
  }
}


</script>

<style lang="scss" scoped>
.receive{
  @apply px-3;
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