<template>
  <div class="m-4 min-box">
    <div class="py-10 flex flex-col flex-wrap items-stretch content-center ">
      <img class="mask mask-circle w-1/5 h-auto" src="https://daisyui.com/images/stock/photo-1567653418876-5bb0e566e1c2.jpg" />
    </div>
    <h4 class="text-center">Welcome to BitTap</h4>
    <nav class="py-10 flex flex-col flex-wrap items-stretch content-center space-y-6">
      <button class="btn btn-primary block w-1/2" @click="router.push('/common/createAccount')">Create wallet</button>
      <button class="btn btn-primary block w-1/2" @click="router.push('/common/importAccount')">Import wallet</button>
    </nav>
    
  </div>
</template>

<script setup>

import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
const store = useAppStore()
const router = useRouter()


store.notGoBack()

</script>

<style>

</style>