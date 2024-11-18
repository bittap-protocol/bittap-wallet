<template>
    <div class="mt-[-66px] py-2 px-4">
        <div class="flex w-full">
            <div class="w-full">
                <div
                    class="flex bg-purple-200 rounded-md items-center justify-center py-2"
                >
                    <!-- <img
                        :src="siteInfo.icon ? siteInfo.icon : '@/assets/web-icon.png'"
                        :alt="siteInfo.title"
                        onerror="this.src='@/assets/web-icon.png'"
                        height="33"
                        width="33"
                        class="p-0"
                    /> -->
                    <img
                        src="@/assets/siteIcon.png"
                        :alt="siteInfo.title"
                        height="33"
                        width="33"
                        class="p-0"
                    />
                    <span class="pl-2">{{ siteInfo.href }}</span>
                </div>
                <div class="card place-items-center p-4">
                    <span class="text-base font-bold mb-3" :alt="'Connect with '+siteInfo.title">
                        Connect with {{ siteInfo.host }}
                    </span>
                    <span class="font-bold">
                        Select the account to use on this site
                    </span>
                    <span>Only connect with sites you trust</span>
                </div>
                <div class="min-h-[300px] mb-12 overflow-y-auto w-full">
                    <div v-for="(acc, index) in accounts" :key="acc.btcAddress" class="flex w-full bg-purple-200 rounded-md h-25 p-4 mb-1" @click="accountActive = index">
                        <div class="card place-content-center font-bold">
                            <IconCheck v-if="accountActive === index" class="size-6"></IconCheck>
                            <div v-else class="size-6"></div>
                        </div>
                        <div class="card place-content-left pl-2">
                            <div class="font-bold">{{ acc.name }}</div>
                            <div>{{ $root._showMinMaxString(acc.btcAddress,5,5) }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex px-4 h-12 justify-between items-center fixed z-10 left-0 bottom-0 w-full bg-white">
                    <button
                        class="border border-primary text-primary font-bold px-8 py-2 rounded-xl hover:bg-primary/20"
                        @click="rejectProvide"
                    >
                        Cancel
                    </button>
                    <button
                        class="border border-primary bg-primary text-white px-8 py-2 font-bold rounded-xl hover:bg-primary/80"
                        @click="resolveProvide"
                    >
                        Connect
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// @ts-ignore
import IconCheck from '@/components/svgIcon/MynauiCheck.vue'
import { ref } from 'vue'
import { useAppStore } from '@/stores/app.store'
import { getLocalStoreKey, REQUEST_CURRENT_SITE, SiteInfo, sendMessage,getQuery, netWorkTypes, RequestItem, hideLoading, showLoading, LocalNetUrl } from '@/popup/libs/tools';
const store = useAppStore()
const accountActive = ref(store.activeAccount)

const requestId = getQuery('requestId')
const networkType = getQuery('networkType')
const autoConnection = ref(false)
const rpcUrl = ref('')

const siteInfo = ref({
    host: "",
    href: "",
    icon: "",
    title: ""
} as SiteInfo)

siteInfo.value = (await getLocalStoreKey(REQUEST_CURRENT_SITE)) as SiteInfo

const accounts = computed(() => store.accountList)


const rejectProvide = async () => {
    await sendMessage('Bittap-RejectConnectionWallet', {
        requestId
    })
    setTimeout(() => {
        window.close()
    }, 300)
}
const resolveProvide = async () => {
    showLoading('Connecting...')
    
    const { btcAddress, name } = store.getActiveAccount()
    if(networkType && netWorkTypes.includes(networkType) && store.getNetWorkType()!== netWorkTypes.findIndex(o => o === networkType)){
        await store.changeNetWork(netWorkTypes.findIndex(o => o === networkType), rpcUrl.value)
    }
    if(accountActive.value !== store.activeAccount){
        await store.switchActiveAccount(accountActive.value)
    }
    await store.getUserAssetsBalance()
    store.initConfig()
    await sendMessage('Bittap-ResolveConnectionWallet', {
        requestId,
        account: { btcAddress, name },
        network: netWorkTypes[store.getNetWorkType()]
    })
    store.addSite(siteInfo.value.title, siteInfo.value.href, siteInfo.value.icon)
    hideLoading()
    window.close()
}

const queueInfo:RequestItem = (await sendMessage('getQueue', requestId)) as RequestItem
// console.log('queueInfo: ', queueInfo)
if(queueInfo){
    if(networkType === 'regtest'){
        // @ts-ignore
        rpcUrl.value = queueInfo.data?.url || LocalNetUrl
    }
    // @ts-ignore
    autoConnection.value = queueInfo.data?.autoConnection || false

    const site = store.getSiteInfo( new URL(siteInfo.value.href).host)
    // console.log('site: ', site, autoConnection.value, queueInfo, queueInfo.data?.autoConnection)
    if(autoConnection.value && site){
        resolveProvide()
    }
}




</script>
<style scoped></style>
