<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <div class=" min-box p-4">
    <div class="flex flex-row flex-nowrap justify-between items-center space-x-3">
      <button
        class="btn btn-primary text-sm font-medium px-3"
        @click="createAccount"
      >
        <IconMdiAccountAdd class="size-4"></IconMdiAccountAdd>
        Create account
      </button>
      <button
        class="btn btn-primary  text-sm font-medium px-3"
        @click="importAccount"
      >
        <IconMdiApplicationImport class="size-4"></IconMdiApplicationImport>
        Import account
      </button>
    </div>
    <div class="accounts list-box">
      <div
        v-for="(acc, index) in accounts"
        :key="acc.btcAddress"
        class="account"
      >
        <div class="name flex flex-row justify-between items-center">
          <div>{{ acc.name || 'Account-' + (index + 1) }}</div>
          <button
            class="link flex flex-row justify-between items-center"
            @click="editName(index, acc.name || 'Account ' + (index + 1))"
          >
            <IconMdiAccountBoxEditOutline
              class="size-5 mr-1"
            ></IconMdiAccountBoxEditOutline>
            Edit
          </button>
        </div>
        <div class="address w-full">
          <div class="balance w-full flex flex-col justify-start items-right pr-2 text-sm font-medium leading-snug">
            <div class="btc text-[#3c454e] mr-4">Balance: {{ $root.formatAssets($root._BTC2Number(acc.btcBalance), 6, 'BTC') }}</div>
            <div class="usd text-[#888f99]">≈${{ $root.formatToken($root.showUsdtBalance($root._BTC2Number(acc.btcBalance)), 2) }}</div>
          </div>
        </div>
        <div class="path flex flex-row justify-start items-center">
          {{ showAddress(acc.btcAddress) }}
          <button
            class="text-primary fill-primary ml-2"
            @click="copyAddress(acc.btcAddress)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.40077 2.60309C5.25832 2.60309 5.14284 2.71858 5.14284 2.86103V4.32741C5.14284 4.67807 4.85857 4.96233 4.50792 4.96233C4.15726 4.96233 3.873 4.67807 3.873 4.32741V2.86103C3.873 2.01726 4.55701 1.33325 5.40077 1.33325H13.1389C13.9826 1.33325 14.6666 2.01726 14.6666 2.86103V10.5991C14.6666 11.4429 13.9826 12.1269 13.1389 12.1269H11.6559C11.3053 12.1269 11.021 11.8426 11.021 11.492C11.021 11.1413 11.3053 10.8571 11.6559 10.8571H13.1389C13.2813 10.8571 13.3968 10.7416 13.3968 10.5991V2.86103C13.3968 2.71858 13.2813 2.60309 13.1389 2.60309H5.40077Z"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.33331 5.40071C1.33331 4.55694 2.01732 3.87293 2.86109 3.87293H10.5992C11.443 3.87293 12.127 4.55694 12.127 5.40071V13.1388C12.127 13.9826 11.443 14.6666 10.5992 14.6666H2.86109C2.01732 14.6666 1.33331 13.9826 1.33331 13.1388V5.40071ZM2.86109 5.14278C2.71864 5.14278 2.60315 5.25826 2.60315 5.40071V13.1388C2.60315 13.2813 2.71864 13.3967 2.86109 13.3967H10.5992C10.7416 13.3967 10.8571 13.2813 10.8571 13.1388V5.40071C10.8571 5.25826 10.7416 5.14278 10.5992 5.14278H2.86109Z"
              />
            </svg>
          </button>
        </div>
        <div class="actions">
          <button
            v-if="acc.phraseIndex >= 0"
            class="btn btn-text btn-block flex flex-row justify-center items-center"
            @click="backupWords(index)"
          >
            <IconMdiCloudKey class="size-6"></IconMdiCloudKey>
            Backup mnemonics
          </button>
          <!-- <button class="button" @click="backupPrivate(acc, index)"><IconMdiCloudKey class="size-10"></IconMdiCloudKey>Export privateKey</button> -->
        </div>
      </div>
    </div>

    <dialog
      id="modal_save"
      class="modal"
    >
      <div class="modal-box rounded-2xl">
        <h3 class="font-bold text-lg flex flex-row justify-start items-center">
          <IconMdiContentSave class="size-5 mr-1"></IconMdiContentSave>
          Edit name
        </h3>
        <div class="py-4">
          <div class="input-box input-append">
            <input
              v-model="newAccountName"
              type="text"
              maxlength="15"
            />
          </div>
        </div>

        <div class="modal-action justify-between">
          <form
            method="dialog"
            class="w-[40%]"
          >
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn btn-ghost w-full btn-outline">Close</button>
          </form>
          <button
            class="btn btn-primary w-[40%]"
            @click="saveName"
          >
            Save
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script lang="ts">
// eslint-disable no-unused-vars
// @ts-ignore
import IconMdiAccountAdd from '@/components/svgIcon/MdiAccountAdd.vue'
// @ts-ignore
import IconMdiApplicationImport from '@/components/svgIcon/MdiApplicationImport.vue'
// @ts-ignore
import IconMdiAccountBoxEditOutline from '@/components/svgIcon/MdiAccountBoxEditOutline.vue'
// @ts-ignore
// import IconMdiPasswordReset from '@/components/svgIcon/MdiPasswordReset.vue'
// @ts-ignore
import IconMdiCloudKey from '@/components/svgIcon/MdiCloudKey.vue'
// @ts-ignore
import IconMdiContentSave from '@/components/svgIcon/MdiContentSave.vue'
// @ts-ignore
// import IconBackup from '@/components/svgIcon/Backup.vue'

