<template>
  <div class="min-box flex flex-col p-2 justify-start items-center">
    <div class="w-full text-left">
      <div class="list-box">
        <div class="item">
          <router-link
            to="/common/accountMange"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiAccount class="mr-2"></IconMdiAccount>
            Account management
          </router-link>
        </div>
        <div class="item">
          <router-link
            to="/common/networkConfiguration"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiWideAreaNetwork class="mr-2"></IconMdiWideAreaNetwork>
            Network configuration
          </router-link>
        </div>
        <div class="item">
          <a
            href="###"
            @click="lockWallet"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiPasswordOutline class="mr-2"></IconMdiPasswordOutline>
            Lock wallet
          </a>
        </div>
        <div class="item">
          <router-link
            to="/common/passwordConfiguration"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiPasswordReset class="mr-2"></IconMdiPasswordReset>
            Password configuration
          </router-link>
        </div>
        <div class="item">
          <a
            href="javascript:void(0)"
            @click="$root._toast('Coming soon...')"
            class="flex flex-row justify-start items-center"
          >
            <IconBackup class="mr-2"></IconBackup>
            Backup Proof of Transaction
          </a>
        </div>
        <div class="item">
          <router-link
            to="/common/aboutWallet"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiAboutCircleOutline class="mr-2"></IconMdiAboutCircleOutline>
            About BitTap
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconMdiAccount from '~icons/mdi/account'
// @ts-ignore
import IconMdiAboutCircleOutline from '~icons/mdi/about-circle-outline'
// @ts-ignore
import IconMdiPasswordOutline from '~icons/mdi/password-outline'
// @ts-ignore
import IconMdiWideAreaNetwork from '~icons/mdi/wide-area-network'
// @ts-ignore
import IconMdiPasswordReset from '~icons/mdi/password-reset'
// @ts-ignore
import IconBackup from '@/components/svgIcon/Backup.vue'

import { sendMessage } from '@/popup/libs/tools'

// import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
export default {
  components: {
    IconMdiAccount,
    IconMdiAboutCircleOutline,
    IconMdiPasswordOutline,
    IconMdiWideAreaNetwork,
    IconMdiPasswordReset,
    IconBackup
  },
  setup() {
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('/')
    store.isGoBack()
    return {
      store,
    }
  },
  created() {
    // @ts-ignore
    this.$root.setTitle('Settings')
  },
  methods: {
    async lockWallet() {
      // @ts-ignore
      await sendMessage('clearPassword', {}).then(() => {
        // @ts-ignore
        this.$root._checkUnlock()
      })
    },
  },
}
</script>

<style></style>
