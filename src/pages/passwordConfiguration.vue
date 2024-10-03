<template>
  <div class="w-full min-box pwd">
    <div class="w-full py-10 flex flex-col justify-center items-center px-4">
      <div class="item form-control">
        <label class="input-box input-append">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Current password"
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
      <div class="item form-control">
        <label class="input-box input-append">
          <input
            v-model="newPassword"
            :type="showPassword2 ? 'text' : 'password'"
            placeholder="Enter 8-12 letters and numbers"
          />
          <div class="icon">
            <IconEyeOpen
              v-if="showPassword2"
              @click="togglePasswordVisibility2"
            />
            <IconEyeClose
              v-if="!showPassword2"
              @click="togglePasswordVisibility2"
            />
          </div>
        </label>
      </div>
      <div class="item form-control">
        <label class="input-box input-append">
          <input
            v-model="confirmPassword"
            :type="showPassword3 ? 'text' : 'password'"
            placeholder="Confirm the password"
          />
          <div class="icon">
            <IconEyeOpen
              v-if="showPassword3"
              @click="togglePasswordVisibility3"
            />
            <IconEyeClose
              v-if="!showPassword3"
              @click="togglePasswordVisibility3"
            />
          </div>
        </label>
      </div>

      <button
        class="button"
        :disabled="
          password.length < 8 ||
          newPassword.length < 8 ||
          newPassword === confirmPassword
        "
        @click="changePassword"
      >
        Change password
      </button>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import { useAppStore } from '@/stores/app.store'
// @ts-ignore
import { TestPassword } from '@/popup/libs/tools'
// @ts-ignore
import IconEyeOpen from '@/components/svgIcon/EyeOpen.vue'
// @ts-ignore
import IconEyeClose from '@/components/svgIcon/EyeClose.vue'

export default {
  components: {
    IconEyeOpen,
    IconEyeClose,
  },
  setup() {
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('')
    store.isGoBack()
    return {
      store,
    }
  },
  data() {
    return {
      password: '',
      newPassword: '',
      confirmPassword: '',
      showPassword: false,
      showPassword2: false,
      showPassword3: false,
    }
  },
  computed: {
    TestOk() {
      console.log(
        'test: ',
        TestPassword(this.password) &&
          TestPassword(this.newPassword) &&
          TestPassword(this.confirmPassword),
        this.password.length < 8,
        this.newPassword.length < 8,
        this.newPassword === this.confirmPassword
      )
      return (
        TestPassword(this.password) &&
        TestPassword(this.newPassword) &&
        TestPassword(this.confirmPassword)
      )
    },
  },
  created() {
    // @ts-ignore
    this.$root.setTitle('Password configuration')
  },
  methods: {
    initData() {
      // @ts-ignore
      this.$root.setTitle('Password configuration')
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    togglePasswordVisibility2() {
      this.showPassword2 = !this.showPassword2
    },
    togglePasswordVisibility3() {
      this.showPassword3 = !this.showPassword3
    },
    async changePassword() {
      if (!TestPassword(this.password)) {
        // @ts-ignore
        return this.$root._toast('Current password format is invalid', 'error')
      }
      if (!TestPassword(this.newPassword)) {
        // @ts-ignore
        return this.$root._toast('New password format is invalid', 'error')
      }
      if (this.newPassword != this.confirmPassword) {
        // @ts-ignore
        return this.$root._toast(
          'The new password is different from the confirmed password',
          'error'
        )
      }
      // Authentication password
      if (await this.store.AuthenticationPassword(this.password)) {
        // @ts-ignore
        return this.$root._toast('Current password is invalid', 'error')
      }

      // Change password
      // @ts-ignore
      await this.store.resetPassword(this.newPassword)
      // @ts-ignore
      this.$root._toast('Password changed', 'success')
    },
  },
}
</script>

<style lang="scss" scoped>
.pwd {
  .item {
    @apply mb-4 w-full;
    .field {
      @apply w-full;
    }
  }
}
</style>
