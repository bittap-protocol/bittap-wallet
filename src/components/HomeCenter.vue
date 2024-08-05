<template>
  <div class="home">
    <div
      class="fullWhite"
      v-if="$root.fullWhite"
    ></div>
    <div class="top">
      <div class="account">
        <div class="assets">
          <div class="btc">
            {{ $root.formatAssets(accountInfo.balance, 6, 'BTC') }}
          </div>
          <div class="usdt">≈${{ $root.formatAssets(usdtBalance, 2, '') }}</div>
        </div>
        <div class="address">
          <div class="label">
            {{ showAddress(account.btcAddress) }}
          </div>
          <div class="copy">
            <button
              class="link"
              @click="copyAddress(account.btcAddress)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.40077 2.60309C5.25832 2.60309 5.14284 2.71858 5.14284 2.86103V4.32741C5.14284 4.67807 4.85857 4.96233 4.50792 4.96233C4.15726 4.96233 3.873 4.67807 3.873 4.32741V2.86103C3.873 2.01726 4.55701 1.33325 5.40077 1.33325H13.1389C13.9826 1.33325 14.6666 2.01726 14.6666 2.86103V10.5991C14.6666 11.4429 13.9826 12.1269 13.1389 12.1269H11.6559C11.3053 12.1269 11.021 11.8426 11.021 11.492C11.021 11.1413 11.3053 10.8571 11.6559 10.8571H13.1389C13.2813 10.8571 13.3968 10.7416 13.3968 10.5991V2.86103C13.3968 2.71858 13.2813 2.60309 13.1389 2.60309H5.40077Z"
                  fill="white"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.33331 5.40071C1.33331 4.55694 2.01732 3.87293 2.86109 3.87293H10.5992C11.443 3.87293 12.127 4.55694 12.127 5.40071V13.1388C12.127 13.9826 11.443 14.6666 10.5992 14.6666H2.86109C2.01732 14.6666 1.33331 13.9826 1.33331 13.1388V5.40071ZM2.86109 5.14278C2.71864 5.14278 2.60315 5.25826 2.60315 5.40071V13.1388C2.60315 13.2813 2.71864 13.3967 2.86109 13.3967H10.5992C10.7416 13.3967 10.8571 13.2813 10.8571 13.1388V5.40071C10.8571 5.25826 10.7416 5.14278 10.5992 5.14278H2.86109Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="actions">
        <router-link
          to="/common/send"
          class="send"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="28"
              cy="28"
              r="28"
              fill="white"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="url(#paint0_linear_25_6324)"
            />
            <path
              d="M28 19V37"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22 25L28 19L34 25"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <defs>
              <linearGradient
                id="paint0_linear_25_6324"
                x1="28"
                y1="4"
                x2="28.2022"
                y2="51.1467"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  stop-color="#007BFF"
                  stop-opacity="0.7"
                />
                <stop
                  offset="1"
                  stop-color="#8000FF"
                />
              </linearGradient>
            </defs>
          </svg>
          <div class="font-bold">Send</div>
        </router-link>
        <router-link
          to="/common/receive"
          class="receive"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="28"
              cy="28"
              r="28"
              fill="white"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="url(#paint0_linear_25_6316)"
            />
            <path
              d="M28 37V19"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M34 31L28 37L22 31"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <defs>
              <linearGradient
                id="paint0_linear_25_6316"
                x1="28"
                y1="4"
                x2="28.2022"
                y2="51.1467"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  stop-color="#007BFF"
                  stop-opacity="0.7"
                />
                <stop
                  offset="1"
                  stop-color="#8000FF"
                />
              </linearGradient>
            </defs>
          </svg>

          <div class="font-bold">Receive</div>
        </router-link>
      </div>
    </div>
    <div class="body">
      <div class="home-tab">
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="'tab-' + tab.value"
            :class="['tab-btn', activeTab === tab.value ? 'active' : '']"
            @click.prevent="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <div
          v-if="loading"
          class="loading loading-spinner text-primary my-16"
        ></div>
        <div class="contents">
          <div
            v-if="activeTab === 'token'"
            class="content-tab"
          >
            <template v-if="assets.length > 0 && !loading">
              <div
                v-for="ass in assets"
                :key="ass.asset_id"
                class="token-item"
              >
                <div class="iconName">
                  <div class="icon">
                    <div
                      class="icon-img"
                      v-if="ass.asset_id === 'Base'"
                    >
                      <IconMdiBitcoin
                        class="icon-img text-orange-400 h-[36px] w-[36px]"
                      ></IconMdiBitcoin>
                    </div>
                    <div v-else>
                      <!-- <IconMdiBitcoin
                        class="icon-img text-gray-300"
                      ></IconMdiBitcoin> -->
                      <IconAutoTokenName :name="ass.name"></IconAutoTokenName>
                    </div>
                  </div>
                  <div class="names">
                    <div class="name">{{ ass.name }}</div>
                    <div class="des">{{ ass.des || ass.name }}</div>
                  </div>
                </div>
                <div class="balance pr-2">
                  <div class="b">
                    {{
                      $root.formatToken(
                        ass.amount,
                        ass.asset_id === 'Base' ? 6 : 0
                      )
                    }}
                  </div>
                  <div
                    v-if="ass.asset_id === 'Base'"
                    class="u"
                  >≈${{
                      $root.formatToken($root.showUsdtBalance(ass.amount), 2)
                    }}</div>
                  <div
                    v-else
                    class="u"
                  >≈${{
                      $root.formatToken(
                        $root.showTokenBalance(ass.asset_id, ass.amount),
                        2
                      )
                    }}</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div
                v-if="!loading"
                class="flex flex-row justify-center items-center m-5"
              >
                <img
                  src="@/assets/noassets.png"
                  height="110"
                  width="120"
                />
              </div>
            </template>
          </div>
          <!-- <div v-if="activeTab === 'nft'" class="content-tab">
            Tab content 2
          </div> -->
          <div
            v-if="activeTab === 'history'"
            class="content-tab"
          >
            <TransferHistoryLogs
              :loading="loading"
              :logs="historyLogs"
            ></TransferHistoryLogs>
          </div>
        </div>
      </div>

      <div
        class="join flex justify-center items-center fixed z-10 w-full bottom-2 left-0 h-10"
      >
        <RouterLink
          class="no-underline flex flex-row text-center justify-between items-center pr-1 text-primary bg-white rounded-2xl px-4 py-2 pr-4 shadow-xl shadow-gray-200"
          to="/common/mangeAssets"
        >
          <Import class="mr-1"></Import>
          <span>Assets Mange</span>
        </RouterLink>
        <RouterLink
          class="no-underline hidden join-item pl-1 flex flex-row justify-center items-center text-primary"
          to="/common/createAssets"
        >
          <IconMdiAdd></IconMdiAdd>
          Create Assets
        </RouterLink>
      </div>
    </div>
  </div>
  <div :class="['refreshIcon']">
    <button @click="refreshData" class="bg-white">
      <Refresh :class="['icc', refresh ? 'refreshing' : '']"></Refresh>
    </button>
  </div>
