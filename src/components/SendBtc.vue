<template>
  <div class="w-full send">

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Receiving address
        </span>
      </div>
      <input v-model="formData.recv_addr" type="text" placeholder="Please enter" class="field" />
    </label>
    <div v-if="formData.recv_addr.length > 0 && !isBtcAddressOk()" class="err-tips">
      The Btc receive address is incorrect, it should be a 44-character length address starting with bcrt1q
    </div>

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Amount
        </span>
        <span>
          Balance: {{ $root.formatAssets(store.currentBtcBalance, 8, 'BTC') }}
        </span>
      </div>
      <div class="input-field">
        <input v-model="formData.amount" type="text" :max="store.currentBtcBalance" placeholder="Please enter" class="field" />
        <button class="arrow" @click="formData.amount=store.currentBtcBalance">Max</button>
      </div>
    </label>
    

    <div class="form-control w-full max-w-xs">
      <SelectGas v-model="formData.fee_rate" />
    </div>

    <label class="form-control w-full max-w-xs my-4">
      <button :disabled="Number(formData.amount) <= 0 || formData.recv_addr.length != 44 || isSubmitting || !isBtcAddressOk()" class="button" @click="sendConfirm">Send</button>
    </label>

  </div>
</template>

<script>
import { PublishTransferBtc, TransferBtc } from '@/popup/api/btc/blockStream';
import { postToast, isValidBitcoinAddress } from '@/popup/libs/tools';
import { useAppStore } from '@/stores/app.store';
import { Psbt } from 'bitcoinjs-lib';
export default {
    name: 'SendBtc',
    // serverPrefetch() {
    //   const store = useStore(this.$pinia)
    //   console.log('store: ', store)
  // },
  setup() { 
    const store = useAppStore()
    return { store }
  },
  data() {
      return {
        formData: {
            wallet_id: '',
            recv_addr: '',
            amount: 0,
            min_conf: 6,
            fee_rate: 0
        },
        isSubmitting: false,
      }
  },
  watch: {
    'formData.fee_rate': function(k, v) {
      console.log('formData.fee_rate on change: ', k, v)
    },
    'formData.amount': function (k, v) { 
      if (k!=v && this.formData.amount > this.store.currentBtcBalance) { 
        this.formData.amount = this.store.currentBtcBalance
      }
    }
  },
  mounted() { 
    // this.formData.recv_addr = 'bcrt1qtqxmmcda462t5dez4t4nnezxzfa3r862h9qyrm'
    // this.formData.amount = 0.01
  },
  methods: {
    async sendConfirm() { 
      this.$root._main_confirm('Confirm to send?', 'After the transaction is sent, it takes 10-60 minutes to arrive at the account.', [
        { name: 'Cancel', }, 
        {
          name: 'Confirm', cls: ['btn-primary'], handle: (action, closeModal) => {
            closeModal()
            this.send()
          }
        }, 
      ])
    },
    isBtcAddressOk() { 
      return isValidBitcoinAddress(this.formData.recv_addr)
    },
    async send() {
      this.isSubmitting = true
      this.$root._showLoading('In process...')

      const { wallet_id } = this.store.getActiveAccount()
      this.formData.wallet_id = wallet_id
      const sendData = Object.assign({}, this.formData)
      sendData.amount = Number(sendData.amount) * 10 ** 8
      sendData.fee_rate = Number(sendData.fee_rate) * 10 ** 3
      await TransferBtc(sendData).then(res => res.data.funded_psbt).then(async funded_psbt => { 
        // console.log('funded_psbt: ', funded_psbt)
        const final_psbt = await this.store.signAnchorPsbt(Psbt.fromBase64(funded_psbt))
        // console.log('final_psbt: ', final_psbt)
        const tx = final_psbt.extractTransaction()
        return PublishTransferBtc({
          wallet_id,
          final_psbt: tx.toBuffer().toString('base64')
        }).then(res => { 
          console.log('PublishTransferBtc res: ', res)
          this.isSubmitting = false
          this.$root._hideLoading()
          this.$root._toast('Submit Success', 'success')
          this.formData.amount = 0
          this.formData.recv_addr = ''
          setTimeout(() => {
              this.$router.push('/')
            }, 2000)
        })
      }).catch(err => { 
        postToast(err+'','error')
        console.error('TransferBtc on error: ',err)
        this.isSubmitting = false
        this.$root._hideLoading()
      })
      
    }
  }
}
</script>

<style lang="scss" scoped>
.send{
  
}
</style>