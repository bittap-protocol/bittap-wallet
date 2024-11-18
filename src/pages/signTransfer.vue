
<script setup lang="ts">
// eslint-disable-next-line vue/no-v-html
import { AnchorVirtualPsbt, DecodeAssetsAddress, EstimateTxFee, PublishTransfer, PublishTransferBtcV2, TransferAssets, TransferBtc } from '@/popup/api/btc/blockStream';
import { sendMessage, RequestItem, getQuery, SiteInfo, showLoading, hideLoading, RequestSignTransaction, TxsStatus, toHex } from '@/popup/libs/tools';
import { useAppStore } from '@/stores/app.store'
import { Psbt } from 'bitcoinjs-lib'

const store = useAppStore()
store.setGoBackUrl('')
store.notGoBack()

const requestId = getQuery('requestId')
const host = getQuery('host')


const signMessage:Ref<RequestSignTransaction> = ref({
    recv_addr: '',
    receive_addr: '',
    amount: 0,
    min_conf: 6,
    fee_rate: 1,
    networkFee: 0,
})

const virtual_psbts = ref(null)
// @ts-ignore
const passive_asset_psbts = ref(null)

const requestType:Ref<string> = ref('')

const isLoading:Ref<boolean> = ref(false)
const psbts: Ref<Psbt[]> = ref([])


const taprootInfo = ref({
    amount: 0,
    asset_id: '',
    asset_name: ''
})

const siteInfo = ref({
    host: "",
    href: "",
    icon: "",
    title: ""
} as SiteInfo)
const siteRow = store.getSiteInfo(host)
// console.log('siteRow:', siteRow)
if(siteRow){
    siteInfo.value.host = siteRow.host
    siteInfo.value.href = siteRow.protocol + '//' + siteRow.host
    // @ts-ignore
    siteInfo.value.icon = siteRow.icon
    siteInfo.value.title = siteRow.title
}

// const accountActive = ref(store.activeAccount)

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
    const resultMessage = {
        status: TxsStatus.pending,
        txid: ''
    }
    isLoading.value = true
    showLoading('In process...')
    try{
        const { wallet_id } = store.getActiveAccount()
        if(requestType.value === 'Bittap-transferBtc'){
            const sendData =  {
                wallet_id,
                recv_addr: signMessage.value.recv_addr,
                amount: signMessage.value.amount,
                min_conf: signMessage.value.min_conf || 6,
                fee_rate: signMessage.value.fee_rate,
            }
            
            // @ts-ignore
            const funded_psbt = await TransferBtc(sendData).then((res) => res.data.funded_psbt)
            const final_psbt = await store.signAnchorPsbt(
                    Psbt.fromBase64(funded_psbt)
                )
            const tx = final_psbt.extractTransaction()
            // @ts-ignore
            const { tx_id } =  await PublishTransferBtcV2({ wallet_id,final_psbt: tx.toBuffer().toString('base64'),}).then(res => res.data)
            // @ts-ignore
            resultMessage.txid = tx_id
            isLoading.value = true
            hideLoading()
        }
        if(requestType.value ==='Bittap-sendTaprootAssets'){
            const network = store.getNetwork()
            // const { virtual_psbts, passive_asset_psbts } = await TransferAssets({
            //     wallet_id,
            //     address: signMessage.value.receive_addr,
            //     // @ts-ignore
            // }).then(res => res.data)
            const asset_psbts = []
            // @ts-ignore
            for (const virtual_psbt of virtual_psbts.value) {
                const psbt = await store.signTapprootAssetTransfer(
                    Psbt.fromHex(virtual_psbt, { network: network, maximumFeeRate: signMessage.value.fee_rate })
                )
                // console.log('psbt: ', psbt)
                asset_psbts.push(psbt.toBase64())
            }
            const anchor_psbt = await AnchorVirtualPsbt({
                wallet_id,
                asset_psbts,
                passive_asset_psbts: passive_asset_psbts.value,
                fee_rate: signMessage.value.fee_rate
                // @ts-ignore
            }).then(res => res.data.anchor_psbt)
            const anchor_psbt_sign = await store.signAnchorPsbt(
                Psbt.fromHex(anchor_psbt)
            )
            resultMessage.txid = await PublishTransfer({
                wallet_id,
                anchor_psbt: anchor_psbt_sign.toBase64(),
                // @ts-ignore
            }).then(res => toHex(res.data.transfer.anchor_tx_hash))
            isLoading.value = true
            hideLoading()
        }
        await sendMessage('Bittap-ResolveResult', {
            requestId,
            ...resultMessage    
        })
    }catch(e){
        console.error('sendMessage error: ', e)
        console.trace(e)
        rejectProvide(e+'')
    }
    window.close()
}
const activeAccount = computed(() => store.getActiveAccount())
const wallet_id = store.getCurrentWalletId()
const estimateFee = async () => {
    isLoading.value = true
    EstimateTxFee({
        // @ts-ignore
        wallet_id: wallet_id,
        type: requestType.value === 'Bittap-transferBtc' ? 1: 2,
        fee_rate: signMessage.value.fee_rate,
        amount: requestType.value === 'Bittap-transferBtc' ? signMessage.value.amount : undefined,
    }).then((txFee:number) => {
        // console.log('txFee: ', txFee)
        signMessage.value.networkFee = txFee
    }).finally(() => {
        isLoading.value = false
    })
}

