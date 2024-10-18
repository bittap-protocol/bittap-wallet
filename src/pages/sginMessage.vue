<template>
    <div class="mt-[-66px]">
        <h1>sginMessage</h1>
        <br />
        <div class="flex w-full">
            <div class="w-1/12"></div>
            <div class="w-10/12">
                <div
                    class="flex bg-purple-200 rounded-md h-10 items-center justify-center"
                >
                    <img
                        src="@/assets/web-icon.png"
                        alt="Example Image"
                        height="14"
                        width="14"
                        class="p-0"
                    />
                    <span>&nbsp;&nbsp;https://www.xxx.com</span>
                </div>
                <div class="card place-items-center p-4 text-base font-bold">
                    Sign transaction
                </div>
                <div
                    class="card bg-purple-200 rounded-md grid h-25 place-items-center p-4"
                >
                    <div>spend amount</div>
                    <div>0.00001 BTC</div>
                    <div>0.00001 BTC (network fee)</div>
                </div>
                <div class="card place-items-left pt-6 font-bold">
                    Inputs (1)
                </div>
                <div class="flex bg-purple-200 rounded-md p-2 justify-between">
                    <span class="text-left">btcpc...vifsof aa</span>
                    <span class="text-right">0.0001 BTC</span>
                </div>
                <div class="card place-items-left pt-6 font-bold">
                    Outputs (2)
                </div>
                <div
                    class="flex bg-purple-200 rounded-sm p-2 mb-0.5 justify-between"
                >
                    <span class="text-left">btcpc...vifsof</span>
                    <span class="text-right">0.0001 BTC</span>
                </div>
                <div
                    class="flex bg-purple-200 rounded-sm p-2 mb-0.5 justify-between"
                >
                    <span class="text-left">btcpc...vifkdc</span>
                    <span class="text-right">0.0002 BTC</span>
                </div>
                <div class="card place-items-left pt-4">NetworkFee</div>
                <div
                    class="flex bg-purple-200 rounded-md p-2 mb-0.5 justify-between"
                >
                    <span class="text-left">Normal</span>
                    <span class="text-right">
                        0.0001 BTC
                        <button>></button>
                    </span>
                </div>
                <div class="flex pt-8 mb-0.5 justify-between">
                    <button
                        class="border border-purple-500 text-purple-500 font-bold px-9 py-1 rounded-2xl"
                    >
                        Cancel
                    </button>
                    <button
                        class="border border-purple-500 bg-purple-500 text-white font-bold px-6 rounded-2xl"
                    >
                        Transaction
                    </button>
                </div>
            </div>
        </div>

        <br />

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
