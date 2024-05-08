<template>
    <div class="accounts">

        <button class="switchBtn" @click="showDialog">
            <span class="pl-2 pr-0">{{ activeAccountInfo.name || 'Account-'+(activeAccountIndex+1) }}</span>
            <span>
                <IconMdiArrowDownDrop></IconMdiArrowDownDrop>
            </span>
        </button>

        <dialog id="my_modal_select_account" class="modal rounded-sm">
            <div class="modal-box dialog">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 class="font-bold text-lg text-center">Select Account</h3>

                <div class="cb">
                    <div v-for="(acc, index) in accounts" :key="'acc-'+index" class="switchItem"
                        @click="selectAccount(index,acc)">
                        <div class="name text-base flex flex-row justify-between items-center w-full">
                            <div class="name-label">{{ acc.name || 'Account-'+(index+1) }}</div>
                            <IconMdiCheck v-if="activeAccountIndex === index" class="pl-1 icon active"></IconMdiCheck>
                        </div>
                        <!-- <div class="path  w-full text-gray-500  w-full">
                        {{ acc.path}}
                    </div> -->
                        <div class="address text-ellipsis text-wrap  w-full">
                            {{ showAddress(acc.address) }}
                        </div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="btn btn-primary" @click="createAccount">Add Account</button>
                    <RouterLink class="btn btn-link no-underline hover:no-underline" to="/common/importAccount">
                        Import Account
                    </RouterLink>
                </div>
            </div>

        </dialog>

    </div>
</template>

<script lang="ts">
// @ts-ignore
import IconMdiCheck from '~icons/mdi/check';
// @ts-ignore
import IconMdiArrowDownDrop from '~icons/mdi/arrow-down-drop';

import { useAppStore } from '@/stores/app.store'

export default {
    components: {
        IconMdiCheck, IconMdiArrowDownDrop
    },
    setup(){
        const store = useAppStore()
        // @ts-ignore
        const accounts = computed(() => store.accountList)
        // @ts-ignore
        const activeAccountInfo = computed(() => store.getActiveAccount())
        // @ts-ignore
        const activeAccountIndex = computed(() => store.activeAccount)

        console.log('activeAccount:', accounts.value, activeAccountIndex.value)

        const showAddress = (address: string) => {
            return [address.substring(0, 16), address.substring(address.length - 16)].join('...')
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
        return {
            showDialog, selectAccount, showAddress, activeAccountInfo, accounts, activeAccountIndex
        }
    },
    methods: {
        async createAccount() {
            const store = useAppStore()
            await store.createAccount()
            store.updateCurrentAccountBackupState()
            // @ts-ignore
            my_modal_select_account.close()
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
    .name{
        @apply text-black;
        .active{
            @apply text-primary;
        }
    }
    .address {
        @apply text-gray-500;
    }
    &:hover, :focus, :focus-visible, :focus-within, :active {
        @apply border-primary shadow-primary bg-primary cursor-pointer text-white;
        .name{
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
        .address{
            @apply text-gray-300;
        }
    }
}
.dialog {
    @apply w-11/12 rounded-xl bg-gray-100 px-4 py-2;
    height:  500px;
    .cb{
        @apply flex flex-col flex-nowrap justify-start items-center py-3 w-full overflow-y-auto overflow-x-hidden ;
        height: 355px;
    }
    .dialog-actions {
        @apply flex flex-col justify-between items-stretch space-y-1 w-full;
    }
}
</style>