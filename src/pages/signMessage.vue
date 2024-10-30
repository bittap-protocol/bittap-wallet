
<script setup lang="ts">
// eslint-disable-next-line vue/no-v-html
import { sendMessage, RequestItem, getQuery, SiteInfo, showLoading, hideLoading } from '@/popup/libs/tools';
import { useAppStore } from '@/stores/app.store'

const store = useAppStore()
store.setGoBackUrl('')
store.notGoBack()

const requestId = getQuery('requestId')
const host = getQuery('host')


const signMessage = ref('')
const siteInfo = ref({
    host: "",
    href: "",
    icon: "",
    title: ""
} as SiteInfo)
const siteRow = store.getSiteInfo(host)
console.log('siteRow:', siteRow)
if(siteRow){
    siteInfo.value.host = siteRow.host
    siteInfo.value.href = siteRow.protocol + '//' + siteRow.host
    // @ts-ignore
    siteInfo.value.icon = siteRow.icon
    siteInfo.value.title = siteRow.title
}

// const accountActive = ref(store.activeAccount)


const queueInfo:RequestItem = (await sendMessage('getQueue', requestId)) as RequestItem
console.log('queueInfo: ', queueInfo)
if(queueInfo){
    // @ts-ignore
    signMessage.value = queueInfo.data?.msg
}


const rejectProvide = async (rejectMessage?:string) => {
    await sendMessage('RejectResult', {
        requestId,
        rejectMessage
    })
    setTimeout(() => {
        window.close()
    }, 200)
}
const resolveProvide = async () => {
    showLoading('Signature message...')
    const resultMessage = await store.signMessage(signMessage.value)
    hideLoading()
    await sendMessage('ResolveResult', {
        requestId,
        resultMessage
    })
    window.close()
}
</script>
<template>
    <div class="mt-[-40px]">
        <div class="flex w-full">
            <div class="w-1/12"></div>
            <div class="w-10/12">
                <div
                    class="flex bg-purple-200 rounded-md h-10 items-center justify-center"
                >
                    <img
                        src="@/assets/siteIcon.png"
                        :alt="siteInfo.title"
                        height="33"
                        width="33"
                        class="p-0"
                        />
                    <span>&nbsp;&nbsp;{{ siteInfo.href }}</span>
                </div>
                <div class="card place-items-center p-4">
                    <span class="text-base font-bold mb-3">
                        SignatureRequest
                    </span>
                    <span>Only sign this message if you fully understand</span>
                    <span>the content and trust the requesting site</span>
                </div>
                <div
                    class="card bg-purple-200 rounded-md h-25 py-2 pl-2 mb-1 h-[280px] break-all"
                >
                    <textarea readonly v-model="signMessage" class="w-full h-full bg-transparent border-none border-0 resize-none hover:border-0 focus:border-0 active:border-0 focus-within:border-0 focus:ring-0"></textarea>
                </div>
                <div class="flex pt-6 mb-0.5 justify-between">
                    <button
                        @click="rejectProvide"
                        class="border border-purple-500 text-purple-500 font-bold px-8 py-1 rounded-2xl"
                    >
                        Cancel
                    </button>
                    <button
                        @click="resolveProvide"
                        class="border border-purple-500 bg-purple-500 text-white font-bold px-8 rounded-2xl"
                    >
                        Signature
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped></style>
