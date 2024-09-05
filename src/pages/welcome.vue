<template>
  <div class="min-box welcome">
    <div class="pt-10 flex flex-col flex-wrap items-stretch content-center ">
      <IconLogo />

    </div>
    <h4 class="text-center pt-4">Welcome to BitTap</h4>
    <nav class="cels">
      <button class="item create" @click="router.push('/common/createAccount')">
        <IconCreateWallet></IconCreateWallet>
      </button>
      <button class="item import" @click="router.push('/common/importAccount')">
       <IconImportWallet></IconImportWallet>
      </button>
    </nav>

  </div>
</template>

<script setup>
// @ts-ignore
// import IconMdiAdd from '~icons/mdi/add';
import IconLogo from '@/components/svgIcon/logo.vue'
import IconCreateWallet from '@/components/svgIcon/CreateWallet.vue'
import IconImportWallet from '@/components/svgIcon/ImportWallet.vue'

import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
const store = useAppStore()
const router = useRouter()
store.notGoBack()
store.initConfig()

</script>

<style lang="scss" scoped>
.welcome {
  background: linear-gradient(180deg, #D4E0FF 0%, rgba(212, 224, 255, 0) 22.5%,rgba(212, 224, 255, 0) 82.5%, #D4E0FF 100%);
  margin-top: -66px;
  @apply pt-14;
  .cels{
    @apply pt-20 flex flex-row flex-nowrap justify-between items-center space-x-2 w-4/5 mx-auto my-0;
    .item{
      @apply bg-primary text-white h-32 w-32 rounded-2xl flex flex-col justify-center items-center shadow-md shadow-gray-300 transition-opacity;
      background: #9933FF;

      &:hover{
        @apply opacity-80 transition-opacity;
      }
      .text{
        @apply mt-2;
      }
      &.create{
        @apply bg-blue-500;
      }
    }
  }
}
</style>