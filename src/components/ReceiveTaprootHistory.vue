<template>
    <div class="w-full px-3">
        <div class="history-list">
            <div v-for="row in historyList" :key="row.tweakPubKey" class="item">
                <div v-if="row.assets.amount>0" class="line"><strong>Asset:</strong>{{
    $root.formatToken(row.assets.amount, 8, row.assets.name)
                    }}</div>
                <div v-if="row.assets.asset_id" class="line"><strong>Asset ID:</strong>{{ row.assets.asset_id }}</div>
                <div class="line">
                    <strong>encoded:</strong> {{ row.encoded }}
                </div>
                <div class="line"><strong>internalPubkey:</strong> {{ row.internalPubkey }}</div>
                <div class="line"><strong>taproot_output_key:</strong> {{ row.taproot_output_key }}</div>
                <div class="line"><strong>tweakPubKey:</strong> {{ row.tweakPubKey }}</div>
                <button class="button my-2" @click="copyData(row.encoded)">Copy receive address</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store';
import { DecodeAssetsAddress } from '@/popup/api/btc/blockStream'

export default {
    name: 'ReceiveTaproot',
    data() {
        return {
            historyList: []
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
            const store = useAppStore()
            const assets = store.getAssetsListForSelect()
            console.log('assets: ', assets)
            store.getInternalKeyList().filter(e => e.encoded).forEach(row => { 
                console.log('row: ', row)
                const { tweakPubKey, internalPubkey, encoded, taproot_output_key } = row
                this.historyList.push({
                    tweakPubKey, internalPubkey, encoded, taproot_output_key, assets: { name: '', amount: 0, asset_id: '' }
                })
                DecodeAssetsAddress({ addr: encoded }).then(res => { 
                    const info = this.historyList.find(x => x.encoded === res.encoded)
                    console.log('res:', res, info)
                    if (info) { 
                        const assetInfo = assets.find(x => x.asset_id === res.asset_id)
                        info.assets.name = assetInfo ? assetInfo.name : 'Unknown asset'
                        info.assets.amount = res.amount
                        info.assets.asset_id = res.asset_id
                    }
                })
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