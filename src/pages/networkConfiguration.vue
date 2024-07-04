<template>
    <div class="w-full min-box p-4 nt">
        <div class="w-full flex flex-col justify-start items-center">
          <div class="item">
            <label>
              <input v-model="networkType" type="radio" name="networkType" value="0" />
              Main
            </label>
            <label class="pl-4">
              <input v-model="networkType" type="radio" name="networkType" value="1" />
              Testnet
            </label>
          </div>
          <div v-show="Number(networkType) == 1" class="item">
            <label class="lb">
              <span class="t">Custom RPC Url:</span>
              <input v-model="url" type="url" class="field" />
            </label>
          </div>
          <!-- <div v-show="Number(networkType) == 1" class="item">
            <label class="lb">
              <span class="t">RPC Token:</span>
              <input v-model="token" type="text" class="field" />
            </label>
          </div> -->
          <div class="item">
            <button class="button" @click="changeConfig">Change network configuration</button>
          </div>
        </div>
    </div>
</template>
  
<script lang="ts">
// @ts-ignore
import { useAppStore } from '@/stores/app.store'

// @ts-ignore
import { TestUrl } from '@/popup/libs/tools'

// import * as WasmTest from '@/popup/libs/main.wasm'


// const loadWasmTest = async () => {
//   const wasmModule = await import('@/popup/libs/main.wasm?wasm');
//   return new wasmModule.default(); // 假设这是正确的初始化方法
// };

// import loadWasmTest from '@/popup/libs/main.wasm?init'

const store = useAppStore()

export default {
    // setup() {
      
    //   // const store = useAppStore()
    //   // const router = useRouter()
  
    //   store.setGoBackUrl('')
    //   store.isGoBack()
    //   return {
  
    //   }
    // },
    data() {
      return {
        msg: '',
        networkType: 0,
        url: '',
        token: '',
      }
    },
    created() {
      this.initData()
    },
    methods: {
      initData() {
        store.setGoBackUrl('')
        store.isGoBack()
        // @ts-ignore
        this.$root.setTitle('Network Configuration')
        this.refreshConfig()
      },
      refreshConfig(){
        const { netType, url, token } = store.getNetWorkConfig()
        this.networkType = netType
        // @ts-ignore
        this.url = url
        // @ts-ignore
        this.token = token
      },
      changeConfig(){
        try {
          // @ts-ignore
          if (this.networkType === 0) {
            // @ts-ignore
            this.url = ''
            // @ts-ignore
            this.token = ''
            // @ts-ignore
            this.$root._toast('Currently, the mainnet is not supported', 'error')
            return 
          }else {
            if(!TestUrl(this.url)) {
              throw 'Url invalid'
            }
            // if(this.token === '' || this.token.length < 32) {
            //   throw 'Token invalid'
            // }
          }
          store.changeNetWork(Number(this.networkType), this.url, this.token)
          // @ts-ignore
          this.$root._toast('The network is configured successfully.', 'success')
          this.refreshConfig()
        }catch(e) {
          console.error('on error: ' + e)
          // @ts-ignore
          this.$root._toast(e+'', 'error')
        }
      }
    }
}
</script>

<style lang="scss" scoped>
.nt{
  .item{
    @apply w-full mb-4;
    .label {
      @apply w-full flex flex-row justify-between items-center space-x-1;
    }
  }
}
</style>