<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts">
// @ts-ignore
import IconMdiSettings from '@/components/svgIcon/MdiSettingsOutline.vue'
// @ts-ignore
import IconMdiInformationSlabCircleOutline from '@/components/svgIcon/MdiInformationSlabCircleOutline.vue'
// @ts-ignore
import IconMdiSuccessCircle from '@/components/svgIcon/MdiSuccessCircle.vue'
// @ts-ignore
import IconBack from '@/components/svgIcon/IconBack.vue'

import { useAppStore } from '@/stores/app.store'

import {
  hideFullscreen,
  randomInt,
  sendMessage,
  showAddressAndAssetId,
  TestPassword,
} from '@/popup/libs/tools'
import { useRouter } from 'vue-router'

// import { ListAccounts, ImportAccount } from '@/popup/api/btc/blockStream'

interface ConfirmOptions {
  id?: string
  actionCls?: string[]
  cls?: string[]
  showClose?: boolean
}

export default {
  components: {
    IconMdiSettings,
    IconMdiInformationSlabCircleOutline,
    IconMdiSuccessCircle,
    IconBack,
  },
  setup: function () {
    const store = useAppStore()
    const router = useRouter()
    const accountCount = computed(() => store.count)
    const goBack = computed(() => store.goBack)
    const goBackUrl = computed(() => store.goBackUrl)
    const goToPrevious = () => {
      // console.log('goBackUrl.value: ', goBackUrl.value)
      goBackUrl.value ? router.push(goBackUrl.value) : window.history.go(-1)
    }
    console.log('router.currentRoute.value.fullPath: ', router.currentRoute.value.fullPath)
    const isHome = computed(() =>
      ['/', '/popup'].includes(router.currentRoute.value.fullPath)
    )
    const path_css = computed(
      () => 'path' + router.currentRoute.value.fullPath.split('/').join('_')
    )
    // console.log('isHome: ', isHome.value, accountCount.value)

    // @ts-ignore
    // const activeAccount = computed(() => store.activeAccount)
    return {
      accountCount,
      goBack,
      goBackUrl,
      goToPrevious,
      isHome,
      store,
      router,
      path_css,
    }
  },
  data() {
    return {
      fullWhite: true,
      toastData: {
        type: 'info',
        text: '',
      },
      title: '',
      loading: false,
      loadingText: '',
      custom_confirm: {
        id: 'main',
        title: '',
        message: '',
        actions: [],
        actionCls: [],
        cls: [],
        showClose: false,
      },
      btcPrice: 0,
      assets: [],
    }
  },
  async mounted() {
    try {
      await this.initApp()
    } catch (e) {
      // this._toast(e, 'error')
    }

    // console.log('$router.currentRoute: ', this.$router.currentRoute.value.fullPath)
  },
  methods: {
    async initApp() {
      // let sessionPassword: string | null = null
      chrome.storage.session.get(['sessionPassword'], (result) => {
        // Restore the password saved in the message
        if (result.sessionPassword && TestPassword(result.sessionPassword)) {
          // sessionPassword = result.sessionPassword
          // console.log('sessionPassword t: ', sessionPassword)
          hideFullscreen()
        }
      })
      // console.log('sessionPassword: ', sessionPassword)
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
      window.addEventListener(
        'message',
        (event) => {
          const { data } = event
          if (!data) {
            return false
          }
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
          if (data.event === 'hideFullscreen') {
            this.hideFullscreen()
          }
        },
        false
      )
      const channelName = 'bittap.jssdk.event'
      // @ts-ignore
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Home center chrome.runtime.onMessage:', message, sender)
            const { type, event, data } = message
            if(channelName === type){
              // const { type , data, requestId } = data
              console.log('Home center chrome.runtime.onMessage json :', type, event, data)
            }
            sendResponse()
      })
      // console.log('store: ', this.$store)
      // const store = useAppStore()
      // // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const accounts = store.accountList
      // console.log('accounts: ', accounts, accounts.length)
      this.updateGlobalState()
    },
    async updateGlobalState() {
      // @ts-ignore
      this.assets = await this.store.getUserAssetsBalance()
      this.btcPrice = this.store.btcPrice.USD
    },
    hideFullscreen() {
      this.fullWhite = false
    },
    _checkUnlock() {
      if (this.store.phrases.length > 0) {
        // @ts-ignore
        sendMessage('isUnlocked', null).then((res) => {
          hideFullscreen()
          if (!res.status) {
            this.$router.push('/common/unlock')
          }
        })
      }
    },
    formatToken(m: string | number, t: number = 2, symbol: string = '') {
      const n = Number(m) || Number(0)
      return symbol
        ? [n.toFixed(t), symbol.toUpperCase()].join(' ')
        : n.toFixed(t)
    },
    _goToTxhash(hash: string): string {
      if (this.store.getNetWorkConfig().netType === 0) {
        return 'https://mempool.space/tx/' + hash
      } else {
        return 'https://mempool.space/testnet/tx/' + hash
      }
    },
    _toast(text: string, type = 'info', delay = 3000) {
      this.toastData.text = text
      this.toastData.type = type
      setTimeout(() => {
        this.toastData.text = ''
        this.toastData.type = 'info'
      }, delay || 3000)
    },
    _showLoading(text: string = 'loading...') {
      this.loadingText = text
      this.loading = true
    },
    _hideLoading() {
      this.loading = false
    },
    formatAssets(balance: number, len = 8, symbol = 'BTC') {
      return [Number(balance).toFixed(len), symbol.toUpperCase()].join(' ')
    },
    showAssetName(asset_id: string): string {
      return this.store.getAssetsNameForAssetID(asset_id)
    },
    showUsdtBalance(n: number) {
      return Number(this.btcPrice * Number(n))
    },
    showTokenBalance(asset_id: string, n: number) {
      return Number(this.getTokenPrice(asset_id) * Number(n))
    },
    getTokenPrice(asset_id: string): number {
      // TODO:wait for fix
      return asset_id ? 0 : 0
    },
    formatTime(time: number, format: string = 'MM-DD HH:mm:ss'): string {
      return useDateFormat(time, format).value
    },
    _showMinMaxString(
      str: string,
      left: number = 4,
      right: number = 4
    ): string {
      return showAddressAndAssetId(str, left, right)
    },
    setTitle(t: string) {
      console.log('title: ', t)
      this.title = t
    },
    _main_confirm(
      title: string,
      message: string,
      actions = [],
      opts: ConfirmOptions = {
        actionCls: [],
        cls: [],
        showClose: false,
      }
    ) {
      const { id, actionCls, cls, showClose }: ConfirmOptions = Object.assign(
        {},
        {
          actionCls: [],
          cls: [],
          showClose: false,
          id: ['main_confirm', randomInt(1000, 9999)].join('_'),
        },
        opts
      )
      // console.log('ConfirmOptions:', [id, actionCls, cls, showClose])
      this.custom_confirm.id = id
      // @ts-ignore
      this.custom_confirm.actionCls = actionCls
      // @ts-ignore
      this.custom_confirm.cls = cls
      this.custom_confirm.showClose = showClose
      this.custom_confirm.title = title
      this.custom_confirm.message = message
      this.custom_confirm.actions = actions
      this.$nextTick(() => {
        // @ts-ignore
        document.getElementById(this.custom_confirm.id).showModal()
      })
    },
    // @ts-ignore
    actionClick(action) {
      const closeDialog = () => {
        // @ts-ignore
        document.getElementById(this.custom_confirm.id).close()
      }
      const called =
        action.handle && typeof action.handle === 'function'
          ? action.handle

          // eslint-disable-next-line @typescript-eslint/ban-types
          : function (_: any, closeModal: Function) {
              closeModal()
            }

      called(action, closeDialog)
    },
  },
}
</script>

