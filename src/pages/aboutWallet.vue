<template>
  <div class="about-wallet">
    <div class="title">
        BitTap wallet
    </div>
    <div class="des">
        Manage your taproot assets
    </div>
    <div class="ver">
        Version: {{ version }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            // @ts-ignore
            version: __VERSION__
        }
    },
    created() {
        // @ts-ignore
        this.$root.setTitle('About us')
    }
}
</script>

<style lang="scss" scoped>
.about-wallet {
    min-height: 480px;
    @apply w-full p-4 flex flex-col justify-start items-start;
    .title{
        @apply font-bold text-xl my-2;
    }
    .des{
        @apply my-5;
    }
}
</style>