<template>
    <div class="w-full px-3">
        <div class="history-list">
            <div v-for="row in historyList" :key="row.address" class="item">
                <div class="line">
                    <strong>encoded:</strong> {{ row.encoded }}
                </div>
                <div class="line"><strong>internalPubkey:</strong> {{ row.internalPubkey }}</div>
                <div class="line"><strong>taproot_output_key:</strong> {{ row.taproot_output_key }}</div>
                <div class="line"><strong>tweakPubKey:</strong> {{ row.tweakPubKey }}</div>
                <div class="line"><strong>Status: </strong>{{ showStatus(row) }}
                </div>
                <button class="button my-2" @click="copyData(row.encoded)">Copy receive address</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store';
import { AddrReceives } from '@/popup/api/btc/blockStream'

export default {
    name: 'ReceiveTaproot',
    setup() {
        
        const store = useAppStore()
        const account = computed(() => store.getActiveAccount())
        const historyList = computed(() => store.getInternalKeyList().filter(e => e.encoded))
        // const historyList = computed(() => store.getInternalKeyList())
        console.log('history list: ', historyList)
        return {
            account,
            historyList
        }
    },
    data() {
        return {
            listStatus: {}
        }
    },
    methods: {
        async copyData(text: string){
            await navigator.clipboard.writeText(text)
            // @ts-ignore
            this.$root._toast('Copy successfully.', 'success')
        },
        getConfirmStatus(row: any) { 
            // const store = useAppStore()
            // const bc1p = store.convertTaprootOutputKeyToBech32m(taproot_output_key)
            // @ts-ignore
            if (!this.listStatus[row.internalPubkey] || this.listStatus[row.internalPubkey] === '...') {
                AddrReceives(row.encoded).then(res => {
                    console.log('AddrReceives on res: ', res)
                    // @ts-ignore
                    if (res.events.length > 0) {
                        this.listStatus[row.internalPubkey] = res.events[0].status
                    } else { 
                        this.listStatus[row.internalPubkey] = 'Unknown'
                    }
                }).catch(e => {
                    console.warn('AddrReceives on error: ', e)
                    // @ts-ignore
                    this.listStatus[row.internalPubkey] = 'Unknown'
                })
            }
            return this.statusText(row.internalPubkey)
        },
        statusText(internal_key: string) {
            // @ts-ignore
            return Object.prototype.hasOwnProperty.call(Object.prototype, this.listStatus, internal_key) ? this.listStatus[internal_key] : '...'
        },
        showStatus(row: any) { 
            return this.getConfirmStatus(row)
        }
    }
}
</script>

<style lang="scss" scoped>
.history-list {
    .item {
        @apply flex flex-col justify-center items-center border border-gray-200 border-solid rounded-md my-3 p-2 bg-gray-200;
        .line{
            @apply break-words leading-5 pt-1  w-full;
            // width: 95%;
            word-break: break-all;
            border-top: 1px dotted #9b96a0;
            &:first-child {
                border-top: none;;
            }
            strong {
                @apply rounded-md bg-sky-400 p-1 mr-1;
            }
        }
    }
}
</style>