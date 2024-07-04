<script lang="ts">
// @ts-ignore
import IconMdiSettings from '~icons/mdi/settings-outline';
// @ts-ignore
import IconMdiInformationSlabCircleOutline from '~icons/mdi/information-slab-circle-outline';
// @ts-ignore
import IconMdiSuccessCircle from '~icons/mdi/success-circle';

import { useAppStore } from '@/stores/app.store'

import { randomInt, sendMessage } from '@/popup/libs/tools';
import { useRouter } from 'vue-router'

// import { ListAccounts, ImportAccount } from '@/popup/api/btc/blockStream'

interface ConfirmOptions { 
  id?: string,
  actionCls?: string[],
  cls?: string[],
  showClose?: boolean,
}

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
      title: '',
      loading: false,
      loadingText: '',
      _confirm: {
        id: 'main',
        title: '',
        message: '',
        actions: [],
        actionCls: [],
        cls: [],
        showClose: false,
      }
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
        
        const { data }= event
        if(!data) {  return false }
        if (data.event === 'toast') {
          console.log('window.addEventListener on message is event: ', event)
          const { text, type, delay } = data.data
          this._toast(text, type, delay)
        }
        if (data.event === 'showLoading') {
          const { text } = data.data
          this._showLoading(text)
        }
        if (data.event === 'hideLoading') {
          this._hideLoading()
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
    _checkUnlock() { 
      if (this.store.phrases.length > 0) {
        // @ts-ignore
        sendMessage('isUnlocked', null).then(res => {
          if (!res.status) {
            this.$router.push('/common/unlock')
          }
        })
      }
    },
    formatToken(m: string | number, t: number = 8, symbol: string = '') {
      const n = Number(m) || Number(0)
      return symbol ? [n.toFixed(t), symbol.toUpperCase()].join(' ') : n.toFixed(t)
    },
    _toast(text:string, type = 'info', delay = 3000)  {
      this.toastData.text = text
      this.toastData.type = type
      setTimeout(() => {
        this.toastData.text = ''
        this.toastData.type = 'info'
      }, delay || 3000)
    },
    _showLoading(text:string = 'loading...' ) { 
      this.loadingText = text 
      this.loading = true
    },
    _hideLoading() { 
      this.loading = false
    },
    formatAssets(balance: number, len = 8, symbol = 'BTC' ) {
      return [Number(balance).toFixed(len), symbol].join(' ')
    },
    setTitle(t: string)  {
      console.log('title: ', t)
      this.title = t
    },
    _main_confirm(title: string, message: string, actions = [], opts: ConfirmOptions = {
      actionCls: [],
      cls: [],
      showClose: false
    }) { 
      const { id, actionCls, cls, showClose }: ConfirmOptions = Object.assign({}, {
        actionCls: [],cls: [],showClose: false, id: ['main_confirm', randomInt(1000,9999)].join('_')
      }, opts)
      this._confirm.id = id
      this._confirm.actionCls = actionCls
      this._confirm.cls = cls
      this._confirm.showClose = showClose
      this._confirm.title = title
      this._confirm.message = message
      this._confirm.actions = actions
      this.$nextTick(() => { 
        document.getElementById(this._confirm.id).showModal()
      })
    },
    // @ts-ignore
    actionClick(action) { 
      const closeDialog = () => { 
        // @ts-ignore
        document.getElementById(this._confirm.id).close()
      }

      const called = action.handle && typeof action.handle === 'function' ? action.handle : function (_:any, closeModal: Function) { 
        closeModal()
      }
      
      called(action, closeDialog)
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
      <div class="break-all w-72 whitespace-normal">
        <IconMdiInformationSlabCircleOutline v-if="toastData.type === 'info'" class="mr-1" />
        <IconMdiSuccessCircle v-if="toastData.type === 'success'" class="mr-1" />
        <span v-html="toastData.text"></span>
      </div>
    </div>
  </div>
  <div class="loading-box" v-if="loading">
    <div class="mask"></div>
    <div class="loading-main">
      <div class="loading loading-dots loading-lg"></div>
      <div class="text">loading...</div>
    </div>
  </div>
  <RouterView></RouterView>
  <dialog :id="_confirm.id" :class="['modal', 'rounded-sm'].concat(_confirm.cls)">
    <div class="modal-box dialog">
        <form v-if="_confirm.showClose" method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 v-if="_confirm.title" class="font-bold text-lg text-center">{{ _confirm.title }}</h3>
        <div class="message" v-html="_confirm.message"></div>
        <div v-if="_confirm.actions.length > 0" :class="['dialog-actions', _confirm.actionCls && _confirm.actionCls.length > 0 ? '' : 'flex-row space-x-2'].concat(_confirm.actionCls)">
          <button :class="['btn', action.cls? '' : 'btn-outline btn-primary'].concat(action.cls)" v-for="action in _confirm.actions" @click="actionClick(action)">{{ action.name }}</button>
        </div>
      </div>
  </dialog>
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
.loading-box{
  .mask {
    z-index: 9998;
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background: rgba($color: #000000, $alpha: .7);
  }
  .loading-main{
    z-index: 9999;
    position: fixed;
    top: 30vh;
    left: 20vw;
    width: 60vw;
    background: rgba($color: #000000, $alpha: .3);
    @apply text-primary rounded-lg flex flex-col justify-center items-center py-7 text-lg;
  }
}
.toast{
  margin-top: -100px;
  transition: all 0.3s ease-in-out;
  .mr-1{
    display: inline;
  }
  &.show{
    margin-top: 10px;
  }
  &.hide{
    transition: all 0.5s ease-out;
  }
}
.dialog {
    @apply w-11/12 rounded-xl bg-white px-4 py-2;
    .message{
        @apply flex flex-col flex-nowrap justify-start items-center p-4 w-full overflow-y-auto overflow-x-hidden text-lg font-light font-sans;
    }
    .dialog-actions {
        @apply flex justify-between items-stretch w-full ;
        .btn{
          @apply flex-1;
        }
    }
}
</style>
