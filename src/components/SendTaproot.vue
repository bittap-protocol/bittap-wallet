<template>
  <div class="w-full send">

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Invoice
        </span>
      </div>
      <div class="encode">
        <textarea class="textarea" v-model="formData.to" rows="8" placeholder="Enter invoice" />
         <div v-if="showInfo && showInfo.asset_id && showInfo.asset_id.length > 5"
      class="addr-info">
          <div class="item">
            <div class="symbol">
              <strong class="text-white">Asset</strong> 
              <div class="v">
                 {{ showInfo.name }}
              </div>
            </div>
            <div class="amount">
              <strong class="text-white">Amount</strong> 
              <div class="v">
                {{ Number(showInfo.amount).toFixed(2) }}
              </div>
            </div>
          </div>
          <div class="id w-full break-all">
            <strong  class="text-white">Id:</strong> {{ showInfo.asset_id }}
          </div>
        </div>
      </div>
      
    </label>

   


    <div class="form-control w-full max-w-xs">
      <SelectGas v-model="formData.gas" />
    </div>

    <label class="form-control w-full max-w-xs my-4">
      <button :disabled="formData.to.length <= 60 || isSubmitting || showInfo.name === 'Unknown asset'" class="button" @click="sendConfirm">Send</button>
    </label>
  </div>
</template>

<script>
import { Psbt } from 'bitcoinjs-lib'
import { useAppStore, PathKey } from '@/stores/app.store';
import { AnchorVirtualPsbt, DecodeAssetsAddress, TransferAssets, PublishTransfer } from '@/popup/api/btc/blockStream'
import { toHex } from '@/popup/libs/tools';
// import { decodeUnknownKeyVals } from '@/popup/libs/tools';

export default {
  name: 'SendTaproot',
  setup() { 
    const store = useAppStore()
    return { store }
  },
  data() {
      return {
          formData: {
              to: '',
              gas: 0
        },
          isSubmitting: false,
          showInfo: {
            "encoded": '', // <string> 
            "asset_id": '', // <bytes> 
            "asset_type": '', // <AssetType> 
            "amount": '', // <uint64> 
            "group_key": '', // <bytes> 
            "script_key": '', // <bytes> 
            "internal_key": '', // <bytes> 
            "tapscript_sibling": '', // <bytes> 
            "taproot_output_key": '', // <bytes> 
            "proof_courier_addr": '', // <string> 
            "asset_version": '', // <AssetVersion> 
              name: 'Unknown',
          }
      }
  },
  watch: {
    'formData.to': function(k,v) {
      if(k!=v && k && this.formData.to.length > 64 ) {
        this.showAddressInfo()
      }
    }
  },
  methods: {
    showAddressInfo() {
      const store = useAppStore()
      const assets = store.getAssetsListForSelect()
      console.log(' this.formData: ', this.formData)
      DecodeAssetsAddress({ addr: this.formData.to }).then(res => {
        const assetInfo = assets.find(x => x.asset_id === res.asset_id)
        res.name = assetInfo ? assetInfo.name : 'Unknown asset'
        this.showInfo = res
      })
    },
    async sendConfirm() { 
      this.$root._main_confirm('Confirm to send?', 'After the transaction is sent, it takes 10-60 minutes to arrive at the account.', [
        { name: 'Cancel', }, 
        // { name: 'Cancel2', cls: ['btn-info'] }, 
        // { name: 'Cancel3', cls: ['btn-success'] }, 
        // { name: 'Cancel4', cls: ['btn-warning'] }, 
        // { name: 'Cancel5', cls: ['btn-error'] }, 
        // { name: 'Cancel5', cls: ['btn-secondary'] }, 
        // {name: 'Cancel5', cls: ['btn-accent']}, 
        // { name: 'Cancel5', cls: ['btn-ghost'] }, 
        // { name: 'Cancel5', cls: ['btn-link'] }, 
        // { name: 'Cancel5', cls: ['btn-neutral'] }, 
        {
          name: 'Confirm', cls: ['btn-primary'], handle: (action, closeModal) => {
            closeModal()
            this.send()
          }
        }, 
      ], {
        // actionCls: ['flex-col', 'space-y-2']
      })
    },
    async send() {
      const ac = this.store.getActiveAccount()
      const childNodePrimary = await this.store.getCurrentAccountKeyPair(PathKey.m86)
      // console.log('childNodePrimary: ', childNodePrimary)
      const network = this.store.getNetwork()
      const maximumFeeRate = this.formData.gas
      this.isSubmitting = true
      this.$root._showLoading('In process...')
      TransferAssets({
          wallet_id: ac.wallet_id,
          address: this.formData.to,
      }).then(async res => {
        // console.log('TransferAssets res:', res)
        const { virtual_psbts, passive_asset_psbts } = res.data
        // console.log('funded_virtual_psbt decode: ', virtual_psbts, passive_asset_psbts)
        const asset_psbts = []
        for (const virtual_psbt of virtual_psbts) {
          const psbt = await this.store.signTapprootAssetTransfer(Psbt.fromHex(virtual_psbt, { network: network, maximumFeeRate }))
          // console.log('psbt: ', psbt)
          asset_psbts.push(psbt.toBase64())
        }
        AnchorVirtualPsbt({
          wallet_id: ac.wallet_id,
          asset_psbts,
          passive_asset_psbts
        }).then(async res => { 
          // console.log('AnchorVirtualPsbt res: ', res)
          const { anchor_psbt } = res.data
          const anchor_psbt_sign = await this.store.signAnchorPsbt(Psbt.fromHex(anchor_psbt))
          // console.log('anchor_psbt_sign: ', anchor_psbt_sign, anchor_psbt_sign.toBase64())
          PublishTransfer({
            wallet_id: ac.wallet_id,
            anchor_psbt: anchor_psbt_sign.toBase64()
          }).then(res => { 
            const txHash = toHex(res.data.transfer.anchor_tx_hash)
            // console.log('PublishTransfer res: ', res)
            this.$root._toast('Publish transfer success <br /> Tx Hash: ' + txHash, 'success')
            this.formData.to = ''
            this.isSubmitting = false
            this.$root._hideLoading()
            setTimeout(() => {
              this.$router.push('/')
            }, 2000)
          })
        })
        
      }).catch(e => { 
        postToast(e+'','error')
        console.error('on error: ', e)
        this.isSubmitting = false
        this.$root._hideLoading()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.send{
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
      @apply block w-full rounded-md border-0 py-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6;
    }
    .encode {
      @extend .field;
      @apply p-1;
      .textarea{
        @apply w-full ring-0 ring-inset border-0 bg-white outline-none shadow-none resize-none;
        &:hover,&:active, &:focus {
          @apply ring-inset border-0 ring-0 ;
        }
      }
    }
  }
  .addr-info{
    @apply text-left m-2 leading-6 flex flex-col justify-center items-start bg-gray-100 rounded-md my-4 p-4 ;
    .item{
      @apply w-full flex flex-row justify-between items-start;
      .symbol, .amount {
        @apply w-[50%];
      }
      .symbol {
        .v{
          @apply uppercase;
        }
      }
      .v{
        @apply text-black;
      }
    }
    strong {
      @apply text-gray-400;
    }
  }
}
</style>