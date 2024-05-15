<template>
  <div class="w-full send">

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Receiving address
        </span>
      </div>
      <input v-model="formData.to" type="text" placeholder="Please enter" class="field" />
    </label>

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Transfer quantity
        </span>
      </div>
      <input v-model="formData.amount" type="text" placeholder="Please enter" class="field" />
    </label>

    <div class="form-control w-full max-w-xs">
      <SelectGas v-model:value="formData.gas" />
    </div>

    <label class="form-control w-full max-w-xs my-4">
      <button class="button" @click="send">Send</button>
    </label>

  </div>
</template>

<script>
import { useAppStore } from '@/stores/app.store';
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
              to: '',
              amount: 0,
              gas: 2
          }
      }
  },
  watch: {
    'formData.gas': function(k, v) {
      console.log('formData.gas on change: ', k, v)
    }
  },
  methods: {
    async send() {
      console.log('send: ', this.$pinia.state, this.store)
      const res = await this.store.createNewUserTest()
      console.log('send res: ', res)
      this.$root._toast('Success', 'success')
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
  }
}
</style>