const showHash = (hash:ArrayBuffer) => {
    return Buffer.from(hash).toString('hex')
}
const showScript = (scriptText:ArrayBuffer) => {
    return Buffer.from(scriptText).slice(1,33).toString('hex')
}

watch(() => signMessage.value.fee_rate, (k,v) => {
    if(k&& k!=v){
        // console.log('rate change: ', k, v, signMessage.value.fee_rate)
        estimateFee()
    }
})


const queueInfo:RequestItem = (await sendMessage('getQueue', requestId)) as RequestItem
// console.log('queueInfo: ', queueInfo)
if(queueInfo){
    // @ts-ignore
    signMessage.value = queueInfo.data
    signMessage.value.fee_rate = signMessage.value.fee_rate || 0
    signMessage.value.min_conf = signMessage.value.min_conf || 6
    requestType.value = queueInfo.type
    if(requestType.value === 'Bittap-sendTaprootAssets'){
        DecodeAssetsAddress({ addr: signMessage.value.receive_addr }).then(res => {
            // console.log('deCode:', res)
            taprootInfo.value.amount = res.amount
            taprootInfo.value.asset_id = res.asset_id
            taprootInfo.value.asset_name = res.asset_name
        })
        TransferAssets({
            wallet_id,
            address: signMessage.value.receive_addr,
            // @ts-ignore
        }).then(res => res.data).then(res => {
            console.log('TransferAssets res: ', res)
            const network = store.getNetwork()
            
            res.virtual_psbts.forEach((virtual_psbt:string) => {
                psbts.value.push(Psbt.fromHex(virtual_psbt, { network: network, maximumFeeRate: signMessage.value.fee_rate }))
            })
            console.log('psbts: ', psbts)
            virtual_psbts.value = res.virtual_psbts
            passive_asset_psbts.value = res.passive_asset_psbts
        })
    }
    
}else{
    rejectProvide()
}



</script>

