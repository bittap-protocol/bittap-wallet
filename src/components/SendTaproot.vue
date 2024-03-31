<template>
  <div class="w-full send">

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Please enter the transfer address
        </span>
      </div>
      <input v-model="formData.to" type="text" placeholder="Please enter" class="field" />
    </label>

    <label class="form-control w-full max-w-xs my-4">
      <button class="button" @click="send">Send</button>
    </label>

  </div>
</template>

<script>
export default {
    name: 'SendTaproot',
    data() {
        return {
            formData: {
                to: '',
            }
        }
    },
    methods: {
        send(){
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
      @apply block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-400 sm:text-sm sm:leading-6;
    }
  }
}
</style>