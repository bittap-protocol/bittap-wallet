<template>
  <div class="w-full min-box send">
    <div class="home-tab">
      <div class="tabs-container">
        <button v-for="tab in tabs" :key="'tab-'+tab.value" :class="['tab-btn', activeTab === tab.value ? 'active' : '']" @click.prevent="activeTab = tab.value">
          {{ tab.label }}
        </button>
      </div>
      <div class="contents">
        <div v-show="activeTab === 'btc'" class="content-tab" >
          <SendBtc></SendBtc>
        </div>
        <div v-show="activeTab === 'taproot'" class="content-tab" >
          <SendTaproot></SendTaproot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store'
// import sendBtc from './sendBtc.vue'


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
      activeTab: 'btc',
      tabs:[
        { label: 'Send BTC', value: 'btc' },
        { label: 'Send Taproot Assets', value: 'taproot' },
      ]
    }
  },
  created() {
    
    this.initData()
  },
  methods: {
    initData() {
      // @ts-ignore
      this.$root.setTitle('Send')
    }
  }
}


</script>

<style lang="scss" scoped>
.send{
  @apply px-3;
  .home-tab{
    @apply py-2 my-2 w-full border-none;
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
      @apply p-10 mx-4;
    }

  }
}
</style>