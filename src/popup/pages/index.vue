<script setup lang="ts">


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
  <div class="text-center m-2 flex flex-col gap-y-2">
    <div class="min-box">
      <div v-if="count > 0 && activeAccount" class="flex flex-col gap-x-2 justify-center space-y-5 ">
        <RouterLink
          v-if="!activeAccount.backup"
          class="underline mb-2"
          to="/common/backupKey"
        >
        Backup Account
        </RouterLink>
      </div>
      <HomeCenter v-if="count>0"></HomeCenter>
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