<template>
  <div class="mt-[-50px]">
      <div class="flex flux-col justify-center items-center w-full px-4">
          <div class="w-full">
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

              <div v-if="requestType === 'Bittap-transferBtc'" class="btc">
                <div class="card place-items-center p-2 text-base font-bold">
                    Sign transaction
                </div>
                <div
                    class="card bg-purple-200 rounded-md grid h-25 place-items-center p-4"
                >
                    <div>spend amount</div>
                    <div v-if="signMessage.networkFee>0" class="font-bold text-xl">{{ $root.formatAssets($root._BTC2Number(signMessage.networkFee + signMessage.amount), 8, 'BTC') }}</div>
                    <div v-if="signMessage.networkFee>0">{{ $root.formatAssets($root._BTC2Number(signMessage.networkFee), 8, 'BTC') }} (network fee)</div>
                    <div v-if="(!signMessage.networkFee || signMessage.networkFee<=0) && isLoading" class="flex flex-row justify-center items-center p-2">
                        <span class="loading loading-ball loading-lg"></span>
                    </div>
                </div>
                <div class="card place-items-left pt-6 font-bold">
                    Form
                </div>
                <div class="flex bg-purple-200 rounded-md p-2 justify-between">
                    <span class="text-left">{{ $root._showMinMaxString(activeAccount.btcAddress,5,5) }}</span>
                </div>
                <div class="card place-items-left pt-6 font-bold">
                    To
                </div>
                <div
                    class="flex bg-purple-200 rounded-sm p-2 mb-0.5 justify-between"
                >
                    <span class="text-left">{{ $root._showMinMaxString(signMessage.recv_addr, 5,5) }}</span>
                    <span class="text-right">{{ $root.formatAssets($root._BTC2Number(signMessage.amount), 8, 'BTC') }}</span>
                </div>
            </div>


            <div v-if="requestType === 'Bittap-sendTaprootAssets'" class="taproot">
                <div class="card place-items-center p-2 text-base font-bold">
                    Sign transaction
                </div>
                <div
                    class="card bg-purple-200 rounded-md grid h-25 place-items-center p-4"
                >
                    <div>spend amount</div>
                    <div v-if="signMessage.networkFee>0" class="font-bold text-xl">{{ $root.formatAssets(taprootInfo.amount, 0, taprootInfo.asset_name.toUpperCase()) }}</div>
                    <div v-if="signMessage.networkFee>0">{{ $root.formatAssets($root._BTC2Number(signMessage.networkFee), 8, 'BTC') }} (network fee)</div>
                    <div v-if="(!signMessage.networkFee || signMessage.networkFee<=0) && isLoading" class="flex flex-row justify-center items-center p-2">
                        <span class="loading loading-ball loading-lg"></span>
                    </div>
                </div>
                <div class="psbt" v-for="(psbt, index) in psbts">
                    <div class="card place-items-left pt-6 font-bold">
                        Inputs ({{ psbt.inputCount }})
                    </div>
                    <div v-for="txInput in psbt.txInputs" :key="'tx-input-'+txInput.index" class="flex bg-purple-200 rounded-md p-2 justify-between">
                        <span class="text-left  break-all">{{ showHash(txInput.hash) }}</span>
                        <span class="text-right"> </span>
                    </div>

                    <div class="card place-items-left pt-6 font-bold">
                        Outputs ({{ psbt.txOutputs.length }})
                    </div>
                    <div
                        v-for="(txOutput, index) in psbt.txOutputs" :key="'tx-output-'+index" 
                        class="flex bg-purple-200 rounded-sm p-2 mb-0.5 justify-between"
                    >
                        <span class="text-left  break-all">{{ showScript(txOutput.script) }}</span>
                        <span class="text-right"> </span>
                    </div>
                </div>
                <div class="card place-items-left pt-6 font-bold">
                    Invoice
                </div>
                <div class="flex bg-purple-200 rounded-md p-2 justify-between">
                    <span class="text-left break-all">{{ signMessage.receive_addr }}</span>
                </div>
            </div>

              <SelectGas v-model="signMessage.fee_rate" :is-window="true" :network-fee="signMessage.networkFee" />

              <div class="flex pt-6 mb-2 justify-between">
                    <button class="border border-purple-500 text-purple-500 font-bold px-8 py-1 rounded-2xl" @click="rejectProvide('')">
                        Reject
                    </button>
                    <button
                        :disabled="isLoading || !signMessage.fee_rate"
                        class="border border-purple-500 bg-purple-500 text-white font-bold px-8 rounded-2xl"
                        @click="resolveProvide"
                    >
                        Confirm
                    </button>
                </div>
          </div>
      </div>
  </div>
</template>


<style scoped></style>
