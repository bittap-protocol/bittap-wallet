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
  <div class="text-center mx-0 flex flex-col gap-y-2">
    <div class="min-box">
      <div v-if="count > 0 && activeAccount && !activeAccount.backup"
        class="flex flex-row justify-between items-center m-2 mt-0 bg-red-100 rounded-2xl px-[12px] pr-[7px] py-[8px] mx-4 text-red-600">
        <div class="tips flex flex-row items-center justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g clip-path="url(#clip0_1_2259)">
              <path d="M7.99998 14.6663C9.84091 14.6663 11.5076 13.9201 12.714 12.7137C13.9204 11.5073 14.6666 9.84061 14.6666 7.99967C14.6666 6.15874 13.9204 4.49207 12.714 3.28563C11.5076 2.0792 9.84091 1.33301 7.99998 1.33301C6.15905 1.33301 4.49238 2.0792 3.28593 3.28563C2.07951 4.49207 1.33331 6.15874 1.33331 7.99967C1.33331 9.84061 2.07951 11.5073 3.28593 12.7137C4.49238 13.9201 6.15905 14.6663 7.99998 14.6663Z" stroke="#F23A3A" stroke-width="1.33333" stroke-linejoin="round"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00002 12.3337C8.46025 12.3337 8.83335 11.9606 8.83335 11.5003C8.83335 11.0401 8.46025 10.667 8.00002 10.667C7.53979 10.667 7.16669 11.0401 7.16669 11.5003C7.16669 11.9606 7.53979 12.3337 8.00002 12.3337Z" fill="#F23A3A"/>
              <path d="M8 4V9.33333" stroke="#F23A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_1_2259">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <div class="text-sm font-normal text-left pl-1">Current Wallet is not backd up</div>
        </div>
        <RouterLink class="no-underline bg-red-500 text-white rounded-full px-[15px] py-[3px] text-[14px] font-normal" to="/common/backupKey?auth=yes">
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
