<template>
  <div class="w-full send">

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Please enter the transfer address
        </span>
      </div>
      <input v-model="formData.to" type="text" placeholder="Please enter" class="field" />
    </label>

    <div class="form-control w-full max-w-xs">
      <SelectGas v-model:value="formData.gas" />
    </div>

    <div v-if="showInfo && showInfo.asset_id && showInfo.asset_id.length > 5"
      class="w-full text-left leading-6 flex flex-col justify-center items-start bg-white rounded-md border border-sky-300 border-solid shadow-sm shadow-sky-300 my-4 p-4 addr-info">
      <div class="id w-full break-all">
        <strong>Asset Id:</strong> {{ showInfo.asset_id }}
      </div>
      <div class="asset_type w-full break-all">
        <strong>Asset Type:</strong> {{ showInfo.asset_type }}
      </div>
      <div class="asset_version w-full break-all">
        <strong>Version:</strong> {{showInfo.asset_version }}
      </div>
      <div class="amount w-full break-all">
        <strong>Amount:</strong> {{ $root.formatToken(showInfo.amount, 8, showInfo.name) }}
      </div>
      <div class="script_key w-full break-all">
        <strong>Script Key:</strong> {{ showInfo.script_key }}
      </div>
      <div class="internal_key w-full break-all">
        <strong>Internal Key:</strong> {{ showInfo.internal_key }}
      </div>
      <div class="taproot_output_key w-full break-all">
        <strong>Taproot Output Key:</strong> {{ showInfo.taproot_output_key }}
      </div>
    </div>

    <label class="form-control w-full max-w-xs my-4">
      <button :disabled="formData.to.length <= 60" class="button" @click="send">Send</button>
    </label>

  </div>
</template>

<script>
import { useAppStore } from '@/stores/app.store';
import { DecodeAssetsAddress, SendAssets } from '@/popup/api/btc/blockStream'

export default {
    name: 'SendTaproot',
    data() {
        return {
            formData: {
                to: '',
                gas: 100
            },
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
       async send(){
        SendAssets({
            tap_addrs: this.formData.to,
            fee_rate: this.formData.gas,
          }).then(res => {
            this.$root._toast('Success', 'success')
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
      @apply block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-400 sm:text-sm sm:leading-6;
    }
  }
  .addr-info{
    strong {
      @apply rounded-md bg-sky-400 p-1 mr-1;
    }
  }
}
</style>