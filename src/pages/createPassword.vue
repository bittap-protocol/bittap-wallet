<script lang="ts">
// @ts-ignore
// import IconMdiWarningOctagonOutline from '~icons/mdi/warning-octagon-outline';

// @ts-ignore
import IconEyeOpen from '@/components/svgIcon/EyeOpen.vue'
// @ts-ignore
import IconEyeClose from '@/components/svgIcon/EyeClose.vue'

// import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  TestPassword,
  sendMessage,
  postToast,
  getQuery,
  showLoading,
  hideLoading,
  hideFullscreen,
} from '@/popup/libs/tools'

export default {
  components: {
    IconEyeOpen,
    IconEyeClose,
  },
  setup() {
    const importWords = getQuery('w')
    const isClear = ref(getQuery('clear') === 'all')

    const isImported = ref(importWords ? importWords.split('|') : [])
    console.log('setup params: ', location.href, isImported.value)
    const showPassword = ref(false)
    const disabledVisible = ref(true)
    const formData = reactive({
      // password: 'Abc123456',
      // passwordConfirm: 'Abc123456',
      password: '',
      passwordConfirm: '',
      agree: false,
    })

    const store = useAppStore()

    const router = useRouter()

    store.isGoBack()

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    const formErrors = ref({
      passwordError: '',
      passwordConfirmError: '',
      termsError: '',
    })

    const validateForm = () => {
      console.log('check:', [
        TestPassword(formData.password),
        formData.password,
      ])
      formErrors.value.passwordError = !TestPassword(formData.password)
        ? 'The password must be 8 to 16 characters starting with an uppercase letter.'
        : ''

      formErrors.value.passwordConfirmError =
        formData.password !== formData.passwordConfirm
          ? 'Passwords do not match.'
          : ''
      console.log('formData.agree: ', [formData.agree])
      formErrors.value.termsError = !formData.agree
        ? 'You must agree to the terms.'
        : ''
      disabledVisible.value = !(
        !formErrors.value.passwordError &&
        !formErrors.value.passwordConfirmError &&
        !formErrors.value.termsError
      )
    }

    watch(formData, validateForm)

    const submitForm = async () => {
      validateForm()
      if (
        !formErrors.value.passwordError &&
        !formErrors.value.passwordConfirmError &&
        !formErrors.value.termsError
      ) {
        try {
          // @ts-ignore
          showLoading('Creating...')
          await sendMessage('setPassword', formData.password)
          // const pwd = await sendMessage('getPassword')
          // console.log('pwd: ', pwd)

          // const phrase = 'vague clog raise involve sting domain fossil grab valve village fiction catch';
          // const dePhrase = await sendMessage('encryptMnemonic', phrase)
          // const newPhrase = await sendMessage('decryptMnemonic', dePhrase)
          // console.log('dePhrase: %s newPhrase: %s', dePhrase, newPhrase)
          // clear all data
          if (isClear.value) {
            // @ts-ignore
            store.clearAllData()
          }
          await store
            .createNewUser(
              isImported.value.length === 12 ? isImported.value.join(' ') : ''
            )
            .finally(() => {
              // @ts-ignore
              hideLoading()
            })
          postToast('Success', 'success')
          hideFullscreen()
          if (isImported.value.length === 12) {
            router.push('/')
          } else {
            router.push('/common/backupKey')
          }
        } catch (error) {
          console.error('Submission error:', error)
          postToast('error: ' + error)
        }
      }
    }
    // @ts-ignore
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Message received ==password', message, sender, sendResponse)
      sendResponse()
    })
    return {
      togglePasswordVisibility,
      formErrors,
      formData,
      showPassword,
      submitForm,
      disabledVisible,
      isImported,
      isClear,
    }
  },
  created() {
    // @ts-ignore
    this.$root.setTitle('Set password')
    // console.log('created params: ', this.$route.params, location.href, this.isImported)
  },
}
</script>

<template>
  <div class="min-box px-4 text-gray-700 cp">
    <div class="w-full max-w-xs mt-6">
      <div class="text-sm mb-5 font-medium">
        Remember this password to unlock the wallet.
      </div>

      <label class="input-box input-append">
        <input
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter 8-12 letters and numbers"
        />
        <div class="icon">
          <IconEyeOpen
            v-if="showPassword"
            @click="togglePasswordVisibility"
          />
          <IconEyeClose
            v-else
            @click="togglePasswordVisibility"
          />
        </div>
      </label>

      <label
        :class="[
          'input-box input-append mt-4',
          formErrors.passwordError || formErrors.passwordConfirmError
            ? 'error'
            : '',
        ]"
      >
        <input
          v-model="formData.passwordConfirm"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Confirm the password"
        />
        <div class="icon">
          <IconEyeOpen
            v-if="showPassword"
            @click="togglePasswordVisibility"
          />
          <IconEyeClose
            v-else
            @click="togglePasswordVisibility"
          />
        </div>
      </label>

      <div
        v-if="
          formErrors.passwordError ||
          formErrors.passwordConfirmError ||
          formErrors.termsError
        "
        class="err-tips"
      >
        <span class="font-medium">
          {{
            formErrors.passwordError ||
            formErrors.passwordConfirmError ||
            formErrors.termsError
          }}
        </span>
      </div>

      <div class="cursor-pointer my-5 text-left">
        <input
          v-model="formData.agree"
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary rounded-full"
        />
        <span class="label-text pl-2 text-gray-700">
          Click to agree to our
          <a
            target="_blank"
            href="https://www.baidu.com"
            class="no-underline text-primary pl-1"
          >
            Terms of Service
          </a>
        </span>
      </div>
      <button
        :disabled="disabledVisible"
        class="btn btn-primary btn-md w-full"
        @click.prevent="submitForm"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// .cp{
//   .checkbox{
//     &:checked{
//       background-image: url('data:image/svg+xml,%3csvg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg"%3e%3cpath d="M1.33325 2.99967L3.33325 4.99967L6.99992 1.33301" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/%3e%3c/svg%3e')
//     }
//   }
// }
</style>
