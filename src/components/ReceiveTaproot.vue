<template>
    <div class="receiveTaproot">
        <div v-if="receiveAddress.length<=0" class="form w-full">
            <label class="form-control w-full max-w-xs">
                <div class="label">
                    <span class="label-text">Asset
                    </span>
                </div>
                <div class="join-input">
                    <input v-model="formData.name" type="text" readonly placeholder="Please select"
                        class="item item-l token-name" />
                    <button class="item-r" @click="selectAsset">Select asset</button>
                </div>
            </label>

            <label class="form-control w-full max-w-xs">
                <div class="label">
                    <span class="label-text">Amount
                    </span>
                </div>
                <input v-model="formData.amount" type="number" min="1" step="1" placeholder="Enter amount" class="field" />
            </label>

            <label class="form-control w-full max-w-xs mt-2">
                <button class="button" @click="createReceive">Create Invoice</button>
            </label>
        </div>
        <div v-if="receiveAddress.length >= 1" class="show w-full py-4">
            <div class="text-left receiveAddress w-full px-2">
                {{ receiveAddress }}
            </div>
            <div class="my-4">
                <button class="button" @click="copyData">Copy</button>
            </div>
        </div>

        <div class="w-full flex flex-col justify-center">
            <router-link to="/common/receiveList" class="btn btn-link no-underline">Invoice History</router-link>
        </div>

        <dialog id="my_modal_select_asset" class="modal">
            <div class="modal-box rounded-md">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 class="font-bold text-lg">Select asset</h3>
                <div class="search">
                    <div class="box">
                        <input type="text" class="in" placeholder="Enter asset name" v-model="searchForm.name">
                        <button class="btn btn-primary" :disabled="searchForm.loading" @click="searchAssetForName">
                            <span v-if="searchForm.loading" class="loading loading-spinner loading-xs"></span>
                            <span v-else>Search</span>
                        </button>
                    </div>
                </div>
                <div
                    class="flex flex-col flex-nowrap justify-start items-center h-4/5 min-h-96 py-2 w-full overflow-y-auto overflow-x-hidden">
                    <div v-for="(acc, index) in assets" :key="'acc-'+index" class="switchItem"
                        @click="checkedToken(acc)">
                        <div class="name-label">
                            <div class="name">{{ acc.name }}</div>
                            <div class="id">Asset_id: {{ acc.asset_id }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store';
import { ListAssetsQuery, NewAssetAddress } from '@/popup/api/btc/blockStream'
import { getQuery, isAssetId, toHex } from '@/popup/libs/tools'

export default {
    name: 'ReceiveTaproot',
    setup(){
        const store = useAppStore()
        const account = computed(() => store.getActiveAccount())
        const asset_id = getQuery('asset_id')
        const asset_type = getQuery('asset_type')
        return {
            account,
            store, 
            asset_id, 
            asset_type
        }
    },
    data() {
        return {
            formData: {
                name: '',
                amount: '',
                assetsId: '',
            },
            searchForm:{
                loading: false,
                name: '',
            },
            assets: [],
            receiveAddress: '',
            selectAssetInfo: null
        }
    },
    watch: { 
        'formData.amount': function(k, v) {
            if (k != v && this.formData.amount) { 
                this.formData.amount = Number.parseInt(this.formData.amount)+''
            }
         }
    },
    async mounted(){
        console.log('this.asset_id: ', this.asset_id)
        if(this.asset_id) {
            const token = await this.store.getAssetsInfoForAssetID(this.asset_id)
            console.log('token: ', token)
            this.formData.name = token.asset.asset_name
            this.formData.assetsId = token.asset.asset_id
            this.selectAssetInfo = token.asset
        }
    },
    methods: {
        async createReceive() {
            const store = useAppStore()
            const activeAccount = store.getActiveAccount()
            console.log('activeAccount: ', activeAccount)
            NewAssetAddress(activeAccount.wallet_id, this.formData.assetsId, this.formData.amount).then(res => { 
                const addInfo = Object.assign(this.formData, {
                    address: res.data.address
                })
                console.log('addInfo:', addInfo)
                // @ts-ignore
                this.$root._toast('Create receive address success', 'success')
                this.receiveAddress = res.data.address
            })

        },
        async searchAssetForName(){
            console.log('searchAssetForName:',this.searchForm.name)
            if(!this.searchForm.name || this.searchForm.loading) {
                return 
            }
            const assets_id = isAssetId(this.searchForm.name ) ? this.searchForm.name : undefined
            const assets_name = !isAssetId(this.searchForm.name ) ? this.searchForm.name : undefined
            this.searchForm.loading = true
            ListAssetsQuery(assets_name, assets_id, 1, 9999).then((res) => {
                console.log('ListAssetsQuery res: ', res)
                if (res) {
                    // @ts-ignore
                    this.assets = res.map(x => {
                        return {
                            asset_id: toHex(x.asset.asset_id),
                            asset_type: x.asset.asset_type || 0,
                            total_supply: Number(x.asset.total_supply),
                            name: x.asset.asset_name,
                        }
                    })
                }
                this.searchForm.loading = false
            }).finally(() => {
                this.searchForm.loading = false
            })
        },
        selectAsset(){
            // @ts-ignore
            my_modal_select_asset.showModal()
            // const store = useAppStore()
            // this.store.updateAssets().then(res => {

            // })
            // @ts-ignore
            this.assets = this.store.getAssetsListForSelect()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        checkedToken(token: any) {
            this.formData.name = token.name
            this.formData.assetsId = token.asset_id
            this.selectAssetInfo = token
            // @ts-ignore
            my_modal_select_asset.close()
        },
        async copyData(){
            await navigator.clipboard.writeText(this.receiveAddress)
            // @ts-ignore
            this.$root._toast('Copy successfully.', 'success')
        }
    }
}
</script>

<style lang="scss" scoped>
.receiveTaproot{
    @apply mx-4;
    .form-control{
        
    .join-input{
        @apply w-full flex flex-row justify-between items-center flex-nowrap bg-primary rounded-2xl border-[1px] border-gray-300;
        &:has(.item-l:focus), &:has(.item-l:hover),
            &:has(.item-l:active){
            @apply border-primary bg-primary;
        }
        .item{
            &-l{
                @apply ring-0 outline-none border-none rounded-l-[15px];
                flex: 1;
            }
            &-r{
                @apply text-white ;
                flex: 1;
                padding: 10px 5px;
            }
            &.token-name{
                @apply uppercase;
                &::placeholder{
                    @apply normal-case;
                }
            }
        }
        }
    }
    .switchItem{
        @apply text-left w-full flex flex-col justify-center items-center my-1 p-3  rounded-2xl shadow-sm 
            ring-0 ring-inset border border-gray-100 border-solid bg-gray-200 transition duration-200 ease-out hover:ease-in;
        .name-label{
            .name{
                @apply break-all uppercase font-bold text-base text-primary;
            }
            .id{
                @apply break-all text-xs text-gray-600;
            }
        }
        &:hover, :focus, :active {
            @apply border-primary bg-primary cursor-pointer  shadow-sm ring-0 shadow-primary ring-primary;
            .name{
                @apply text-white break-all;
            }
            .id{
                @apply break-all text-gray-300;
            }
        }
    }
    .show{
        .receiveAddress{
            word-break: break-all;
        }
    }
    #my_modal_select_asset{
        .search{
            .box{
                @apply flex flex-row justify-between px-0 py-0 items-center w-full rounded-2xl ring-1 ring-inset ring-gray-300 border-[1px] border-solid border-gray-300 overflow-hidden;
                &:has(.in:focus), &:has(.in:hover), &:has(.in:active){
                    @apply border-primary border-[1px] border-solid;
                }
                .in{
                    border-image-width:0px;
                    padding-top: 0.5rem;
                    padding-right: 0.75rem;
                    padding-bottom: 0.5rem;
                    padding-left: 0.75rem;
                    text-indent: 10px;
                    @apply  bg-transparent m-0 border-0 ring-0 shadow-none rounded-br-[0px] rounded-tr-[0px]  
                    focus:ring-0 hover:right-0 focus:border-0 hover:border-0 focus:shadow-none active:shadow-none hover:border-none px-0 py-0;
                }
                .btn-primary{
                    @apply border-l-0 rounded-bl-[0px] rounded-tl-[0px] rounded-none m-0 w-[100px];
                }
            }
        }
    }
}
</style>