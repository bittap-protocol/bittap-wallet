<template>
    <div class="mt-[-66px]">
        <h1>Connection Wallet</h1>
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
                <div class="card place-items-center p-4">
                    <span class="text-base font-bold mb-3">
                        SignatureRequest
                    </span>
                    <span>Only sign this message if you fully understand</span>
                    <span>the content and trust the requesting site</span>
                </div>
                <div
                    class="card bg-purple-200 rounded-md h-25 pl-4 pt-4 pb-12 mb-1"
                >
                    <h4>签名的内容</h4>
                    <h4>签名的内容</h4>
                    <h4>签名的内容</h4>
                    <h4>签名的内容</h4>
                    <h4>签名的内容</h4>
                </div>
                <div class="flex pt-8 mb-0.5 justify-between">
                    <button
                        class="border border-purple-500 text-purple-500 font-bold px-8 py-1 rounded-2xl"
                    >
                        Cancel
                    </button>
                    <button
                        class="border border-purple-500 bg-purple-500 text-white font-bold px-8 rounded-2xl"
                    >
                        Connect
                    </button>
                </div>
            </div>
        </div>

        <br />
        <button @click="$router.back">Go Back</button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const accountActive = ref(true)
</script>
<style scoped></style>
