<script setup lang="ts">

// @ts-ignore
import IconMdiInformationSlabCircleOutline from '~icons/mdi/information-slab-circle-outline';

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
const activeAccount = computed(() => store.getActiveAccount())

</script>

<template>
  <div class="text-center mx-2 flex flex-col gap-y-2">
    <div class="min-box">
      <div v-if="count > 0 && activeAccount && !activeAccount.backup"
        class="flex flex-row justify-between items-center m-2 mt-0 bg-red-100 rounded-2xl px-4 py-[11px] text-red-600">
        <div class="tips flex flex-row items-start justify-start">
          <IconMdiInformationSlabCircleOutline></IconMdiInformationSlabCircleOutline>
          <div class="pl-1">Current Wallet is not backed up</div>
        </div>
        <RouterLink class="no-underline bg-red-500 text-white rounded-full px-3 py-1 text-[14px]" to="/common/backupKey?auth=yes">
          Go
        </RouterLink>
      </div>
      <HomeCenter v-if="count>0"></HomeCenter>
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
