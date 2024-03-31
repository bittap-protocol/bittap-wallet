<template>
    <div class="w-full min-box">
      template
    </div>
  </template>
  
  <script lang="ts">
  import { useAppStore } from '@/stores/app.store'
  
  export default {
    setup() {
      
      const store = useAppStore()
      // const router = useRouter()
  
      store.setGoBackUrl('/')
      store.isGoBack()
      return {
  
      }
    },
    data() {
      return {
      }
    },
    created() {
      
      this.initData()
    },
    methods: {
      initData() {
        // @ts-ignore
        this.$root.setTitle('Import assets')
      }
    }
  }
  
  
  </script>
  
  <style lang="scss" scoped>
  
  </style>