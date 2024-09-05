<template>
    <div class="token-info min-box">
        <ColorBox :info="asset_info"></ColorBox>
        <div class="token-history">
            <TransferHistoryLogs
                :loading="loading"
                :logs="historyLogs"></TransferHistoryLogs>
        </div>
    </div>
    
</template>

<script>
import { useAppStore } from '@/stores/app.store'
import { getQuery } from '@/popup/libs/tools'
import { ListAssetHistory } from '@/popup/api/btc/blockStream'
import TransferHistoryLogs from '@/components/TransferHistoryLogs.vue'


export default {
    components: {
        TransferHistoryLogs
    },
    setup() {
        const store = useAppStore()
        store.setGoBackUrl('/')
        store.isGoBack()
        const asset_id = getQuery('asset_id')
        const isBtc = asset_id === 'Base'
        return {
            store, asset_id, isBtc
        }
    },
    data(){
        return {
            asset_info: {
                anchor_point: "",
                asset_id: "",
                asset_name: "",
                genesis_height: "",
                genesis_point: "",
                genesis_timestamp: "",
                total_supply:0,
                balance: 0,
                asset_type: ''
            },
            loading: false,
            historyLogs: []
        }
    },
    async created(){
        console.log('token info is created: ', [this.isBtc, this.asset_id])
        await this.initData()
    },
    methods: {
        async initData() {
            this.loading = true
            // @ts-ignore
            this.$root.setTitle('Loading...')
            const info = await this.store.getAssetsInfoForAssetID(this.asset_id)
            if(!info){
                this.$root._toast('not found')
                history.back()
                return 
            }
            this.asset_info = info.asset
            console.log('asset info: ', this.asset_info)
            this.$root.setTitle(this.asset_info.asset_name.toUpperCase())
            const wallet_id = this.store.getCurrentWalletId()
            ListAssetHistory({ wallet_id, asset_id: this.asset_id }).then(res=> {
                this.historyLogs = res
                console.log('this.historyLogs: ', this.historyLogs)
                this.loading = false
            }).catch(() => {
                this.loading = false
            }).finally(() => {
                this.loading = false
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.token-info{
    @apply py-4;
    .token-history{
        min-height: 25vh;
        @apply p-0 mt-[70px];
    }
}
</style>