import { useAppStore } from '@/stores/app.store'

export default {
  components: {
    IconMdiAccountAdd,
    IconMdiApplicationImport,
    IconMdiAccountBoxEditOutline,

    IconMdiCloudKey,
    IconMdiContentSave,
    // IconBackup
  },
  setup() {
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('')
    store.isGoBack()
    const accounts = computed(() => store.accountList)
    return {
      accounts,store
    }
  },
  data() {
    return {
      editIndex: -1,
      newAccountName: '',
      privateKey: '',
    }
  },
  created() {
    this.initData()
  },
  methods: {
    showAddress(address: string) {
      return address
        ? [
            address.substring(0, 16),
            address.substring(address.length - 16),
          ].join('...')
        : ''
    },
    initData() {
      // @ts-ignore
      this.$root.setTitle('Account mange')
    },
    editName(index: number, name:string) {
      this.editIndex = index
      this.newAccountName = name
      // @ts-ignore
      modal_save.showModal()
    },
    async saveName() {
      this.store.changeAccountName(this.newAccountName, this.editIndex)
      // @ts-ignore
      modal_save.close()
      // @ts-ignore
      this.$root._toast('Edit success!', 'success')
    },
    backupWords(index:number) {
      const store = useAppStore()
      store.switchActiveAccount(index)
      this.$router.push('/common/backupKey?auth=yes')
    },
    // @ts-ignore
    backupPrivate(account) {
      this.privateKey = account.privateKey
      // @ts-ignore
      modal_backup.showModal()
    },
    async createAccount() {
      await this.store.createNewUser()
      // @ts-ignore
      this.$root._toast('Create account success!', 'success', 1000)
      this.store.updateAllAccountsBtcBalance()
      setTimeout(() => {
        // @ts-ignore
        this.$root._toast(
          'Please Backup Your Mnemonic Phrase First',
          'warning',
          2000
        )
        this.$router.push('/common/backupKey?auth=yes')
      }, 1100)
    },
    importAccount() {
      this.$router.push('/common/importAccount')
    },
    /* eslint-disable array-callback-return */
    async copyAddress(address: string) {
      await navigator.clipboard.writeText(address)
      // console.log('Copy successfully.')
      // @ts-ignore
      this.$root._toast('Copy successfully.', 'success')
    },
  },
}
</script>

<style lang="scss" scoped>
.accounts {
  @apply py-4 px-0;
  .account {
    @apply border border-gray-200 border-solid shadow-sm px-2 mb-3 rounded-md;
    .name,
    .path,
    .address {
      @apply py-2;
    }
    .name {
      @apply font-bold text-base;
    }
    .button {
      // @apply ;
    }
    .actions {
      @apply w-full flex flex-row justify-between items-center space-x-3 mb-2;
    }
  }
}
</style>