<template>
  <header
    v-if="!goBack"
    aria-label="Header"
    class="hd"
  >
    <div
      v-if="isHome && accountCount >= 1"
      class="flex flex-row flex-nowrap justify-between items-center space-x-1 hds"
    >
      <div class="title">
        <AccountList></AccountList>
      </div>
      <div class="setting">
        <div class="setting">
          <router-link
            to="/common/setting"
            class="btn btn-circle btn-sm bg-gray-100 border-none"
          >
            <IconMdiSettings class="text-gray-600 size-6"></IconMdiSettings>
          </router-link>
        </div>
      </div>
    </div>
  </header>
  <header
    v-else
    aria-label="Header"
    class="p-2"
  >
    <div
      class="flex flex-row flex-nowrap justify-between items-center space-x-1"
    >
      <div class="back">
        <a
          href="#"
          @click="goToPrevious"
        >
          <IconBack />
        </a>
      </div>
      <div class="title font-medium text-lg">
        <div v-if="!isHome && title">{{ title }}</div>
      </div>
      <div class="setting font-normal text-sm">
        <router-link
          v-if="$router.currentRoute.value.fullPath === '/common/mangeAssets'"
          to="/common/importAssets"
        >
          Import
        </router-link>
      </div>
    </div>
  </header>

  <div
    v-if="toastData.text"
    :class="['toast toast-top toast-center', toastData.text ? 'show' : 'hide']"
  >
    <div
      role="alert"
      :class="[
        'alert',
        'alert-' + toastData.type,
        'text-white',
        'font-bold',
        'rounded-2xl',
        'shadow-2xl',
      ]"
    >
      <div class="break-all w-72 whitespace-normal">
        <IconMdiInformationSlabCircleOutline
          v-if="toastData.type === 'info'"
          class="mr-1 size-5"
        />
        <IconMdiSuccessCircle
          v-if="toastData.type === 'success'"
          class="mr-1 size-5"
        />
        <span v-html="toastData.text"></span>
      </div>
    </div>
  </div>
  <div
    v-if="loading"
    class="loading-box"
  >
    <div class="mask"></div>
    <div class="loading-main">
      <div class="loading loading-dots loading-lg"></div>
      <div class="text">{{ loadingText }}</div>
    </div>
  </div>
  <RouterView></RouterView>
  <dialog
    :id="custom_confirm.id"
    :class="['modal', 'rounded-sm'].concat(custom_confirm.cls)"
  >
    <div class="modal-box dialog">
      <form
        v-if="custom_confirm.showClose"
        method="dialog"
      >
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      <h3
        v-if="custom_confirm.title"
        class="font-bold text-lg text-center"
      >
        {{ custom_confirm.title }}
      </h3>
      <div
        class="message"
        v-html="custom_confirm.message"
      ></div>
      <div
        v-if="custom_confirm.actions.length > 0"
        :class="['dialog-actions', custom_confirm.actionCls && custom_confirm.actionCls.length >= 1? '': 'flex-row space-x-2',].concat(custom_confirm.actionCls)"
      >
        <button
          v-for="(action, index) in custom_confirm.actions"
          :key="'abt-' + index"
          :class="['btn', action.cls ? '' : 'btn-outline btn-primary'].concat(action.cls)"
          @click="actionClick(action)"
        >
          {{ action.name }}
        </button>
      </div>
    </div>
  </dialog>
  <div
    role="alert"
    class="alert alert-info alert-success alert-warning alert-error hidden"
  ></div>
