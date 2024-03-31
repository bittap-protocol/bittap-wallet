<template>
    <div class="w-full min-box p-4">
        Network configuration
        <!-- <div class="w-full flex flex-col justify-center items-center">
            <button class="button" @click="testWasm">
                Test
            </button>
            <div class="res">
                {{ msg }}
            </div>
        </div> -->
    </div>
</template>
  
<script lang="ts">
import { useAppStore } from '@/stores/app.store'
// import * as WasmTest from '@/popup/libs/main.wasm'


// const loadWasmTest = async () => {
//   const wasmModule = await import('@/popup/libs/main.wasm?wasm');
//   return new wasmModule.default(); // 假设这是正确的初始化方法
// };

// import loadWasmTest from '@/popup/libs/main.wasm?init'



export default {
    setup() {
      
      const store = useAppStore()
      // const router = useRouter()
  
      store.setGoBackUrl('')
      store.isGoBack()
      return {
  
      }
    },
    data() {
      return {
        msg: ''
      }
    },
    created() {
      
      this.initData()
    },
    methods: {
      initData() {
        // @ts-ignore
        this.$root.setTitle('Network Configuration')
      },
      async testWasm(){
        // loadWasmTest().then((instance) => {
        //     this.msg = instance.exports.newaddr()
        //     console.log('msg: ', this.msg)
        // })
        // // const w = new WasmTest()
        // @ts-ignore
        this.msg = newaddr('loadWasmTest '+ new Date().toLocaleString())
        console.log('msg: ', this.msg)
      }
    }
}
</script>

<style lang="scss" scoped>

</style>