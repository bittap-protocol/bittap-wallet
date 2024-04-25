<template>
    <div class="w-full receiveTaproot px-4">
        <div v-if="receiveAddress.length<=0" class="form w-full">
            <label class="form-control w-full max-w-xs">
                <div class="label">
                    <span class="label-text">Receive asset
                    </span>
                </div>
                <div class="join">
                    <input v-model="formData.name" type="text" readonly placeholder="Please select" class="join-item" />
                    <button class="btn btn-primary join-item rounded-r-full" @click="selectAsset">Select asset</button>
                </div>
            </label>

            <label class="form-control w-full max-w-xs">
                <div class="label">
                    <span class="label-text">Receive quantity
                    </span>
                </div>
                <input v-model="formData.amount" type="number" min="1" placeholder="Please enter" class="field" />
            </label>

            <label class="form-control w-full max-w-xs my-4">
                <button class="button" @click="createReceive">Create receive</button>
            </label>
        </div>
        <div v-if="receiveAddress.length >= 1" class="show w-full py-4">
            <div class="text-left my-4 text-red-500">
                Please note that the collection address is for one-time use. Please do not send multiple transactions to
                these addresses
            </div>
            <div class="text-left receiveAddress w-full px-2">
                {{ receiveAddress }}
            </div>
            <div class="my-4">
                <button class="button" @click="copyData">Copy</button>
            </div>
        </div>

        <div class="w-full flex flex-col justify-center">
            <router-link to="/common/receiveList" class="btn btn-neutral">History
                receive</router-link>
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
                            <span class="font-bold">{{ acc.asset_genesis.name }}</span>
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
import { NewAddressAssets } from '@/popup/api/btc/blockStream'

export default {
    name: 'ReceiveTaproot',
    setup(){
        const store = useAppStore()
        const account = computed(() => store.getActiveAccount())
        const historyList = computed(() => store.getInternalKeyList().filter(e => e.encoded))
        return {
            account,
            historyList
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
    methods: {
        async createReceive() {
            const store = useAppStore()

            const { scriptPubKey, internalPubkey, tweakPubKey  } = store.generateInternalKey()

            const sendData = {
                asset_id: this.formData.assetsId,
                amt: this.formData.amount,
                script_key: {
                    // pub_key: scriptPubKey,
                    pub_key: tweakPubKey,
                    key_desc: {
                        raw_key_bytes: scriptPubKey,
                        key_loc: {
                            "key_family":"212",
                            "key_index":"0"
                        }
                    }
                },
                internal_key: {
                    raw_key_bytes: internalPubkey,
                    key_loc: {
                        "key_family":"212",
                        "key_index":"0"
                    }
                },
            }
            console.log('NewAddressAssets sendData: ',sendData )
            await NewAddressAssets(sendData).then(res => {
                console.log('NewAddressAssets: ', res)
                // @ts-ignore
                this.$root._toast('Create receive address success', 'success')
                this.receiveAddress = res.encoded
                store.updateInternalKeyEncoded(res, internalPubkey)
            })

        },
        selectAsset(){
            // @ts-ignore
            my_modal_select_asset.showModal()
            const store = useAppStore()
            store.updateAssets()
            this.assets = store.getAssetsList()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        checkedToken(token: any) {
            this.formData.name = token.asset_genesis.name
            this.formData.assetsId = token.asset_genesis.asset_id
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
    .form-control{
        .label{
        .faq{
            height: 16px;
            width: 16px;
            line-height: 16px;
            border: 1px solid #333;
            border-radius: 50px;
            background-color: transparent;
            padding: 1px;
        }
        }
        .field {
            @apply block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-400 sm:text-sm sm:leading-6;
        }
    }
    .switchItem{
    @apply text-left w-full my-1 p-3 rounded-md shadow-sm border border-gray-200 border-solid bg-gray-200 transition duration-200 ease-out hover:ease-in;
        &:hover, :focus, :active{
            @apply border-sky-400 bg-sky-400 cursor-pointer shadow-sm shadow-sky-500;
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