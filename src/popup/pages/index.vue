<script setup lang="ts">
// @ts-ignore
import myWasmModule from '@/popup/libs/main.wasm?url';

// @ts-ignore
const go = new Go(); // 假设你已经有了 Go 的实例化对象


WebAssembly.instantiateStreaming(fetch(myWasmModule), go.importObject).then(result => {
  go.run(result.instance);
});


import { useAppStore } from '@/stores/app.store'
import { useRouter } from 'vue-router'


const store = useAppStore()

store.notGoBack()
const name = computed(() => store.name)
const count = computed(() => store.count)
console.log('account name: ' + name, ' counts: '+ count.value)
const router = useRouter()

// store.initConfig().then( () => {
  
// })

if(count.value <= 0) {
  router.push('/common/welcome')
}

</script>

<template>
  <div class="text-center m-2 flex flex-col gap-y-2">
    <div class="min-box">
      <div v-if="activeAccount && !activeAccount.backup" class="flex flex-col gap-x-2 justify-center space-y-5 mb-2">
        <RouterLink
          class="underline "
          to="/common/backupKey"
        >
        Backup Account
        </RouterLink>
      </div>
      <HomeCenter></HomeCenter>
    </div>

    

    <div class="join flex justify-center items-center">
      <RouterLink
        class="underline join-item pr-1 hidden"
        to="/common/importAssets"
      >
      Import Assets
      </RouterLink>
      <RouterLink
        class="underline join-item pl-1 "
        to="/common/createAssets"
      >
      Create Assets
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>


.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
