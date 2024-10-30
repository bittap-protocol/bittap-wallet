<template>
  <div class="min-box flex flex-col p-2 justify-start items-center">
    <div class="w-full text-left">
      <div class="list-box">
        <div class="item">
          <router-link
            to="/common/accountMange"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiAccount class="mr-2 size-5"></IconMdiAccount>
            Account management
          </router-link>
        </div>
        <div class="item">
          <router-link
            to="/common/networkConfiguration"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiWideAreaNetwork class="mr-2 size-5"></IconMdiWideAreaNetwork>
            Network configuration
          </router-link>
        </div>
        <div class="item">
          <a
            href="###"
            class="flex flex-row justify-start items-center"
            @click="lockWallet"
          >
            <IconMdiPasswordOutline class="mr-2 size-5"></IconMdiPasswordOutline>
            Lock wallet
          </a>
        </div>
        <div class="item">
          <router-link
            to="/common/passwordConfiguration"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiPasswordReset class="mr-2 size-5"></IconMdiPasswordReset>
            Password configuration
          </router-link>
        </div>
        <div class="item">
          <a
            href="javascript:void(0)"
            class="flex flex-row justify-start items-center"
            @click="$root._toast('Coming soon...')"
          >
            <IconBackup class="mr-2 size-5"></IconBackup>
            Backup Proof of Transaction
          </a>
        </div>
        <div class="item">
          <router-link
            to="/common/aboutWallet"
            class="flex flex-row justify-start items-center"
          >
            <IconMdiAboutCircleOutline class="mr-2 size-5"></IconMdiAboutCircleOutline>
            About BitTap
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import IconMdiAccount from '@/components/svgIcon/MdiAccount.vue'
// @ts-ignore
import IconMdiAboutCircleOutline from '@/components/svgIcon/MdiAboutCircleOutline.vue'
// @ts-ignore
import IconMdiPasswordOutline from '@/components/svgIcon/MdiPasswordOutline.vue'
// @ts-ignore
import IconMdiWideAreaNetwork from '@/components/svgIcon/MdiWideAreaNetwork.vue'
// @ts-ignore
import IconMdiPasswordReset from '@/components/svgIcon/MdiPasswordReset.vue'
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
