import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { dirname, relative } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { URL, fileURLToPath } from 'url'
import { defineConfig, type Plugin } from 'vite'
import zip from "rollup-plugin-zip"


import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import {NodeGlobalsPolyfillPlugin} from "@esbuild-plugins/node-globals-polyfill";

import RollupPluginNodePolyfills from "rollup-plugin-node-polyfills"


// import VueDevTools from 'vite-plugin-vue-devtools'
import { defineViteConfig as define } from './define.config'
import manifest from './manifest.config'
import packageJson from './package.json'

const isProd = process.env.NODE_ENV === "production"


const transformHtmlPlugin = (data) =>
  <Plugin>{
    name: 'transform-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<%=\s*(\w+)\s*%>/gi, (match, p1) => data[p1] || '')
      },
    },
  }

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      src: fileURLToPath(new URL('./src', import.meta.url)),
      // stream: "stream-browserify",
      util: "rollup-plugin-node-polyfills/polyfills/util",
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      // crypto: 'rollup-plugin-node-polyfills/polyfills/crypto-es6',
    },
  },
  
  plugins: [
    wasm(),
    topLevelAwait(),
    crx({ manifest }),

    VueRouter({
      root: '.',
      // Add your own custom pages here. Just add it to the array. Example: 'src/welcome/pages'
      routesFolder: [
        { src: 'src/pages', path: 'common/' },
        { src: 'src/pages/account', path: 'common/account' },
        { src: 'src/content-script/iframe/pages', path: 'iframe/' },
        { src: 'src/options/pages', path: 'options/' },
        { src: 'src/popup/pages', path: 'popup/' },
        { src: 'src/setup/pages', path: 'setup/' },
      ],
      dts: 'src/typed-router.d.ts',
      extensions: ['.vue'],
    }),

    vue(),

    // VueDevTools(),

    AutoImport({
      imports: ['vue', VueRouterAutoImports, 'vue/macros', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables/'],
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: ['src/components'],
      // generate `components.d.ts` for ts support with Volar
      dts: 'src/components.d.ts',
      resolvers: [
        // auto import icons
        IconsResolver({
          prefix: 'i',
          enabledCollections: ['mdi'],
        }),
      ],
    }),

    // https://github.com/antfu/unplugin-icons
    Icons({
      autoInstall: true,
      compiler: 'vue3',
      scale: 1.5,
    }),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      order: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(
          /"\/assets\//g,
          `"${relative(dirname(path), '/assets')}/`
        )
      },
    },

    transformHtmlPlugin({
      HTML_TITLE: packageJson.displayName || packageJson.name,
    }),
    // isProd && zip({ dir: "releases" })
    // isProd && zip(),
  ],
  worker: {
    // Not needed with vite-plugin-top-level-await >= 1.3.0
    // format: "es",
    // @ts-ignore
    plugins: [
      wasm(),
      topLevelAwait()
    ]
  },
  ssr: {
    target: "webworker"
  },
  clearScreen: false,
  define,
  build: {
    outDir: isProd ? 'dist/build' : 'dist/dev',
    // target: 'esnext',
    rollupOptions: {
      input: {
        iframe: 'src/content-script/iframe/index.html',
        setup: 'src/setup/index.html',
      },
      plugins: [
        RollupPluginNodePolyfills()
      ]
    },
  },
  server: {
    port: 8888,
    strictPort: true,
    hmr: {
      port: 8889,
      overlay: true,
    },
  },
  optimizeDeps: {
    include: ['vue', '@vueuse/core'],
    exclude: ['vue-demi'],
    allowNodeBuiltins: [
      'crypto'
    ],
    esbuildOptions: {
      define: {
          global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
              buffer: true,
              process: true,
              // events: true,
              // stream: true,
          }),
      ],
    },
  },
})