</template>

<script lang="ts">
// @ts-ignore
// import IconMdiContentCopy from '~icons/mdi/content-copy';
import IconMdiBitcoin from '~icons/mdi/bitcoin'
// @ts-ignore
import IconMdiAdd from '~icons/mdi/add'

import TransferHistoryLogs from '@/components/TransferHistoryLogs.vue'
// @ts-ignore
import IconAutoTokenName from '@/components/svgIcon/AutoTokenName.vue'
// @ts-ignore
import { TransferRow, useAppStore } from '@/stores/app.store'
// import { sendMessage } from '@/popup/libs/tools';
// @ts-ignore
// import { getBalance, getBTCUSDTPrice } from '@/popup/api/btc/blockStream'

import { QueryBtcBalance } from '@/popup/api/btc/blockStream'
import { hideFullscreen, showAddressAndAssetId } from '@/popup/libs/tools'
// import { postToast } from '@/popup/libs/tools';
// import Import from './svgIcon/Import.vue';

export default {
  components: {
    IconMdiBitcoin,
    IconMdiAdd,
    TransferHistoryLogs,
    IconAutoTokenName,
  },
  setup: function () {
    const store = useAppStore()
    // @ts-ignore
    const account = computed(() => store.getActiveAccount())

    // console.log('account: ', account)
    const showAddress = (address: string) => {
      return showAddressAndAssetId(address, 12, 12)
    }
    const tabs = reactive([
      { label: 'Assets', value: 'token' },
      // { label: 'NFT', value: 'nft' },
      { label: 'History', value: 'history' },
    ])
    return {
      account,
      tabs,
      showAddress,
      store,
    }
  },
  data() {
    // const store = useAppStore()
    return {
      accountInfo: {
        balance: 0,
      },
      assets: [],
      transfers: [],
      activeTab: 'token',
      loading: true,

      lastTime: 0,
      refresh: false,
      wallet_id: '',
    }
  },
  computed: {
    usdtBalance() {
      // @ts-ignore
      return this.$root.btcPrice * this.accountInfo.balance
    },
    activeAccountIndex() {
      return this.store.activeAccount
    },
    historyLogs() {
      return this.store
        .getTransferList()
        .filter((x: TransferRow) => (x.wallet_id = this.wallet_id))
        // .sort((a: TransferRow, b: TransferRow) => b.timestamp - a.timestamp)
    },
  },
  // computed(() => store.getActiveAccount())

  watch: {
    activeAccountIndex: function (k, v) {
      if (k >= 0 && k != v) {
        this.initAccount()
      }
    },
    activeTab: function (k, v) {
      if (k != v && this.lastTime + 5000 >= Date.now()) {
        this.updateAssetsBalances()
        this.lastTime = Date.now()
      }
    },
  },
  created() {
    this.accountInfo.balance = this.store.currentBtcBalance
    this.wallet_id = this.store.getCurrentWalletId()
  },
  mounted() {
    // this.store = useAppStore()
    // setTimeout(() => {

    this.listenReceiveAllMessage()
    this.initAccount().then(() => {
      this.store.subscribeReceiveAllEncoded()
    })
    // @ts-ignore
    this.$root._checkUnlock()
  },
  methods: {
    async refreshData() {
      this.refresh = true
      this.initAccount()
        .then(() => {
          this.refresh = false
        })
        .catch((e) => {
          this.refresh = false
        })
    },
    async initAccount() {
      if (this.store.activeAccount < 0) {
        return
      }

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // this.accountInfo.balance = await getBalance(this.account.address)
      // this.btcPrice = await getBTCUSDTPrice()
      return this.store
        .updateAssets()
        .then(() => {
          // return this.store.updateListTransfers()
        })
        .then(() => {
          // subscribe all encoded
          this.store.initConfig()
          return this.updateAssetsBalances()
        })
    },
    async updateAssetsBalances() {
      if (this.store.activeAccount < 0) {
        this.loading = false
        return
      }
      this.loading = true
      // await this.store.updateListTransfers().then(() => {
      //   this.transfers = this.store.getTransferListForCurrent()
      // })
      const { wallet_id, btcAddress } = this.store.getActiveAccount()
      QueryBtcBalance({ wallet_id, btc_addr: btcAddress }).then(
        (btcBalance: number) => {
          this.store.setCurrentBtcBalance(btcBalance)
          this.accountInfo.balance = btcBalance
        }
      )

      this.store.updateBtcPrices().then((res) => {
        console.log('updateBtcPrices res: ', res)
        // @ts-ignore
        this.btcPrice = res.USD
      })
      await this.store.updateAssets().then(async () => {
        this.store.updateListTransfers()
        // @ts-ignore
        this.assets = await this.store.getUserAssetsBalance()
        // @ts-ignore
        this.$root.updateGlobalState()
        console.log('this.assets: ', this.assets)
        // add balance for BTC
        // @ts-ignore
        this.assets.unshift({
          asset_id: 'Base',
          amount: this.accountInfo.balance,
          name: 'BTC',
          asset_type: 'base',
        })
      })
      this.loading = false
    },
    listenReceiveAllMessage() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      // @ts-ignore
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Message received ==popup', message, sender, sendResponse)
        switch (message.type) {
          case 'ws.message':
            // eslint-disable-next-line no-case-declarations
            const { status } = message.data.result
            console.log(
              'ws.message received: ',
              message,
              message.data.result,
              status
            )
            // transfer asset is finished  "ADDR_EVENT_STATUS_COMPLETED"
            if (status === 'ADDR_EVENT_STATUS_COMPLETED') {
              // @ts-ignore
              self.$root._toast('Transaction completed', 'success')
              self.updateAssetsBalances()
            }
            break
          case 'isUnlocked':
            hideFullscreen()
            if (!message.data.status) {
              this.$router.push('/common/unlock')
            }
            break
          default:
            break
        }
        sendResponse()
      })
      chrome.runtime.onConnect.addListener(() => {
        // console.log(
        //   'chrome.runtime.onConnect==popup: ',
        //   new Date().toLocaleString(),
        //   response,
        //   ctx
        // )
        // @ts-ignore
        this.$root._checkUnlock()
      })
    },
    /* eslint-disable array-callback-return */
    async copyAddress(address: string) {
      const { backup } = this.store.getActiveAccount()
      if (!backup) {
        // @ts-ignore
        return this.$root._toast(
          'Please Backup Your Mnemonic Phrase First',
          'warning',
          2000
        )
      }
      await navigator.clipboard.writeText(address)
      // console.log('Copy successfully.')
      // @ts-ignore
      this.$root._toast('Copy successfully.', 'success')
    },
  },
}
</script>

