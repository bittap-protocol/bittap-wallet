<template>
  <div class="flex flex-col min-box px-4">
    <div class="w-full">
      <div v-if="checkIng == false" class="py-4">Please confirm the safety of your surrounding environment.
        Mnemonic words are the most crucial information in your account, so please be careful when storing them.</div>
      <div v-if="checkIng == true" class="py-4">Please enter the following sequence number mnemonic.</div>

    </div>
    <div v-if="!isOk" class="w-full my-2 flex flex-row flex-wrap justify-center items-center gap-2">
      <div v-for="(word,index) in words" :key="'w-'+index" class="w-[100px] h-15 overflow-x-hidden p-0.5">
        <div class="input-box input-append">
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
    <div v-else class="w-full py-4 my-2 ">
      <div v-if="errors && errors.length > 0"
        class="text-white flex flex-row flex-nowrap justify-around items-center px-6 py-4 w-full border-0 rounded relative mb-4 bg-sky-500">
        <span class="text-xl inline-block mr-5 align-middle">
          <IconMdiWarningOctagonOutline />
        </span>
        <span class="inline-block text-red-500 font-medium text-left">
          {{ errors }}
        </span>
      </div>
      <div v-if="isOk" role="alert" class="alert alert-success my-2 text-white flex flex-row">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Mnemonic word verification is successful</span>
      </div>
      <button v-if="!isOk" class="button" @click="verificationWords">Verify</button>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconMdiWarningOctagonOutline from '~icons/mdi/warning-octagon-outline';

import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'

export default {
  setup() {

    const store = useAppStore()

    const router = useRouter()

    store.setGoBackUrl('')
    store.isGoBack()

    // @ts-ignore
    const activeAccount = store.getActiveAccount()

    // @ts-ignore
    const wordSplits = activeAccount.phrase.split(' ')
    console.log('activeAccount: ', activeAccount, wordSplits)
    const words = ref(wordSplits)
    const wordsForm = ref(new Array(words.value.length))
    const errors = ref('')
    const isOk = ref(false)

    // TODO is dev auto input words
    words.value.forEach((word: string, index: number) => {
      wordsForm.value[index] = word
    })


    const verificationWords = () => {
      try {
        for (let i = 0; i < words.value.length; i++) {
          if (!wordsForm.value[i] || words.value[i] !== wordsForm.value[i]) {
            throw 'Mnemonic word ' + (i + 1) + ' is incorrect'
          }
        }
        errors.value = ''
        // update current account backup state
        store.updateCurrentAccountBackupState()
        isOk.value = true
        // alert('Mnemonic word verification is successful')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } catch (e) {
        // @ts-ignore
        errors.value = e + ''
        console.error(e)
      }

    }
    return {
       activeAccount, wordSplits, verificationWords, wordsForm, words, isOk, errors
    }
  },
  data() {
    return {
      checkIng: false,
    }
  },
  watch: {
    'checkIng': function (k, v) { 
      if (k != v) { 
        if (this.checkIng) {
          this.$root.setTitle('Backup Mnemonic')
        } else { 
          this.$root.setTitle('Verify Mnemonic')
        }
      }
    }
  },
  mounted() {
    this.$root.setTitle('Backup Mnemonic')
  },
}
</script>

<style>

</style>