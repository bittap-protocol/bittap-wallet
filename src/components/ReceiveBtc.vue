<template>
    <div class="w-full flex flex-col justify-center items-center receive">
        <div class="w-full py-4 flex flex-row justify-center items-center mt-5">
            <VueQr :text="account.address" :size="200" class="bg-box"></VueQr>
        </div>
        <div class="w-full py-4 my-1">
            <div class="address">
                {{ account.address }}
            </div>
        </div>
        <div class="w-full py-4">
            <button class="button" @click="copyAddress(account.address)">Copy address</button>
        </div>
    </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store'
import VueQr from 'vue-qr/src/packages/vue-qr.vue'

export default {
    name: 'ReceiveBtc',
    components: {
        VueQr
    },
    setup(){
        const store = useAppStore()
        const account = computed(() => store.getActiveAccount())
        return {
            account
        }
    },
    methods: {
        async copyAddress(address: string) {
            await navigator.clipboard.writeText(address)
            // @ts-ignore
            this.$root._toast('Copy successfully.', 'success')
        }
    }
}
</script>

<style lang="scss" scoped>
.receive{
    .address{
        word-break: break-all;
    }
}
</style>