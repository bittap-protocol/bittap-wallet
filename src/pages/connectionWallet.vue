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
                        Connect with BitTap
                    </span>
                    <span class="font-bold">
                        Select the account to use on this site
                    </span>
                    <span>Only connect with sites you trust</span>
                </div>
                <div class="flex w-full bg-purple-200 rounded-md h-25 p-4 mb-1">
                    <div class="card w-1/6 place-content-center font-bold">
                        &check;
                    </div>
                    <div class="card w-5/6 place-content-left">
                        <div class="font-bold">Account11</div>
                        <div>bc1q2...5ntwd</div>
                    </div>
                </div>
                <div class="flex w-full bg-purple-200 rounded-md h-25 p-4 mb-1">
                    <div class="card w-1/6 place-content-center font-bold">
                        {{ accountActive ? '&check;' : '' }}
                    </div>
                    <div class="card w-5/6 place-content-left">
                        <div class="font-bold">Account22</div>
                        <div>bc1q2...5ntwd</div>
                    </div>
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
