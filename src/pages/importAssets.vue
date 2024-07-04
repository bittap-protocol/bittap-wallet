<template>
  <div class="min-box importAsset">
    <div class="form w-full">
      <div class="form-control">
         <div class="label">
              <span class="label-text">Asset id</span>
          </div>
          <input v-model="formData.asset_id" type="text" placeholder="Enter asset id"
                  class="field" />
      </div>
      <div class="form-control">
         <div class="label">
              <span class="label-text">Universe host</span>
          </div>
          <input v-model="formData.universe_host" type="text" placeholder="Enter universe host"
                  class="field" />
      </div>
      <div class="actions">
        <button class="btn btn-primary block" @click="importAsset">Import Now</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ImportAsset } from '@/popup/api/btc/blockStream';
import { useAppStore } from '@/stores/app.store'

export default {
  setup() {
    
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('/')
    store.isGoBack()
    return {
      store
    }
  },
  data() {
    return {
      formData: {
        asset_id: '',
        universe_host: ''
      },
      isSubmitting: false,
    }
  },
  created() {
    
    this.initData()
  },
  methods: {
    initData() {
      // @ts-ignore
      this.$root.setTitle('Import assets')
    },
    importAsset() { 
      this.isSubmitting = true
      this.$root._showLoading('In process...')
      ImportAsset(this.formData).then(res => { 
        console.log('import asset res: ', res)
        this.isSubmitting = false
        this.$root._hideLoading()
        this.$root._toast('Import asset success', 'success')
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
      }).catch(err => { 
        postToast(err+'','error')
        console.error('on error: ', e)
        this.isSubmitting = false
        this.$root._hideLoading()
      })
    }
  }
}


</script>

<style lang="scss" scoped>
.importAsset{
  @apply w-full p-4;
  .form{
    .form-control {
      @apply mt-4;
    }
  }
  .actions{
    @apply my-4 w-full;
    .btn{
      @apply w-full rounded-xl;
    }
  }
}
</style>