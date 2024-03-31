<script lang="ts">
// @ts-ignore
import IconMdiSettings from '~icons/mdi/settings';
// @ts-ignore
import IconMdiInformationSlabCircleOutline from '~icons/mdi/information-slab-circle-outline';
// @ts-ignore
import IconMdiSuccessCircle from '~icons/mdi/success-circle';

import { useAppStore } from '@/stores/app.store'


import { useRouter } from 'vue-router'


export default {
  components: {
    IconMdiSettings, IconMdiInformationSlabCircleOutline, IconMdiSuccessCircle
  },
  setup: function(){
    const store = useAppStore()
    const router = useRouter()
    const accountCount = computed(() => store.count)
    const goBack = computed(() => store.goBack)
    const goBackUrl = computed(() => store.goBackUrl)
    const goToPrevious = () => {
      console.log('goBackUrl.value: ', goBackUrl.value)
      goBackUrl.value ? router.push(goBackUrl.value) : window.history.go(-1);
    }
    console.log('router.currentRoute.value.fullPath: ', router.currentRoute.value.fullPath)
    const isHome = computed(() => ['/', '/popup'].includes(router.currentRoute.value.fullPath))
    console.log('isHome: ', isHome.value, accountCount.value)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accounts = computed(() => store.accountList)
    // @ts-ignore
    const activeAccount = computed(() => store.activeAccount)
    return {
      accountCount, goBack, goBackUrl, goToPrevious, isHome, accounts, activeAccount, store, router
    }
  },
  data() {
    return {
      toastData: {
        type: 'info',
        text: '',
      },
      title: ''
    }
  },
  methods: {
    _toast(text:string, type = 'info', delay = 3000)  {
      this.toastData.text = text
      this.toastData.type = type
      setTimeout(() => {
        this.toastData.text = ''
        this.toastData.type = 'info'
      }, delay || 3000)
    },
    formatAssets(balance: number, len = 8, symbol = 'BTC' ) {
      return [Number(balance).toFixed(len), symbol].join(' ')
    },
    setTitle(t: string)  {
      console.log('title: ', t)
      this.title = t
    }
  }
}
</script>

<template>
  <header
    v-if="!goBack"
    aria-label="Site Header"
    class="p-2 hd"
  >
    <div class="flex flex-row flex-nowrap justify-between items-center space-x-1">
      <div class="back">BitTap</div>
      <div class="title">
        <AccountList v-if="isHome && accountCount >= 1"></AccountList>
      </div>
      <div class="setting">
        <div v-if="isHome && accountCount >= 1" class="setting">
          <router-link to="/common/setting" class="btn link btn-sm">
            <IconMdiSettings></IconMdiSettings>
          </router-link>
        </div>
      </div>
    </div>
    
  </header>
  <header
    v-else
    aria-label="Site Header"
    class="p-2"
  >
  <div class="flex flex-row flex-nowrap justify-between items-center space-x-1">
    <div class="back">
      <a href="#" @click="goToPrevious" >
        <svg t="1711458825492" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1461" width="20" height="20"><path d="M263.232 576L640 931.84 554.24 1024 0 515.392 549.952 0 640 98.88 270.4 448H1024v128H263.232z" fill="#262626" p-id="1462"></path></svg>
      </a>
    </div>
      <div class="title">
        <div v-if="!isHome && title">{{ title }}</div>
      </div>
      <div class="setting">
        
      </div>
  </div>
    
    
  </header>

  <div class="toast toast-top toast-center" >
    <div v-if="toastData.text" :class="['alert', 'alert-'+toastData.type, 'text-white', 'font-bold', 'rounded-sm', 'shadow-md']">
      <div class="flex flex-row justify-center items-center">
        <IconMdiInformationSlabCircleOutline v-if="toastData.type === 'info'" class="mr-1" />
        <IconMdiSuccessCircle v-if="toastData.type === 'success'" class="mr-1" />
        {{ toastData.text }}
      </div>
    </div>
  </div>
  <RouterView></RouterView>

  <footer
    v-if="accountCount >= 1"
    aria-label="Site Footer"
    class="p-0"
  >
    
  </footer>
  <footer v-else>
      <p class="text-center p-1">Copyright &copy; 2023 Bittap</p>
    </footer>

</template>

<style scoped lang="scss">
  .hd{
    .icon{
      width: 24px;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
    }
  }
</style>