<style lang="scss" scoped>
.home {
  @apply border-0 pb-14 px-0;
  .fullWhite {
    position: fixed;
    z-index: 99999;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    @apply bg-white;
  }
  .top {
    @apply px-4;
    .account {
      @apply w-full border-0 rounded-2xl flex flex-col justify-between items-center p-3 pb-10;
      background: radial-gradient(
        47.17% 129.97% at 51.3% 44.54%,
        rgba(0, 123, 255, 0.85) 0%,
        #8000ff 100%
      );
      .assets {
        @apply text-left w-full py-2;
        .btc {
          @apply text-white text-2xl leading-9 font-bold;
        }
        .usdt {
          @apply text-white opacity-60 text-base font-medium;
          font-feature-settings:
            'clig' off,
            'liga' off;
        }
      }
      .address {
        @apply flex flex-row justify-between items-center space-x-2 w-full rounded-xl py-[5px] px-2 text-white text-xs font-normal;
        background: rgba(255, 255, 255, 0.3);
      }
    }
    .actions {
      @apply w-full my-3 flex flex-row justify-around items-center space-x-2;
      margin-top: -30px;
    }
  }
  .home-tab {
    @apply pb-3 pt-1 mb-2 w-full;
    .tabs-container {
      @apply flex flex-row flex-nowrap justify-between items-center space-x-2 mb-0 border-b border-solid border-gray-200;
      .tab-btn {
        @apply btn-sm w-1/2 border-b-0 border-none rounded-none font-medium pb-4;
        color: #60606f;
        border-bottom-width: 2px;
        border-image-source: radial-gradient(
          47.17% 129.97% at 51.3% 44.54%,
          rgba(0, 123, 255, 0) 49%,
          #8000ff00 51%
        );
        border-image-slice: 30%;
        border-image-repeat: space;
        border-image-width: 0px 0px 2px 0px;
        transition: all 0.2s ease-in-out;
        &.active {
          // @apply text-primary border-primary;
          @apply text-primary;
          border-image-source: radial-gradient(
            47.17% 129.97% at 51.3% 44.54%,
            rgba(0, 123, 255, 0.85) 0%,
            #8000ff 100%
          );
          border-image-slice: 10%;
          transition: all 0.5s;
        }
      }
    }
    .contents {
      @apply p-0;
      .content-tab {
        min-height: 25vh;
        .token-item {
          @apply flex flex-row justify-between items-center border-b border-gray-200 border-solid  py-[18px] mx-[16px] ;
          .b {
            @apply text-base font-semibold text-right;
          }
          .u {
            @apply text-gray-400 text-sm font-normal text-right;
          }
          .iconName {
            @apply flex flex-nowrap flex-row justify-start items-center;
            .icon {
              @apply flex flex-nowrap flex-row justify-start items-center p-1;
              .icon-img {
                @apply size-10 rounded-full;
              }
            }
            .names {
              @apply text-left;
              .name {
                @apply text-base font-bold uppercase;
              }
              .des {
                @apply text-sm text-gray-400 font-normal;
              }
            }
          }
        }
      }
    }
  }
}
.refreshIcon {
  position: fixed;
  z-index: 11;
  right: 10px;
  bottom: 10px;
  @apply p-2 shadow-lg rounded-full flex flex-row justify-center items-center;
  .icc {
    @apply animate-none;
    &.refreshing {
      @apply animate-spin;
    }
  }
}
</style>
