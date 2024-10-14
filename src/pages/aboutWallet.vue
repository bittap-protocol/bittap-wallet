<template>
  <div class="about-wallet">
    <div class="info">
      <div class="it v">
        <div class="n">Version</div>
        <div class="v">
          {{ version }}
        </div>
      </div>
      <a
        class="it pp"
        target="_blank"
        href="https://doc.bittap.org/developer-guides/overview"
      >
        <span class="n">Privacy Policy</span>
        <span class="v"><IconArrowRight /></span>
      </a>
      <a
        class="it ow"
        target="_blank"
        href="https://www.bittap.org/"
      >
        <span class="n">Official website</span>
        <span class="v"><IconArrowRight /></span>
      </a>
      <a
        class="it cu"
        target="_blank"
        href="https://doc.bittap.org/"
      >
        <span class="n">Contact us</span>
        <span class="v"><IconArrowRight /></span>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconArrowRight from '@/components/svgIcon/ArrowRight.vue'
// @ts-ignore
import { useAppStore } from '@/stores/app.store'
export default {
  components: { IconArrowRight },
  setup() {
    const store = useAppStore()
    store.setGoBackUrl('')
    store.isGoBack()
  },
  data() {
    return {
      // @ts-ignore
      version: __VERSION__,
    }
  },
  created() {
    // @ts-ignore
    this.$root.setTitle('About us')
  },
}
</script>

<style lang="scss" scoped>
.about-wallet {
  min-height: 100vh;
  @apply w-full p-4 bg-white;
  .info {
    @apply w-full flex flex-col justify-center items-center rounded-2xl shadow-lg shadow-gray-200 mt-4 border border-gray-50 border-solid;
    .it {
      @apply w-full flex flex-row justify-between items-center mx-4 my-0 py-5 px-4 border-b border-solid border-[#f5f5fa];
      &:last-child {
        @apply border-none;
      }
      &:hover {
        @apply bg-gray-50;
      }
      .v {
        @apply flex flex-row justify-center items-center;
      }
    }
  }
}
</style>
