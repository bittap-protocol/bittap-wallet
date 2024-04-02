<template>
  <div class="min-box w-full createAssets px-3">

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Assets name
          <div class="tooltip tooltip-bottom" data-tip="The full name of the asset">
            <div class="badge badge-info faq">?</div>
          </div>
        </span>
      </div>
      <input v-model="formData.name" type="text" placeholder="Please enter" class="field" />
    </label>
    
    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Quantity issued
          <div class="tooltip tooltip-bottom" data-tip="Total supply of assets after casting">
            <div class="badge badge-info faq">?</div>
          </div>
        </span>
      </div>
      <input v-model="formData.amount" type="number" min="1" placeholder="Please enter" class="field" />
    </label>

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Asset symbol
          <div class="tooltip tooltip-bottom" data-tip="Asset name abbreviation, 1-5 characters">
            <div class="badge badge-info faq">?</div>
          </div>
        </span>
      </div>
      <input v-model="formData.symbol" type="text" minlength="1" maxlength="5" placeholder="Please enter" class="field" />
    </label>

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Asset description
          <div class="tooltip tooltip-bottom" data-tip="A short description of the asset, including item information and a description of the purpose of the currency">
            <div class="badge badge-info faq">?</div>
          </div>
        </span>
      </div>
      <textarea rows="5" v-model="formData.des" type="text" placeholder="A short description of the asset, including item information and a description of the purpose of the currency" class="field" />
    </label>

    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Asset picture 
          <div class="tooltip tooltip-bottom" data-tip="To represent the image of the asset, it is recommended to upload an 800*800 square image, the image will be stored on the ipfs network, you can also manually enter the image URL that can be accessed by yourself">
            <div class="badge badge-info faq">?</div>
          </div>
        </span>
        <span class="label-text-alt">
          <label class="cursor-pointer label">
            <span class="label-text mr-2">Custom URL</span> 
            <input v-model="showInputFile" type="checkbox" class="toggle toggle-md nob" />
          </label>
        </span>
      </div>
      <input v-if="showInputFile" v-model="formData.file" type="text" placeholder="Please enter" class="field" />
      <input v-if="!showInputFile" type="file"  class="file-input file-input-primary w-full max-w-xs rounded-md"  @change="fileChange" />
    </label>

    

    <div class="w-full max-w-xs my-4">
      <SelectGas v-model:value="formData.gas" />
    </div>

    <div class="form-control w-full max-w-xs my-4">
      <div role="alert" class="alert alert-warning flex flex-row justify-start items-center text-white p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>Warning: Invalid email address!</span>
      </div>
    </div>
    <label class="form-control w-full max-w-xs my-4 mb-11">
      <button class="button" @click="submit">Create assets</button>
    </label>

    <dialog id="my_confirm_dialog" class="modal">
      <div class="modal-box rounded-md">
        <h3 class="font-bold text-lg">Confirm the foundry assets?</h3>
        <p class="py-4">The casting takes anywhere from 10-60 minutes, after which the assets are automatically added to your asset list</p>
        <div class="modal-action">
          <form method="dialog">
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn rounded-md btn-sm">Close</button>
          </form>
          <button class="btn btn-primary rounded-md btn-sm" @click="confirmSubmit">Confirm</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script lang="ts">
// import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
import { MintAssets, AssetsFinalize } from '@/popup/api/btc/blockStream'


export default {
  setup() {
    
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('/')
    store.isGoBack()
    return {

    }
  },
  data() {
    return {
      showInputFile: false,
      formData: {
        name: '',
        amount: 0,
        symbol: '',
        des: '',
        file: '',
        upfile: '',
        gas: 0
      },
     
    }
  },
  created() {
    
    this.initData()
  },
  methods: {
    fileChange(file: unknown) {
      console.log('file: ', file)
    },
    initData() {
      // @ts-ignore
      this.$root.setTitle('Create assets')
    },
    
    submit(){
      // @ts-ignore
      my_confirm_dialog.showModal()
    },
    confirmSubmit(){
      MintAssets({
        name: this.formData.name,
        amount: this.formData.amount,
        // asset_meta: {
        //   data: this.formData.file
        // }
      }).then(res => {
        AssetsFinalize()
        // @ts-ignore
        this.$root._toast('Success', 'success')
      })
    }
  }
}


</script>
<style lang="scss" scoped>
.createAssets{
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