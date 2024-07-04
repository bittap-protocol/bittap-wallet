<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
    <div class="w-full min-box p-4">
        <div class="w-full flex flex-row justify-between items-center space-x-3">
            <button class="button" @click="createAccount">
                <IconMdiAccountAdd class="mr-1"></IconMdiAccountAdd>
                Create account
            </button>
            <button class="button" @click="importAccount">
                <IconMdiApplicationImport class="mr-1"></IconMdiApplicationImport>
                Import account
            </button>
        </div>
      <div class="accounts list-box">
        <div v-for="(acc, index) in accounts" :key="acc.address" class="account">
            <div class="name flex flex-row justify-between items-center">
                <div>{{ acc.name || 'Account-'+ (index+1) }}</div>
                <button class="link flex flex-row justify-between items-center" @click="editName(index, acc.name || 'Account-'+ (index+1))"><IconMdiAccountBoxEditOutline class="size-5"></IconMdiAccountBoxEditOutline>Edit</button>
            </div>
            <div class="address">{{ acc.path }}</div>
            <div class="path flex flex-row justify-start items-center">{{ showAddress(acc.btcAddress) }} 
              <button class="text-primary fill-primary" @click="copyAddress(acc.btcAddress)">
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M5.40077 2.60309C5.25832 2.60309 5.14284 2.71858 5.14284 2.86103V4.32741C5.14284 4.67807 4.85857 4.96233 4.50792 4.96233C4.15726 4.96233 3.873 4.67807 3.873 4.32741V2.86103C3.873 2.01726 4.55701 1.33325 5.40077 1.33325H13.1389C13.9826 1.33325 14.6666 2.01726 14.6666 2.86103V10.5991C14.6666 11.4429 13.9826 12.1269 13.1389 12.1269H11.6559C11.3053 12.1269 11.021 11.8426 11.021 11.492C11.021 11.1413 11.3053 10.8571 11.6559 10.8571H13.1389C13.2813 10.8571 13.3968 10.7416 13.3968 10.5991V2.86103C13.3968 2.71858 13.2813 2.60309 13.1389 2.60309H5.40077Z"
                     />
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M1.33331 5.40071C1.33331 4.55694 2.01732 3.87293 2.86109 3.87293H10.5992C11.443 3.87293 12.127 4.55694 12.127 5.40071V13.1388C12.127 13.9826 11.443 14.6666 10.5992 14.6666H2.86109C2.01732 14.6666 1.33331 13.9826 1.33331 13.1388V5.40071ZM2.86109 5.14278C2.71864 5.14278 2.60315 5.25826 2.60315 5.40071V13.1388C2.60315 13.2813 2.71864 13.3967 2.86109 13.3967H10.5992C10.7416 13.3967 10.8571 13.2813 10.8571 13.1388V5.40071C10.8571 5.25826 10.7416 5.14278 10.5992 5.14278H2.86109Z"
                     />
                </svg>

              </button>
            </div>
            <div class="actions">
                <button v-if="acc.phraseIndex>=0" @click="backupWords(index)" class="btn btn-primary btn-block flex flex-row justify-center items-center"><IconMdiPasswordReset class="size-10"></IconMdiPasswordReset>Backup mnemonics</button>
                <!-- <button class="button" @click="backupPrivate(acc, index)"><IconMdiCloudKey class="size-10"></IconMdiCloudKey>Export privateKey</button> -->
            </div>
        </div>
      </div>

      <dialog id="modal_save" class="modal">
        <div class="modal-box rounded-sm">
            <h3 class="font-bold text-lg flex flex-row justify-start items-center"> <IconMdiContentSave class="size-5"></IconMdiContentSave> Edit name</h3>
            <div class="py-4">
                <input v-model="newAccountName" type="text" class="border rounded-sm" maxlength="15" />
            </div>
            
            <div class="modal-action justify-start">
                <form method="dialog">
                    <!-- if there is a button in form, it will close the modal -->
                    <button class="btn">Close</button>
                </form>
                <button class="btn btn-primary" @click="saveName">
                    Save
                </button>
            </div>
        </div>
    </dialog>

      <dialog id="modal_backup" class="modal">
        <div class="modal-box rounded-sm">
            <h3 class="font-bold text-lg">Backup private key(hex)</h3>
            <div class="w-full py-4">
                <input v-model="privateKey" type="text" class="border rounded-sm w-full" readonly />
                <div class="text-sm text-red-500 my-4 py-4">
                    Please take good care of your private key, please do not place it in any place that can be synchronized with the network, it is recommended to keep it offline
                </div>
            </div>
            <div class="modal-action justify-start">
                <form method="dialog">
                    <!-- if there is a button in form, it will close the modal -->
                    <button class="btn btn-primary">Close</button>
                </form>
            </div>
        </div>
      </dialog>
    </div>
</template>
  
<script lang="ts">
// eslint-disable no-unused-vars
  import IconMdiAccountAdd from '~icons/mdi/account-add';
  import IconMdiApplicationImport from '~icons/mdi/application-import';
  import IconMdiAccountBoxEditOutline from '~icons/mdi/account-box-edit-outline';
  import IconMdiPasswordReset from '~icons/mdi/password-reset';
  import IconMdiCloudKey from '~icons/mdi/cloud-key';
  import IconMdiContentSave from '~icons/mdi/content-save';

  import { useAppStore } from '@/stores/app.store'
  
  export default {
    components: {
        IconMdiAccountAdd,
        IconMdiApplicationImport,
        IconMdiAccountBoxEditOutline,
        IconMdiPasswordReset,
        IconMdiCloudKey,
        IconMdiContentSave
    },
    setup() {
      
      const store = useAppStore()
      // const router = useRouter()
  
      store.setGoBackUrl('')
      store.isGoBack()
      const accounts = computed(() => store.accountList)
      return {
        accounts
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
      showAddress(address:string)  {
          return address ? [address.substring(0, 16), address.substring(address.length-16)].join('...') : ''
      },
      initData() {
        // @ts-ignore
        this.$root.setTitle('Account mange')
      },
      editName(index:number, name) {
        this.editIndex = index
        this.newAccountName = name
        modal_save.showModal()
      },
      async saveName() {
        const store = useAppStore()
        console.log('this.$store: ', store)
        store.changeAccountName( this.newAccountName, this.editIndex)
        modal_save.close()
        this.$root._toast('Edit success!', 'success')
      },
      backupWords(index) {
        const store = useAppStore()
        store.switchActiveAccount(index)
        this.$router.push('/common/backupKey')
      },
      backupPrivate(account, index) {
        this.privateKey = account.privateKey
        modal_backup.showModal()
      },
      async createAccount() {
        const store = useAppStore()
        await store.createNewUser()
        store.updateCurrentAccountBackupState()
        this.$root._toast('Create account success!', 'success')
      },
      importAccount(){
        this.$router.push('/common/importAccount')
      },
      /* eslint-disable array-callback-return */
      async copyAddress(address: string) {
        await navigator.clipboard.writeText(address)
        // console.log('Copy successfully.')
        // @ts-ignore
        this.$root._toast('Copy successfully.', 'success')
      }
    }
  }
  
  
</script>
  
<style lang="scss" scoped>
.accounts{
    @apply py-4 px-0;
    .account {
        @apply border border-gray-200 border-solid shadow-sm px-2 mb-3 rounded-md;
        .name,.path,.address {
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