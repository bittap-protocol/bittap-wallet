<template>
  <div>
  </div>
</template>

<script setup lang="ts">

import { sendMessage } from '@/popup/libs/tools';
import { ref } from 'vue'
interface IQueue {
  event: string
  data: unknown
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback?: Function
  time?: number
  requestId?: string,
}
const queues = ref<Array<any>>([])

const sendRequestJsBridge = (queue: IQueue) => {
  queue.time = Date.now()
  queue.requestId = queue.time + Math.random().toString(36).substr(2, 9)
  queues.value.push(queue)
  // chrome.runtime.sendMessage()
  sendMessage('jssdk.event', queue)
}

const getRequestQueueInfo = (requestId: string) => {
  const queue = queues.value.find((queue: IQueue) => queue.requestId === requestId)
  return queue
}

const removesendRequestQueue = (requestId: string) => {
  queues.value = queues.value.filter((queue: IQueue) => queue.requestId!== requestId)
}

// @ts-ignore
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content-script chrome.runtime.onMessage:', message)
  const jsonData = message && JSON.parse(message)
  if(jsonData) {
    // @ts-ignore
    const { type , data, requestId } = jsonData
    console.log('Content-script chrome.runtime.onMessage json :', type, data, requestId)
    if(type && requestId){
      const queue = getRequestQueueInfo(requestId)
      queue.callback && queue.callback(data)
    }
  }
  // @ts-ignore
  sendResponse({ result: true })
});
// alert('alert')
console.log('Install wallet frame')
// @ts-ignore
window.top.BitTapWallet = {
  sendRequestJsBridge,
}

</script>

<style scoped>

</style>
