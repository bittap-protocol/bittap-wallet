import '@/assets/base.scss'


// eslint-disable-next-line @typescript-eslint/no-var-requires, prefer-const

// eslint-disable-next-line @typescript-eslint/no-var-requires
// global.Buffer = window.Buffer = Buffer

// import util from "node:util/types";
// import { EventEmitter } from "events";
// import { Stream } from "stream";


// @ts-ignore
// window.util = util;
// @ts-ignore
// window.EventEmitter = EventEmitter;
// @ts-ignore
// window.Stream = Stream;

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router/auto'
import App from './app.vue'
import './index.scss'


const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  extendRoutes: (routes) => {
    routes.push({
      path: '/',
      redirect: '/popup',
    })

    return routes
  },
})

createApp(App).use(router).use(createPinia()).mount('#app')

// console.log(router.getRoutes())

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}
