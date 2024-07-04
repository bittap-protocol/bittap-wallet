<template>
    <div class="w-full px-3">
        <div class="history-list">
            <div v-for="row in store.receiveAddressList" :key="row.taproot_output_key" class="item">
                <div v-if="row.asset_id" class="line">{{ row.asset_id }}</div>

                <div class="info">
                    <div class="it asset">
                        <div class="key">
                            {{ row.asset_name }}
                        </div>
                        <div class="value">
                            Asset
                        </div>
                    </div>
                    <div class="it amount">
                        <div class="key">
                            {{ Number(row.amount).toFixed(2) }}
                        </div>
                        <div class="value">
                            ≈$0
                        </div>
                    </div>
                    <div class="it c">
                        <button class="button my-2" @click="copyData(row.encoded)">Copy addr</button>
                    </div>
                </div>
            </div>
            <div v-if="loading" class="my-6 w-full flex flex-row justify-center items-center">
                <div class="loading loading-spinner text-primary my-16"></div>
            </div>
            <div v-if="!loading && store.receiveAddressList.length<=0" class="no-result w-full">
                <div class="flex flex-row justify-center items-center m-5">
                    <img src="@/assets/notrans.png" height="110" width="120" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store';
// import { DecodeAssetsAddress } from '@/popup/api/btc/blockStream'

export default {
    name: 'ReceiveTaproot',
    setup() {
        const store = useAppStore()
        return { store }  
    },
    data() {
        return {
            historyList: [],
            loading: true
        }
    },
    computed: {
        account() { 
            const store = useAppStore()
            return store.getActiveAccount()
        }
    },
    mounted() {
        this.initData()
    },
    methods: {
        async initData() { 
            this.loading = true
            await this.store.getReceiveAddress().then(res => { 
                console.log('res: ', res)
                this.loading = false
                return res
            })
        },
        async copyData(text: string){
            await navigator.clipboard.writeText(text)
            // @ts-ignore
            this.$root._toast('Copy successfully.', 'success')
        },
    }
}
</script>

<style lang="scss" scoped>
.history-list {
    .item {
        @apply flex flex-col justify-center items-center rounded-md my-3 p-2 shadow-lg ring-1 ring-gray-50;
        .line{
            @apply break-words leading-5 pt-1  w-full;
            // width: 95%;
            word-break: break-all;
            border-top: 1px dotted #9b96a0;
            &:first-child {
                border-top: none;;
            }
            
        }
        .info{
            @apply w-full flex flex-row flex-nowrap justify-between items-center;
            .it{
                .key{
                    @apply uppercase;
                }
                .value{
                    @apply text-gray-500;
                }
            }
        }
    }
}
</style>