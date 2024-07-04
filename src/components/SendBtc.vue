<template>
  <div class="w-full send">

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Receiving address
        </span>
      </div>
      <input v-model="formData.recv_addr" type="text" placeholder="Please enter" class="field" />
    </label>

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
      <button :disabled="Number(formData.amount) <= 0 || formData.recv_addr.length != 44 || isSubmitting" class="button" @click="send">Send</button>
    </label>

  </div>
</template>

<script>
import { PublishTransferBtc, TransferBtc } from '@/popup/api/btc/blockStream';
import { postToast } from '@/popup/libs/tools';
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
    this.formData.recv_addr = 'bcrt1qtqxmmcda462t5dez4t4nnezxzfa3r862h9qyrm'
    this.formData.amount = 0.01
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
    async send() {
      this.isSubmitting = true
      this.$root._showLoading('In process...')

      const { wallet_id } = this.store.getActiveAccount()
      this.formData.wallet_id = wallet_id
      const sendData = Object.assign({}, this.formData)
      sendData.amount = Number(sendData.amount) * 10 ** 8
      sendData.fee_rate = Number(sendData.fee_rate) * 10 ** 3
      // const funded_psbt = "cHNidP8BAHECAAAAAYm+wkRZ+OMYEdjXX3vr4/tNL3Tdb/uH6OYh2glgYFIQAQAAAAD/////AkBCDwAAAAAAFgAUkVU5H44jHDOGesmnEZH5Ms1Fx7XlHr4dAAAAABYAFD++8w5LgWfRECzde32szKm1lkhzAAAAAAABAN4CAAAAAAEBWL2PtS6ACzvzxxsCuyys69Lwxehorvexe4qhk7kFcUIAAAAAAP3///8C/Ig1dwAAAAAWABSGNY6I/3CAB3JRH60YFQHmwqJp0QBlzR0AAAAAFgAUP77zDkuBZ9EQLN17fazMqbWWSHMCRzBEAiBa8jZhbS5RkTe02Rb/0+WJJlbvGzEWUFWr5fxxv/W0PQIgXdlrgeD9h0C/hTDPg+6GbdghzT2R5MDDNMwphvUTd5wBIQLf/bGAj+t0IeDTiAD8q9NMVme1yUsBAVyXSrRld4yzNQAAAAABAR8AZc0dAAAAABYAFD++8w5LgWfRECzde32szKm1lkhzAQMEAQAAACIGAgtQA5qyvBsf6OoBaVsCDU2FE8aAdDaSaVZ7z1W3jRZEGAAAAABUAACAAAAAgAAAAIAAAAAAAAAAAAAAAA=="
      // const psbt = Psbt.fromBase64(funded_psbt)
      // console.log('psbt: ', psbt)
      // const finPsbt = await this.store.signAnchorPsbt(psbt)
      // console.log('finPsbt: ', finPsbt.toBase64())
      await TransferBtc(sendData).then(res => res.data.funded_psbt).then(async funded_psbt => { 
        console.log('funded_psbt: ', funded_psbt)
        const final_psbt = await this.store.signAnchorPsbt(Psbt.fromBase64(funded_psbt))
        console.log('final_psbt: ', final_psbt)
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
      @apply block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6;
    }
    .input-field{
      .arrow{
        position: absolute;
        margin-top: -25px;
        right: 10%;
        @apply text-primary font-bold;
        &:hover {
          @apply opacity-80;
        }
      }
    }
  }
}
</style>