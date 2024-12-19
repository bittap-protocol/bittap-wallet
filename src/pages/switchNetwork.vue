<template>
    <div class="mt-[-56px] py-2 px-4">
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
                        Switch network with {{ siteInfo.host }}
                    </span>
                    <span class="font-bold">
                        The current program requires switching networks
                    </span>
                    <span>This will change the current wallet network</span>
                </div>
                <div class="min-h-[300px] mb-12 overflow-y-auto w-full flex flex-row justify-center items-center gap-x-5">
                    <div class="origin">
                        <div class="network-icon rounded-full w-20 bg-gray-50 shadow-md border border-solid border-neutral h-20 flex flex-col justify-center items-center">{{ currentNetwork }}</div>
                    </div>
                    <div class="icon">
                        <TablerArrowRightToArc class="size-10" />
                    </div>
                    <div class="newNetwork">
                        <div class="network-icon rounded-full w-20 bg-gray-50 shadow-2xl bg-primary text-white font-bold border border-solid border-primary h-20 flex flex-col justify-center items-center">{{ newNetwork }}</div>
                    </div>
                </div>
                <div class="flex px-4 h-12 justify-between items-center fixed z-10 left-0 bottom-0 w-full bg-white">
                    <button
                        class="border border-primary text-primary font-bold px-8 py-2 rounded-xl hover:bg-primary/20"
                        @click="rejectProvide('')"
                    >
                        Reject
                    </button>
                    <button
                        class="border border-primary bg-primary text-white px-8 py-2 font-bold rounded-xl hover:bg-primary/80"
                        @click="resolveProvide"
                    >
                        Switch network
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// @ts-ignore
import TablerArrowRightToArc from '@/components/svgIcon/TablerArrowRightToArc.vue'
// @ts-ignore
import { ref } from 'vue'
import { useAppStore } from '@/stores/app.store'
import { SiteInfo, sendMessage,getQuery, showLoading, hideLoading, netWorkTypes, RequestItem, LocalNetUrl } from '@/popup/libs/tools';
const store = useAppStore()

const requestId = getQuery('requestId')
const networkType = getQuery('networkType')
const host = getQuery('host')


const rejectProvide = async (rejectMessage:string='') => {
    await sendMessage('Bittap-RejectResult', {
        requestId,
        rejectMessage
    })
    setTimeout(() => {
        window.close()
    }, 200)
}
const resolveProvide = async () => {
    showLoading('Switch network...')
    await store.changeNetWork(netWorkTypes.findIndex(o => o === networkType), rpcUrl.value).then(async()=>{
        await store.getUserAssetsBalance()
        store.initConfig()
         sendMessage('Bittap-ResolveResult', {
            requestId,
        })
    }).finally(async () => {
        hideLoading()
    }).catch((error) => {
        console.error('store.changeNetWork on error: ', error)
        rejectProvide(error+'')
    })
    
    window.close()
}

const siteInfo = ref({
    host: "",
    href: "",
    icon: "",
    title: ""
} as SiteInfo)
const rpcUrl = ref('')
const siteRow = store.getSiteInfo(host)
if(siteRow){
    siteInfo.value.host = siteRow.host
    siteInfo.value.href = [siteRow.protocol, siteRow.host].join('//')
    // @ts-ignore
    siteInfo.value.icon = siteRow.icon
    siteInfo.value.title = siteRow.title
}else{
    setTimeout(() => {
        rejectProvide()
    },4)
}

const queueInfo:RequestItem = (await sendMessage('getQueue', requestId)) as RequestItem
// console.log('queueInfo: ', queueInfo)
if(queueInfo && networkType === 'regtest'){
    // @ts-ignore
    rpcUrl.value = queueInfo.data?.url || LocalNetUrl
}



const oldNetworkType = store.getNetWorkType()
// console.log('oldNetworkType: ', oldNetworkType)
const currentNetwork = ref(netWorkTypes[oldNetworkType])
const newNetwork = ref(networkType)
if(currentNetwork.value === newNetwork.value){
    setTimeout(() => {
        rejectProvide('Network not changed.')
    },4)
}

</script>
<style scoped></style>
