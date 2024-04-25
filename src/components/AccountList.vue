<template>
  <div class="accounts">
    
    <button class="switchBtn" @click="showDialog">
        <span class="pl-2 pr-0">{{ activeAccountInfo.name || 'Account-'+(activeAccountIndex+1) }}</span>
        <span >
            <IconMdiArrowDownDrop></IconMdiArrowDownDrop>
        </span>
    </button>

    <dialog id="my_modal_select_account" class="modal rounded-sm">
        <div class="modal-box rounded-md">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="font-bold text-lg">Switch account</h3>
            
            <div class="flex flex-col flex-nowrap justify-start items-center h-4/5 min-h-96 py-3 w-full overflow-y-auto overflow-x-hidden">
                <div v-for="(acc, index) in accounts" :key="'acc-'+index" class="switchItem" @click="selectAccount(index,acc)">
                    <div class="name text-base text-black flex flex-row justify-between items-center w-full">
                        <div class="name-label">{{ acc.name || 'Account-'+(index+1) }}</div>
                        <IconMdiCheck v-if="activeAccountIndex === index" class="pl-1 icon text-sky-400"></IconMdiCheck>
                    </div>
                    <div class="path  w-full text-gray-500  w-full">
                        {{ acc.path}}
                    </div>
                    <div class="address text-ellipsis text-wrap text-gray-900  w-full">
                        {{ showAddress(acc.address) }}
                    </div>
                </div>
            </div>
        </div>
    </dialog>
    
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import IconMdiCheck from '~icons/mdi/check';
// @ts-ignore
import IconMdiArrowDownDrop from '~icons/mdi/arrow-down-drop';
import { useAppStore } from '@/stores/app.store'
const store = useAppStore()
// @ts-ignore
const accounts = computed(() => store.accountList)
// @ts-ignore
const activeAccountInfo = computed(() => store.getActiveAccount())
// @ts-ignore
const activeAccountIndex = computed(() => store.activeAccount)

console.log('activeAccount:', accounts.value, activeAccountIndex.value)

const showAddress = (address:string) => {
    return [address.substring(0, 16), address.substring(address.length-16)].join('...')
}

// const visiableDialog = ref(false)

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

</script>

<style scoped lang="scss">
.switchBtn {
    @apply border rounded-sm border border-sky-400 border-solid outline-0 join w-full h-7 flex flex-row justify-center items-center shadow-sm;
    &:hover, :focus, :focus-visible, :focus-within, :active {
        @apply border-sky-300 shadow-sky-500;
    }
}
.switchItem {
    @apply flex flex-col justify-around items-center px-3 py-2 m-1 rounded-md border border-sky-400 border-solid outline-0 w-full shadow-sm;
    &:hover, :focus, :focus-visible, :focus-within, :active {
        @apply border-sky-600 shadow-sky-500 bg-sky-200 cursor-pointer;
        .name-label{
            @apply text-sky-500;
        }
        .icon{
            @apply text-sky-600;
        }
    }
}
</style>