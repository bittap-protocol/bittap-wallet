<template>
  <div
    class="unlock w-full min-box flex flex-col justify-center items-stretch px-6"
  >
    <div class="logo flex flex-row justify-center items-center">
      <IconLogo />
      <!-- <img src="@/assets/logo.svg" /> -->
    </div>
    <div class="tips text-left text-md mt-20">
      Verify the unlock password for assets safe.
    </div>
    <div class="mt-4">
      <label class="input-box input-append">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter password"
        />
        <div class="icon">
          <IconEyeOpen
            v-if="showPassword"
            @click="togglePasswordVisibility"
          />
          <IconEyeClose
            v-if="!showPassword"
            @click="togglePasswordVisibility"
          />
        </div>
      </label>
    </div>
    <div class="mt-4 flex flex-col justify-center items-center">
      <button
        class="btn btn-primary btn-block"
        :disabled="disabledVisible"
        @click="verifyPassword"
      >
        Unlock
      </button>
      <router-link
        v-if="!requestId"
        to="/common/importAccount?clear=all"
        class="btn btn-link no-underline"
      >
        Forgot your password
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app.store'
// @ts-ignore
import IconLogo from '@/components/svgIcon/logo.vue'

// @ts-ignore
import IconEyeOpen from '@/components/svgIcon/EyeOpen.vue'
// @ts-ignore
import IconEyeClose from '@/components/svgIcon/EyeClose.vue'
import { TestPassword, hideFullscreen, sendMessage, getQuery } from '@/popup/libs/tools'

export default {
  components: {
    IconEyeOpen,
    IconEyeClose,
    IconLogo,
  },
  setup() {
    const store = useAppStore()
    const redirect = getQuery('redirect')
    const requestId = getQuery('requestId')
    const networkType = getQuery('networkType')
    const host = getQuery('host')
    return { store, redirect, requestId, networkType, host }
  },
  data() {
    return {
      showPassword: false,
      disabledVisible: true,
      password: '',
    }
  },
  watch: {
    password: function () {
      this.checkPasswordDisabled()
    },
  },
  created() {
    this.initData()
    window.addEventListener('keydown', this.onKeyDownFunction, true)
    // if (import.meta.env.DEV) {
    //   this.password = ''
    // }
    // postToast('Success', 'success', 500000)
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    onKeyDownFunction(e) {
      if (e.keyCode === 13) {
        this.verifyPassword()
      }
    },
    checkPasswordDisabled() {
      this.disabledVisible = !TestPassword(this.password)
    },
    async verifyPassword() {
      this.disabledVisible = true
      const checkStatus = await this.store.AuthenticationPassword(this.password)
      // console.log('checkStatus: ', [checkStatus])
      if (!checkStatus) {
        this.checkPasswordDisabled()
        // @ts-ignore
        return this.$root._toast('Current password is invalid', 'error')
      }
      await sendMessage('setPassword', this.password)
      window.removeEventListener('keydown', this.onKeyDownFunction, {
        capture: true,
      })
      hideFullscreen()
      if(this.redirect && this.$router.hasRoute(this.redirect)){
        this.$router.push(this.redirect+'?requestId='+this.requestId+'&networkType='+this.networkType+'&host='+this.host)
      }else{
        this.$router.push('/')
      }
      
    },
    initData() {
      // console.log('this.store', this.$pinia)
      // @ts-ignore
      this.$root.setTitle('Unlock wallet')
      const store = useAppStore()
      // const router = useRouter()

      store.setGoBackUrl('/')
      store.notGoBack()
    },
  },
}
</script>

<style lang="scss" scoped>
.unlock {
  background: linear-gradient(
    180deg,
    #d4e0ff 0%,
    rgba(212, 224, 255, 0) 22.5%,
    rgba(212, 224, 255, 0) 82.5%,
    #d4e0ff 100%
  );
  margin-top: -66px;
}
</style>
