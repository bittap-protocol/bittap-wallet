<template>
  <div class="min-box w-full importAccount px-4">
    <div class="import-tab">
      <!-- <div class="tabs-container">
        <button v-for="tab in tabs" :key="'tab-'+tab.value"
          :class="['tab-btn', activeTab === tab.value ? 'active' : '']" @click.prevent="activeTab = tab.value">
          {{ tab.label }}
        </button>
      </div> -->
      <div class="contents">
        <div v-if="activeTab === 'words'" class="content-tab">
          <div class="w-full my-2 flex flex-row flex-wrap justify-center items-center gap-4">
            <div v-for="(word,index) in wordsForm" :key="'w-'+index" class="w-[90px] overflow-x-hidden p-0.5">
              <div class="input-box input-append">
                <div class="text-gray-400 w-[20]">{{ (index+1) }}.</div>
                <input v-model="wordsForm[index]" type="text" class="inline px-1  w-[70px]" />
              </div>
            </div>
          </div>
          <div v-if="errorMessage && errorMessage.length > 0" role="alert"
            class="alert alert-error flex flex-row justify-start items-center my-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
          <button class="button mt-6" @click="importAccountFromWords(false)">Import account</button>
        </div>
        <div v-if="activeTab === 'private'" class="content-tab">
          <div class="w-full my-2 flex flex-col justify-start items-center">
            <input v-model="importPrivateKey" class="border my-5 w-full"
              placeholder="Private key hex format: 64 digits and letters" minlength="64" maxlength="64"
              pattern="^[0-9a-f]{64}$" />
            <button class="button mb-7" @click="importAccountFromWords(true)">Import account</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
export default {
  setup(){
    const store = useAppStore()

    const router = useRouter()
    const password = computed(() => store.password)
    store.setGoBackUrl('/')
    store.isGoBack()

    if(!password.value) {
      store.setGoBackUrl('/common/importAccount')
      router.push('/common/createPassword')
    }
  },
  data() {
    return {
      activeTab: 'words',
      tabs: [
        // { label: 'Mnemonics', value: 'words' },
        // { label: 'PrivateKey', value: 'private' },
      ],
      wordsForm: [],
      importPrivateKey: '',
      errorMessage: ''
    }
  },
  created() {
    // @ts-ignore
    this.$root.setTitle('Import Account')
    for(var i=0;  i < 12; i++) {
      // @ts-ignore
      this.wordsForm[i] = ''
    }
  },
  methods: {
    async importAccountFromWords(isPrivateKey = false){
      
      try {
        const store = useAppStore()
        if(isPrivateKey) {
          console.log('this.importPrivateKey', this.importPrivateKey)
          if(!/^[0-9a-f]{64}$/.test(this.importPrivateKey)){
            // @ts-ignore
            return this.$root._toast('The private key format is incorrect', 'error')
          }
          await store.importAccountFromWords(null, this.importPrivateKey)
        }else{
          console.log('this.wordsForm: ', this.wordsForm)
          for(let i = 0; i < this.wordsForm.length; i++) {
            // @ts-ignore
            if(!this.wordsForm[i] || this.wordsForm[i].length <= 1)  {
              throw 'Mnemonic word '+(i+1)+' is incorrect'
            }
          }
          await store.importAccountFromWords(this.wordsForm, null)
        }
        // @ts-ignore
        this.$root._toast('import account successfully', 'success')
        setTimeout(() => {
          this.$router.push('/')
        }, 200)
      }catch (e) {
        this.errorMessage = e + ''
        this.$root._toast('Error:'+e, 'error')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.importAccount {
  .import-tab{
    @apply py-3 my-4 border-t-0 border-solid border-gray-200 w-full;
    border-top-width: 1px;
    .tabs-container{
      @apply flex flex-row flex-nowrap justify-between items-center space-x-2 mb-3;
      .tab-btn{
        @apply rounded-full btn-sm w-1/2;
        &.active{
          @apply bg-primary text-white;
        }
      }
    }
    .contents{
      @apply p-10 mx-4;
    }

  }
}
</style>