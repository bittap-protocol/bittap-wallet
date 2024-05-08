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
            <div class="address">{{ showAddress(acc.address) }}</div>
            <div class="path">{{ acc.path }}</div>
            <div class="actions">
                <button v-if="acc.phrase && acc.phrase.split(' ').length >= 12" class="button" @click="backupWords(index)"><IconMdiPasswordReset class="size-10"></IconMdiPasswordReset>Backup mnemonics</button>
                <button class="button" @click="backupPrivate(acc, index)"><IconMdiCloudKey class="size-10"></IconMdiCloudKey>Export privateKey</button>
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
        await store.createAccount()
        store.updateCurrentAccountBackupState()
        this.$root._toast('Create account success!', 'success')
      },
      importAccount(){
        this.$router.push('/common/importAccount')
      }
    }
  }
  
  
</script>
  
<style lang="scss" scoped>
.accounts{
    @apply py-4;
    .account {
        @apply border border-gray-200 border-solid shadow-sm p-2 mb-3;
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
            @apply w-full flex flex-row justify-between items-center space-x-3;
        }
    }
}
</style>