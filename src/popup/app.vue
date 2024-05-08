<script lang="ts">
// @ts-ignore
import IconMdiSettings from '~icons/mdi/settings-outline';
// @ts-ignore
import IconMdiInformationSlabCircleOutline from '~icons/mdi/information-slab-circle-outline';
// @ts-ignore
import IconMdiSuccessCircle from '~icons/mdi/success-circle';

import { useAppStore } from '@/stores/app.store'


import { useRouter } from 'vue-router'

// import { ListAccounts, ImportAccount } from '@/popup/api/btc/blockStream'


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
    const path_css = computed(() =>'path'+router.currentRoute.value.fullPath.split('/').join('_'))
    console.log('isHome: ', isHome.value, accountCount.value)

   
    
    // @ts-ignore
    // const activeAccount = computed(() => store.activeAccount)
    return {
      accountCount, goBack, goBackUrl, goToPrevious, isHome, store, router, path_css
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
  async mounted(){
    try {
      await this.initApp()
    }catch (e) {
      // this._toast(e, 'error')
    }
  },
  methods: {
    async initApp(){
      // @ts-ignore
      // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      //   // 2. A page requested user data, respond with a copy of `user`
      //   console.log('chrome.runtime.onMessage:', message)
      //   const data = message && JSON.parse(message)
      //   if (data.event === 'toast') {
      //     this._toast(data.text, data.type, data.delay)
      //   }
      //   sendResponse({ result: true })
      // });
      window.addEventListener("message", (event) =>  {
        console.log('event: ', event)
        const { data }= event
        if(!data) {  return false }
        if (data.event === 'toast') {
          const { text, type, delay } = data.data
          this._toast(text, type, delay)
        }
      }, false);
      // console.log('store: ', this.$store)
      const store = useAppStore()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const accounts = store.accountList
      console.log('accounts: ', accounts, accounts.length)
      // @ts-ignore
      if(accounts.length > 0) {
        //
      }
      
    },
    formatToken(m: string | number, t: number = 8, symbol: string = '') {
      const n = Number(m) || Number(0)
      return symbol ? [n.toFixed(t), symbol].join(' ') : n.toFixed(t)
    },
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
  <header v-if="!goBack" aria-label="Header" class="hd">
    <div v-if="isHome && accountCount >= 1"
      class="flex flex-row flex-nowrap justify-between items-center space-x-1 hds">
      <div class="title">
        <AccountList></AccountList>
      </div>
      <div class="setting">
        <div class="setting">
          <router-link to="/common/setting" class="btn btn-circle btn-sm bg-gray-100 border-none">
            <IconMdiSettings class=" text-gray-600"></IconMdiSettings>
          </router-link>
        </div>
      </div>
    </div>

  </header>
  <header v-else aria-label="Header" class="p-2">
    <div class="flex flex-row flex-nowrap justify-between items-center space-x-1">
      <div class="back">
        <a href="#" @click="goToPrevious">
          <svg t="1711458825492" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="1461" width="20" height="20">
            <path d="M263.232 576L640 931.84 554.24 1024 0 515.392 549.952 0 640 98.88 270.4 448H1024v128H263.232z"
              fill="#262626" p-id="1462"></path>
          </svg>
        </a>
      </div>
      <div class="title">
        <div v-if="!isHome && title">{{ title }}</div>
      </div>
      <div class="setting">

      </div>
    </div>
  </header>

  <div v-if="toastData.text" :class="['toast toast-top toast-center', toastData.text? 'show': 'hide']">
    <div :class="['alert', 'alert-'+toastData.type, 'text-white', 'font-bold', 'rounded-md', 'shadow-md']">
      <div class="flex flex-row justify-center items-center break-all w-72" style="word-break: break-all;">
        <IconMdiInformationSlabCircleOutline v-if="toastData.type === 'info'" class="mr-1" />
        <IconMdiSuccessCircle v-if="toastData.type === 'success'" class="mr-1" />
        {{ toastData.text }}
      </div>
    </div>
  </div>
  <RouterView></RouterView>

  <!-- <footer v-if="accountCount >= 1" aria-label="Site Footer" class="p-0">

  </footer>
  <footer v-else>
    <p class="text-center p-1">Copyright &copy; 2023 Bittap</p>
  </footer> -->

</template>

<style scoped lang="scss">
.hd{
  // @apply pt-4 px-4 pb-2;
  height: 55px;
  .hds{
    @apply w-full pt-4 px-4 pb-2 bg-white;
    
    position: fixed;
  }
  .icon{
    @apply size-6 text-xs;
  }
}
.toast{
  margin-top: -100px;
  transition: all 0.3s ease-in-out;
  &.show{
    margin-top: 10px;
  }
  &.hide{
    transition: all 0.5s ease-out;
  }
}
</style>
