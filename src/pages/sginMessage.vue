<template>
  <div class="mt-[-66px]">
    <h1>sginMessage</h1>

    <button @click="$router.back">Go Back</button>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'
const store = useAppStore()
store.setGoBackUrl('')
store.notGoBack()

</script>

<style scoped></style>
