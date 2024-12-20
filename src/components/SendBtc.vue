<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="send">
    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Transfer address</span>
      </div>
      <input
        v-model="formData.recv_addr"
        type="text"
        placeholder="Please enter"
        class="field"
      />
    </label>
    <div
      v-if="formData.recv_addr.length >= 38 && !isBtcAddressOk()"
      class="err-tips"
    >
      The Btc receive address is incorrect, it should be a 44-character length
    </div>
    <div v-if="checkResultMessage && checkResultMessage.length>0" class="msg pb-2 mt-[-15px] pl-2" v-html="checkResultMessage">
    </div>
    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Amount</span>
        <span class="text-[#888f99] text-sm font-normal">
          Balance: {{ $root.formatAssets($root._BTC2Number(store.currentBtcBalance), 8, 'BTC') }}
        </span>
      </div>
      <div class="input-field">
        <input
          v-model="formData.amount"
          type="number"
          min="0.00000001"
          :max="$root._BTC2Number(store.currentBtcBalance)"
          placeholder="Please enter"
          class="field"
        />
        <button
          class="arrow"
          @click="setMax"
        >
          Max
        </button>
      </div>
    </label>

    <div class="form-control w-full max-w-xs">
      <SelectGas v-model="formData.fee_rate" />
    </div>

    <label class="form-control w-full max-w-xs ">
      <button
        :disabled="
          Number(formData.amount) <= 0 ||
          isSubmitting ||
          store.currentBtcBalance <
            formData.amount * 10 ** 8 + Number(formData.fee_rate)
        "
        class="button"
        @click="sendConfirm"
      >
        Send
      </button>
    </label>
  </div>
</template>

<script>
import { nslookupDomainInfo, TransferBtc,EstimateMaxBtc, PublishTransferBtcV2 } from '@/popup/api/btc/blockStream'
import { postToast, isValidBitcoinAddress, addTransactionStatusListen } from '@/popup/libs/tools'
import { useAppStore } from '@/stores/app.store'
import { Psbt } from 'bitcoinjs-lib'
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
        fee_rate: 0,
      },
      isSubmitting: false,
      checkTimer: null,
      checkResult: null,
      checkResultMessage: '',
      maxBalance: 0,
    }
  },
  watch: {
    'formData.fee_rate': function (k, v) {
      if (k != v) {
        this.checkUpdateFormData()
      }
    },
    'formData.amount': function (k, v) {
      if (k != v && this.formData.amount >= this.maxBalance) {
        this.checkUpdateFormData()
      }
    },
    'maxBalance': function (k, v) {
      if (k != v) {
        this.checkUpdateFormData()
      }
    },
    
    'formData.recv_addr': function (k, v) {
      if(k && k != v && this.formData.recv_addr.length>=3) {
        this.nslookupDomainInformation()
      }
    }
  },
  mounted() {
    // this.formData.recv_addr = 'bcrt1qtqxmmcda462t5dez4t4nnezxzfa3r862h9qyrm'
    // this.formData.amount = 0.01
    this.maxBalance = this.store.currentBtcBalance
  },
  methods: {
    checkUpdateFormData() {
      
      if (
        this.formData.fee_rate <= 0 ||
        this.formData.amount <= 0 ||
        this.formData.amount < this.maxBalance
      ) {
        return
      }
      this.refreshMaxBalance().then(()=> {
        this.formData.amount = Math.max(0,this.maxBalance)
      })
      
    },
    nslookupDomainInformation() {
      const nsCheck = () => {
        if(this.checkTimer) {
          clearTimeout(this.checkTimer)
          this.checkTimer=null
        }
        nslookupDomainInfo(this.formData.recv_addr).then(result => {
          if(result.isAddress){
            this.checkResultMessage = result.data ? 'TNA Domin: <span class="text-primary">8888.btc</span>' : ''
          }else{
            this.checkResultMessage =  result.data ? 'Address: <span class="text-primary">'+this.$root._showMinMaxString(result.data.owner,8,8)+'</span>': ''
          }
        })
      }
      this.checkTimer = setTimeout(() => {
        nsCheck()
      }, 500)
    },
    setMax() {
      const maxV = Math.max(
        0,
        Number(
          Number(
            (this.store.currentBtcBalance -
              Number(this.formData.fee_rate)) /
              10 ** 8
          ).toFixed(6)
        )
      )
      this.formData.amount = maxV
      this.maxBalance = maxV
      this.refreshMaxBalance()
      
    },
    async refreshMaxBalance(){
      const wallet_id = this.store.getCurrentWalletId()
      return EstimateMaxBtc({
        wallet_id,
        min_conf: 6,
        fee_rate: this.formData.fee_rate
      }).then(amount => {
        this.formData.amount = amount/(10 ** 8)
        this.maxBalance = this.formData.amount
      })
    },
    async sendConfirm() {
      this.$root._main_confirm(
        'Confirm to send?',
        'After the transaction is sent, it takes 10-60 minutes to arrive at the account.',
        [
          { name: 'Cancel' },
          {
            name: 'Confirm',
            cls: ['btn-primary'],
            handle: (action, closeModal) => {
              closeModal()
              this.send()
            },
          },
        ]
      )
    },
    isBtcAddressOk() {
      return isValidBitcoinAddress(this.formData.recv_addr)
    },
    async send() {
      this.isSubmitting = true
      this.$root._showLoading('In process...')
      
      const trycatchFun = (err) => {
        postToast(err + '', 'error')
        console.error('TransferBtc on error: ', err)
        this.isSubmitting = false
        this.$root._hideLoading()
      }
      const { wallet_id } = this.store.getActiveAccount()
      this.formData.wallet_id = wallet_id
      const sendData = Object.assign({}, this.formData)
      sendData.amount = Math.floor(Number(sendData.amount) * 10 ** 8)
      // sendData.fee_rate = Number(sendData.fee_rate) * 10 ** 3
      sendData.fee_rate = Number(sendData.fee_rate)
      await TransferBtc(sendData)
        .then((res) => res.data.funded_psbt)
        .then(async (funded_psbt) => {
          // console.log('funded_psbt: ', funded_psbt)
          const final_psbt = await this.store.signAnchorPsbt(
            Psbt.fromBase64(funded_psbt)
          )
          // console.log('final_psbt: ', final_psbt)
          const tx = final_psbt.extractTransaction()
          return PublishTransferBtcV2({
            wallet_id,
            final_psbt: tx.toBuffer().toString('base64'),
          }).then(res => res.data.tx_id)
            .then(tx_id => {
              addTransactionStatusListen([tx_id])
              this.isSubmitting = false
              this.$root._hideLoading()
              this.$root._toast('Submit Success', 'success')
              this.formData.amount = 0
              this.formData.recv_addr = ''
              setTimeout(() => {
                this.$router.push('/')
              }, 2000)
            })
            .catch((err) => {
              trycatchFun(err)
            })
        })
        .catch((err) => {
          trycatchFun(err)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.send {
  @apply mx-4;
}
</style>
