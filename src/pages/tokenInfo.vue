<template>
    <div class="token-info min-box">
        <ColorBox :info="asset_info"></ColorBox>
    </div>
</template>

<script>
import { useAppStore } from '@/stores/app.store'
import { getQuery } from '@/popup/libs/tools'

export default {
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
            }
        }
    },
    async created(){
        console.log('token info is created: ', [this.isBtc, this.asset_id])
        await this.initData()
    },
    methods: {
        async initData() {
            // @ts-ignore
            this.$root.setTitle(this.asset_id)
            const info = await this.store.getAssetsInfoForAssetID(this.asset_id)
            if(!info){
                this.$root._toast('not found')
                history.back()
                return 
            }
            this.asset_info = info.asset
            console.log('asset info: ', this.asset_info)
            this.$root.setTitle(this.asset_info.asset_name.toUpperCase())
        }
    }
}
</script>

<style lang="scss" scoped>
.token-info{
    @apply py-4;
}
</style>