</template>

<style scoped lang="scss">
.hd {
  // @apply pt-4 px-4 pb-2;
  height: 66px;
  @apply bg-white;
  .hds {
    @apply w-full pt-4 px-4 pb-2 bg-white;

    position: fixed;
  }
  .icon {
    @apply size-6 text-xs;
  }
}
.loading-box {
  .mask {
    z-index: 9998;
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background: rgba($color: #000000, $alpha: 0.7);
  }
  .loading-main {
    z-index: 9999;
    position: fixed;
    top: 30vh;
    left: 20vw;
    width: 60vw;
    background: rgba($color: #000000, $alpha: 0.3);
    @apply text-primary rounded-lg flex flex-col justify-center items-center py-7 text-lg;
  }
}
.toast {
  margin-top: -100px;
  transition: all 0.3s ease-in-out;
  .mr-1 {
    display: inline;
  }
  &.show {
    margin-top: 10px;
  }
  &.hide {
    transition: all 0.5s ease-out;
  }
}
.dialog {
  @apply w-11/12 rounded-xl bg-white p-4;
  .message {
    @apply flex flex-col flex-nowrap justify-start items-center px-2 py-4 w-full overflow-y-auto overflow-x-hidden text-lg font-normal text-center;
  }
  .dialog-actions {
    @apply flex justify-between items-stretch w-full;
    .btn {
      @apply flex-1;
    }
  }
}
</style>
