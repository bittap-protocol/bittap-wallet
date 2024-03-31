<template>
  <div class="w-full min-box flex flex-col justify-center items-center">
    <h2>
      Terms Service
    </h2>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
const store = useAppStore()
const router = useRouter()

store.setGoBackUrl('/')
store.isGoBack()

</script>
<style>

</style>