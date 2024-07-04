<template>
  <div class="unlock w-full min-box flex flex-col justify-center items-stretch px-6">
    <div class="logo flex flex-row justify-center items-center">
      <IconLogo />
      <!-- <img src="@/assets/logo.svg" /> -->
    </div>
    <div class="tips text-center text-lg mt-20">Enter your password</div>
    <div class="mt-4">
      <label class="input-box input-append">
        <input
v-model="password" :type="showPassword ? 'text' : 'password'"
          placeholder="password" />
        <div class="icon">
          <IconEyeOpen v-if="showPassword" @click="togglePasswordVisibility" />
          <IconEyeClose v-else @click="togglePasswordVisibility" />
        </div>
      </label>
    </div>
    <div class="mt-4 flex flex-col justify-center items-center">
        <button class="btn btn-primary btn-block" :disabled="disabledVisible" @click="verifyPassword">Unlock</button>
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
import { TestPassword, sendMessage } from '@/popup/libs/tools'


export default {
  components: {
    IconEyeOpen, IconEyeClose, IconLogo
  },
  setup() { 
    const store = useAppStore()
    return { store }
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
    }
  },
  created() {
    this.initData()
    window.addEventListener('keydown', this.onKeyDownFunction, true)
    console.log('import.meta.env.MODE:', import.meta.env.DEV)
    if(import.meta.env.DEV) { 
      this.password = 'Abc123456##';
    }
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
        return this.$root._toast('Current password is invalid','error')
      }
      await sendMessage('setPassword', this.password)
      window.removeEventListener('keydown', this.onKeyDownFunction, { capture: true })
      this.$router.push('/')
    },
    initData() {
      // console.log('this.store', this.$pinia)
      // @ts-ignore
      this.$root.setTitle('Unlock wallet')
      const store = useAppStore()
      // const router = useRouter()
  
      store.setGoBackUrl('/')
      store.notGoBack()
    }
  }
}


</script>

<style lang="scss" scoped>
.unlock {
  background: linear-gradient(180deg, #D4E0FF 0%, rgba(212, 224, 255, 0) 22.5%,rgba(212, 224, 255, 0) 82.5%, #D4E0FF 100%);
  margin-top: -55px;
  
}
</style>