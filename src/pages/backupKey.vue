<template>
  <div class="flex flex-col min-box px-4">
    <div class="w-full">
      <h3 class="text-center font-bold">Backup mnemonics</h3>
    </div>
    <div v-if="!isOk" class="w-full my-2 flex flex-row flex-wrap justify-center items-center gap-4">
      <div v-for="(word,index) in words" :key="'w-'+index" class="w-1/3 h-15 ">
        <div class="join flex flex-row flex-nowrap justify-center items-center">
          <div class="join-item pr-1 font-bold">{{ (index+1) }}.</div>
          <div class="join-item">
            <input v-if="!checkIng" :value="word" type="text" readonly class="input input-bordered w-full max-w-xs" />
            <input v-if="checkIng" v-model="wordsForm[index]" type="text" class="input input-bordered w-full max-w-xs" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="!checkIng" class="w-full py-4 my-2">
      <button class="button" @click="checkIng = true">Start verification</button>
    </div>
    <div v-else class="w-full py-4 my-2">
      <div v-if="errors && errors.length > 0" class="text-white flex flex-row flex-nowrap justify-around items-center px-6 py-4 w-full border-0 rounded relative mb-4 bg-sky-500">
        <span class="text-xl inline-block mr-5 align-middle">
          <IconMdiWarningOctagonOutline />
        </span>
        <span class="inline-block text-red-500 font-medium text-left">
          {{ errors }}
        </span>
      </div>
      <div v-if="isOk" role="alert" class="alert alert-success my-2 text-white flex flex-row">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span >Mnemonic word verification is successful</span>
      </div>
      <button v-if="!isOk" class="button" @click="verificationWords">Verification</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import IconMdiWarningOctagonOutline from '~icons/mdi/warning-octagon-outline';

import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
const store = useAppStore()

const router = useRouter()

const checkIng = ref(false)

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
    for(let i = 0; i < words.value.length; i++) {
      if(!wordsForm.value[i] || words.value[i] !== wordsForm.value[i])  {
        throw 'Mnemonic word '+(i+1)+' is incorrect'
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
  }catch(e) {
    // @ts-ignore
    errors.value = e+''
    console.error(e)
  }
  
}
</script>

<style>

</style>