<template>
  <div class="accounts">
    <button
      class="switchBtn"
      @click="showDialog"
    >
      <span class="pl-2 pr-0 font-medium text-base">
        {{ activeAccountInfo.name || 'Account ' + (activeAccountIndex + 1) }}
      </span>
      <span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.00038 11.3809C8.21914 11.3809 8.42398 11.2735 8.54851 11.0937L11.5485 6.76033C11.6896 6.55646 11.706 6.29109 11.5909 6.07146C11.4758 5.85181 11.2483 5.71419 11.0004 5.71419H5.00038C4.75241 5.71419 4.52494 5.85181 4.40986 6.07146C4.29478 6.29109 4.31111 6.55646 4.45225 6.76033L7.45225 11.0937C7.57677 11.2735 7.78161 11.3809 8.00038 11.3809Z"
            fill="#131212"
          />
        </svg>
      </span>
    </button>

    <dialog
      id="my_modal_select_account"
      class="modal rounded-sm"
    >
      <div class="modal-box dialog">
        <form method="dialog">
          <button
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </form>
        <h3 class="font-bold text-lg text-center">Select Account</h3>

        <div class="cb">
          <div
            v-for="(acc, index) in accounts"
            :key="'acc-' + index"
            class="switchItem"
            @click="selectAccount(index, acc)"
          >
            <div
              class="name text-base flex flex-row justify-between items-center w-full"
            >
              <div class="name-label flex flex-col justify-center items-start">
                <div class="name flex flex-row justify-start items-center">
                  <span class="block text-[#131211]">
                    {{ acc.name || 'Account-' + (index + 1) }}
                  </span>
                  <span
                    v-if="acc.import"
                    class="block w-10 h-3.5 bg-gradient-to-b from-[#007bff] to-[#8000ff] rounded text-white text-[10px] font-normal ml-1 leading-[12px] text-center"
                  >
                    Import
                  </span>
                </div>
                <div class="address text-ellipsis text-wrap text-[#888f99] text-sm font-medium leading-snug">
                  {{ showAddress(acc.btcAddress) }}
                </div>
              </div>
              <div class="info flex flex-row justify-end items-center">
                <div class="balance flex flex-col justify-center items-right pr-2 text-sm font-medium leading-snug text-right">
                  <div class="btc text-[#3c454e]">{{ $root.formatAssets(acc.btcBalance, 6, 'BTC') }}</div>
                  <div class="usd text-[#888f99]">≈${{ $root.formatToken($root.showUsdtBalance(acc.btcBalance), 2) }}</div>
                </div>
                <div class="arrow">
                  <IconMdiCheck
                    v-if="activeAccountIndex === index"
                    class="pl-1 icon active"
                  ></IconMdiCheck>
                </div>
              </div>
            </div>
           
          </div>
        </div>
        <div class="dialog-actions">
          <button
            class="btn btn-primary"
            @click="createAccount"
          >
            Add Account
          </button>
          <RouterLink
            class="btn btn-link no-underline hover:no-underline"
            to="/common/importAccount"
          >
            Import Account
          </RouterLink>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconMdiCheck from '~icons/mdi/check'
// // @ts-ignore
// import IconMdiArrowDownDrop from '~icons/mdi/arrow-down-drop'

import { useAppStore } from '@/stores/app.store'

export default {
  components: {
    IconMdiCheck,
    // IconMdiArrowDownDrop,
  },
  setup() {
    const store = useAppStore()
    // @ts-ignore
    const accounts = computed(() => store.accountList)
    // @ts-ignore
    const activeAccountInfo = computed(() => store.getActiveAccount())
    // @ts-ignore
    const activeAccountIndex = computed(() => store.activeAccount)

    // console.log('activeAccount:', accounts.value, activeAccountIndex.value)

    const showAddress = (address: string) => {
      return [
        address.substring(0, 4),
        address.substring(address.length - 4),
      ].join('...')
    }
    const showDialog = () => {
      // visiableDialog.value = true
      // @ts-ignore
      my_modal_select_account.showModal()
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const selectAccount = (index: number, acc: unknown) => {
      store.switchActiveAccount(index)
      // @ts-ignore
      my_modal_select_account.close()
    }
    store.updateAllAccountsBtcBalance()
    return {
      showDialog,
      selectAccount,
      showAddress,
      activeAccountInfo,
      accounts,
      activeAccountIndex,
      store
    }
  },
  methods: {
    async createAccount() {
      await this.store.createNewUser()
      this.store.updateAllAccountsBtcBalance()
      // @ts-ignore
      my_modal_select_account.close()
      // @ts-ignore
      this.$root._toast('Create account success!', 'success')
    },
  },
}
</script>

<style scoped lang="scss">
.switchBtn {
  @apply border rounded-sm border-0  outline-0 join w-full h-7 flex flex-row justify-center items-center shadow-none;
  // &:hover, :focus, :focus-visible, :focus-within, :active {
  //     @apply border-sky-300 shadow-sky-500 border border-solid;
  // }
}
.switchItem {
  @apply flex flex-col justify-around items-center px-3 py-2 m-1 rounded-xl outline-0 w-full shadow-sm bg-white;
  .name {
    @apply text-black;
    .active {
      @apply text-primary;
    }
  }
  .address {
    @apply text-gray-500;
  }
  &:hover,
  :focus,
  :focus-visible,
  :focus-within,
  :active {
    @apply border-primary shadow-primary bg-primary cursor-pointer text-white;
    .name {
      @apply text-white;
      .active {
        @apply text-white;
      }
    }
    // .name-label{
    //     @apply text-white;
    // }
    // .icon{
    //     @apply text-white;
    // }
    .address {
      @apply text-gray-300;
    }
  }
}
.dialog {
  @apply w-11/12 rounded-xl bg-gray-100 px-4 py-2;
  height: 500px;
  .cb {
    @apply flex flex-col flex-nowrap justify-start items-center py-3 w-full overflow-y-auto overflow-x-hidden;
    height: 355px;
  }
  .dialog-actions {
    @apply flex flex-col justify-between items-stretch space-y-1 w-full;
  }
}
</style>
