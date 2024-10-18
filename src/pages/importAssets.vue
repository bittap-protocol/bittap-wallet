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
import { postToast } from '@/popup/libs/tools';
import { useAppStore } from '@/stores/app.store'

export default {
  setup() {
    
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('')
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
      // @ts-ignore
      this.$root._showLoading('In process...')
      ImportAsset(this.formData).then(res => { 
        console.log('import asset res: ', res)
        this.isSubmitting = false
        // @ts-ignore
        this.$root._hideLoading()
        // @ts-ignore
        this.$root._toast('Import asset success', 'success')
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
      }).catch(err => { 
        postToast(err+'','error')
        // @ts-ignore
        console.error('on error: ', e)
        this.isSubmitting = false
        // @ts-ignore
        this.$root._hideLoading()
      })
    }
  }
}


</script>

<style lang="scss" scoped>
.importAsset{
  @apply w-full px-4;
  .form{
    .form-control {
      @apply mt-0;
    }
  }
  .actions{
    @apply my-2 w-full;
    .btn{
      @apply w-full rounded-xl;
    }
  }
}
</style>