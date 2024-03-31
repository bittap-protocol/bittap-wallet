<template>
  <div class="min-box flex flex-col p-2 justify-start items-center">
    <div class="w-full text-left">
      <div class="list-box">
        <div class="item">
          <router-link to="/common/accountMange" class="flex flex-row justify-start items-center">
            <IconMdiAccount class="mr-2"></IconMdiAccount>
            Account management
          </router-link>
        </div>
        <div class="item">
          <router-link to="/common/networkConfiguration" class="flex flex-row justify-start items-center">
            <IconMdiWideAreaNetwork class="mr-2"></IconMdiWideAreaNetwork>
            Network configuration
          </router-link>
        </div>
        <div class="item">
          <router-link to="/common/passwordConfiguration" class="flex flex-row justify-start items-center">
            <IconMdiPasswordOutline class="mr-2"></IconMdiPasswordOutline>
            Password configuration
          </router-link>
        </div>
        <div class="item">
          <router-link to="/common/aboutWallet" class="flex flex-row justify-start items-center">
            <IconMdiAboutCircleOutline class="mr-2"></IconMdiAboutCircleOutline>
            About BitTap
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import IconMdiAccount from '~icons/mdi/account';
import IconMdiAboutCircleOutline from '~icons/mdi/about-circle-outline';
import IconMdiPasswordOutline from '~icons/mdi/password-outline';
import IconMdiWideAreaNetwork from '~icons/mdi/wide-area-network';

// import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
export default {
  components: {
    IconMdiAccount,
    IconMdiAboutCircleOutline,
    IconMdiPasswordOutline,
    IconMdiWideAreaNetwork,
  },
  setup(){
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('/')
    store.isGoBack()

  },
  created(){
    this.$root.setTitle('Settings')
  },
}
</script>


<style>

</style>