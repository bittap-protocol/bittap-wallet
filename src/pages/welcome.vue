<template>
  <div class="min-box welcome">
    <div class="pt-10 flex flex-col flex-wrap items-stretch content-center ">
      <IconLogo />

    </div>
    <h4 class="text-center pt-4">Welcome to BitTap</h4>
    <nav class="cels">
      <button class="item create" @click="router.push('/common/createAccount')">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_39_1469)">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M29.3333 15.9998C29.3333 23.3636 23.3638 29.3332 16 29.3332C8.6362 29.3332 2.66667 23.3636 2.66667 15.9998C2.66667 8.63604 8.6362 2.6665 16 2.6665C23.3638 2.6665 29.3333 8.63604 29.3333 15.9998ZM16 8.99984C16.9205 8.99984 17.6667 9.74603 17.6667 10.6665V14.3332H21.3334C22.2539 14.3332 23.0001 15.0794 23.0001 15.9998C23.0001 16.9203 22.2539 17.6665 21.3334 17.6665H17.6667V21.3332C17.6667 22.2536 16.9205 22.9998 16 22.9998C15.0795 22.9998 14.3333 22.2536 14.3333 21.3332V17.6665H10.6667C9.74626 17.6665 9.00007 16.9203 9.00007 15.9998C9.00007 15.0794 9.74626 14.3332 10.6667 14.3332H14.3333V10.6665C14.3333 9.74603 15.0795 8.99984 16 8.99984Z"
              fill="white" />
          </g>
          <defs>
            <clipPath id="clip0_39_1469">
              <rect width="26.6667" height="26.6667" fill="white" transform="translate(2.66667 2.6665)" />
            </clipPath>
          </defs>
        </svg>

        <div class="text">
          Create wallet
        </div>
      </button>
      <button class="item import" @click="router.push('/common/importAccount')">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M29.3334 16.0003C29.3334 23.3641 23.3638 29.3337 16 29.3337C8.63622 29.3337 2.66669 23.3641 2.66669 16.0003C2.66669 8.63653 8.63622 2.66699 16 2.66699C23.3638 2.66699 29.3334 8.63653 29.3334 16.0003ZM21.1785 16.4885C21.8294 17.1394 21.8294 18.1946 21.1785 18.8455L17.1785 22.8455C16.5277 23.4964 15.4724 23.4964 14.8215 22.8455L10.8215 18.8455C10.1706 18.1946 10.1706 17.1394 10.8215 16.4885C11.4724 15.8376 12.5277 15.8376 13.1785 16.4885L14.5 17.81V11.3712C14.5 10.5428 15.1716 9.87124 16 9.87124C16.8284 9.87124 17.5 10.5428 17.5 11.3712V17.81L18.8215 16.4885C19.4724 15.8376 20.5277 15.8376 21.1785 16.4885Z"
            fill="white" />
        </svg>
        <div class="text">Import wallet</div>
      </button>
    </nav>

  </div>
</template>

<script setup>
// @ts-ignore
import IconMdiAdd from '~icons/mdi/add';
import IconLogo from '@/components/svgIcon/logo.vue'

import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
const store = useAppStore()
const router = useRouter()


store.notGoBack()

</script>

<style lang="scss" scoped>
.welcome {
  background: linear-gradient(180deg, #D4E0FF 0%, rgba(212, 224, 255, 0) 22.5%,rgba(212, 224, 255, 0) 82.5%, #D4E0FF 100%);
  margin-top: -55px;
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