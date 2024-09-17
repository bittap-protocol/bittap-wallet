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

                <div
                    class="flex flex-col flex-nowrap justify-start items-center h-4/5 min-h-96 py-2 w-full overflow-y-auto overflow-x-hidden">
                    <div v-for="(acc, index) in assets" :key="'acc-'+index" class="switchItem"
                        @click="checkedToken(acc)">
                        <div class="name-label uppercase">
                            <span class="font-bold">{{ acc.name }}</span>
                            <!-- ({{ acc.name }}) -->
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store';
import { NewAssetAddress } from '@/popup/api/btc/blockStream'
import { getQuery } from '@/popup/libs/tools'

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
        selectAsset(){
            // @ts-ignore
            my_modal_select_asset.showModal()
            // const store = useAppStore()
            this.store.updateAssets()
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
        @apply text-left w-full my-1 p-3  rounded-2xl shadow-sm ring-0 border border-gray-100 border-solid bg-gray-200 transition duration-200 ease-out hover:ease-in;
        &:hover, :focus, :active {
            @apply border-primary bg-primary cursor-pointer  shadow-sm ring-0 shadow-primary ring-primary;
            .font-bold{
                @apply text-white;
            }
        }
    }
    .show{
        .receiveAddress{
            word-break: break-all;
        }
    }
}
</style>