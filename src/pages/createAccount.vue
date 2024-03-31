<template>
  create Account
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
const store = useAppStore()
const router = useRouter()

store.setGoBackUrl('/')
store.isGoBack()

const password = computed(() => store.password)


if(!password.value) {
  store.setGoBackUrl('/common/createAccount')
  router.push('/common/createPassword')
}

</script>

<style>

</style>