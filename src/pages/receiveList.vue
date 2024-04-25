<template>
  <div class="w-full min-box receive">
    <ReceiveTaprootHistory></ReceiveTaprootHistory>
  </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store'


export default {
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
    }
  },
  created() {
    
    this.initData()
  },
  methods: {
    initData() {
      // @ts-ignore
      this.$root.setTitle('Receive history')
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