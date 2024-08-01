<template>
  <div v-if="!isAuth" class="flex flex-col min-box px-4">
    <div class="w-full">
      <div v-if="checkIng == false" class="py-4">Please confirm the safety of your surrounding environment.
        Mnemonic words are the most crucial information in your account, so please be careful when storing them.</div>
      <div v-if="checkIng == true" class="py-4">Please enter the following sequence number mnemonic.</div>

    </div>
    <div v-if="!isOk" class="w-full my-2 flex flex-row flex-wrap justify-center items-center gap-2">
      <div v-for="(word,index) in words" :key="'w-'+index" :class="['w-[100px] h-15 overflow-x-hidden p-0.5',checkIng && !verificationWordsIndex[index] ? 'hidden':'']">
        <div :class="['input-box input-append', verificationWordsResult[index]? '':'error']">
          <div class="text-gray-400 w-[20]">{{ (index+1) }}.</div>
          <input v-if="!checkIng" :value="word" type="text" readonly class="inline px-1 w-[70px]" />
          <input v-if="checkIng" v-model="wordsForm[index]" type="text" class="inline px-1  w-[70px]" />
        </div>
      </div>
    </div>
    <div v-if="!checkIng" class="w-full py-4 my-2">
      <button class="btn btn-primary btn-block" @click="checkIng = true">I Remember</button>
      <router-link to="/" class="text-primary no-underline block w-full text-center mt-4">Skip</router-link>
    </div>
    <div v-else class="w-full my-1 ">
      <div
v-if="errors && errors.length > 0"
        class="err-tips">
        {{ errors }}
      </div>
      <div v-if="isOk"  class="err-tips">
        <span>Mnemonic word verification is successful</span>
      </div>
      <button v-if="!isOk" class="button mt-4" @click="verificationWords">Verify</button>
      <router-link to="/" class="text-primary no-underline block w-full text-center mt-4">Skip</router-link>
    </div>
  </div>
  <div v-else class="flex flex-col min-box px-4">
    <div class="form w-full  my-4">
      <div class="form-control">
         <div class="label">
              <span class="label-text">Enter your password to verify identity.</span>
          </div>
      </div>
      <label class="input-box input-append mt-4">
        <input
v-model="pwd" :type="showPassword ? 'text' : 'password'"
          placeholder="Enter password" />
        <div class="icon">
          <IconEyeOpen v-if="showPassword" @click="togglePasswordVisibility" />
          <IconEyeClose v-if="!showPassword" @click="togglePasswordVisibility" />
        </div>
      </label>
      <div class="actions mt-4">
        <button class="button" @click="verifyPassword">Next</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { useAppStore } from '@/stores/app.store'
import { postToast, randomInt, sendMessage, getQuery } from '@/popup/libs/tools'
// @ts-ignore
import IconEyeOpen from '@/components/svgIcon/EyeOpen.vue'
// @ts-ignore
import IconEyeClose from '@/components/svgIcon/EyeClose.vue'

export default {
  components: {
    IconEyeOpen, IconEyeClose
  },
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
      checkIng: false,
      isOk: false,
      showPassword: false,
      errors: '',
      verificationWordsIndex: new Array(12),
      verificationWordsResult: new Array(12),
      wordsForm: new Array(12),
      words: new Array(12),
      isAuth: false,
      pwd: ''
    }
  },
  watch: {
    'checkIng': function (k, v) { 
      if (k != v) { 
        if (this.checkIng) {
          this.createRandomIndex()
          // @ts-ignore
          this.$root.setTitle('Backup Mnemonic')
        } else { 
          // @ts-ignore
          this.$root.setTitle('Verify Mnemonic')
        }
      }
    }
  },
  mounted() {
    

    this.isAuth = getQuery('auth') === 'yes'
    if (this.isAuth) {
      // @ts-ignore
      this.$root.setTitle('Verify Identity')
      this.store.setGoBackUrl('/')
      this.store.isGoBack()
    } else { 
      // @ts-ignore
      this.$root.setTitle('Backup Mnemonic')
    }

    this.createRandomIndex()
    this.verificationWordsResult.fill(true)

    const activeAccount = this.store.getActiveAccount()
    // @ts-ignore
    const activeUserPhrase = this.store.phrases[activeAccount.phraseIndex].phrase
    
    // @ts-ignore
    sendMessage('decryptMnemonic', activeUserPhrase).then(res => { 
      // @ts-ignore
      this.words = res.split(' ')
    })
    
    
  },
  methods: {
    togglePasswordVisibility() { 
      this.showPassword = !this.showPassword
    },
    verificationWords() { 
      try {
        for (let i = 0; i < this.words.length; i++) {
          if (this.verificationWordsIndex[i]) {
            if (!this.wordsForm[i] || this.words[i] !== this.wordsForm[i]) {
              this.verificationWordsResult[i] = false
              throw 'Mnemonic word ' + (i + 1) + ' is incorrect'
            }
          }
        }
        this.errors = ''
        // update current account backup state
        this.store.updateCurrentAccountBackupState()
        this.isOk = true
        setTimeout(() => {
          this.$router.push('/')
        }, 1500)
      } catch (e) {
        // @ts-ignore
        this.errors = e + ''
        console.error(e)
        postToast(this.errors)
      }
    },
    createRandomIndex() { 
      this.verificationWordsIndex.fill(false)
      let c= 0
      do {
        const index = randomInt(0, 12)
        if (!this.verificationWordsIndex[index]) {
          this.verificationWordsIndex[index] = true
          c++
        }
      }while(c<=2)
    },
    async verifyPassword() {
      const checkStatus = await this.store.AuthenticationPassword(this.pwd)
      if (!checkStatus) {
        // @ts-ignore
        return this.$root._toast('Current password is invalid','error')
      } else {
        this.isAuth = false
      }
    },
  }
}
</script>

<style>

</style>