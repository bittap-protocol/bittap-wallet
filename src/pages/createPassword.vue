
<script lang="ts">
// @ts-ignore
import IconMdiWarningOctagonOutline from '~icons/mdi/warning-octagon-outline';

// @ts-ignore
import IconEyeOpen from '@/components/svgIcon/EyeOpen.vue'
// @ts-ignore
import IconEyeClose from '@/components/svgIcon/EyeClose.vue'

// import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
import { ref, reactive } from 'vue';
import {  useRouter } from 'vue-router';
import { TestPassword } from '@/popup/libs/tools'

export default {
  components: {
    IconMdiWarningOctagonOutline, IconEyeOpen, IconEyeClose
  },
  setup() { 

    const showPassword = ref(false);
    const disabledVisible = ref(true);
    const formData = reactive({
      password: 'Abc123456##',
      passwordConfirm: 'Abc123456##',
      agree: false,
    })

    const store = useAppStore()

    const router = useRouter()


    store.isGoBack()


    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };


    const formErrors = ref({
      passwordError: '',
      passwordConfirmError: '',
      termsError: '',
    })

    const validateForm = () => {
      console.log('check:', [
        TestPassword(formData.password),
        formData.password
      ])
      formErrors.value.passwordError =
        !TestPassword(formData.password)
          ? 'The password must be 8 to 16 characters starting with an uppercase letter.'
          : '';

      formErrors.value.passwordConfirmError =
        formData.password !== formData.passwordConfirm
          ? 'Passwords do not match.'
          : '';
      console.log('formData.agree: ', [formData.agree])
      formErrors.value.termsError =
        !formData.agree
          ? 'You must agree to the terms.'
          : '';
      disabledVisible.value = !(!formErrors.value.passwordError && !formErrors.value.passwordConfirmError && !formErrors.value.termsError)
    };

    watch(formData, validateForm);

    const submitForm = async () => {
      validateForm();
      if (!formErrors.value.passwordError && !formErrors.value.passwordConfirmError && !formErrors.value.termsError) {
        try {
          await store.savePassword(formData.password)
          await store.createAccount().then(() => {
            store.setGoBackUrl('')
            router.push('/common/backupKey')
          })


        } catch (error) {
          console.error('Submission error:', error);
          alert('error: ' + error)
        }
      }
    };
    return {
      togglePasswordVisibility, formErrors, formData, showPassword, submitForm, disabledVisible
    }
  },
  created() {
    this.$root.setTitle('Set password')
  },
}

</script>

<template>
  <div class="min-box px-4 text-gray-700">
    <div class="w-full max-w-xs mt-6">
      <div class="text-sm mb-5">Remember this password to unlock the wallet.</div>

      <label class="input-box input-append">
        <input v-model="formData.password" :type="showPassword ? 'text' : 'password'"
          placeholder="Please enter an 8-12 digit password" />
        <div class="icon">
          <IconEyeOpen v-if="showPassword" @click="togglePasswordVisibility" />
          <IconEyeClose v-else @click="togglePasswordVisibility" />
        </div>
      </label>

      <label class="input-box input-append">
        <input v-model="formData.passwordConfirm" :type="showPassword ? 'text' : 'password'"
          placeholder="Confirm password" />
        <div class="icon">
          <IconEyeOpen v-if="showPassword" @click="togglePasswordVisibility" />
          <IconEyeClose v-else @click="togglePasswordVisibility" />
        </div>
      </label>

      <div v-if="formErrors.passwordError || formErrors.passwordConfirmError || formErrors.termsError" class="err-tips">
        <span class="text-xl">
          <IconMdiWarningOctagonOutline />
        </span>
        <span class="font-medium">
          {{ formErrors.passwordError || formErrors.passwordConfirmError || formErrors.termsError }}
        </span>
      </div>

      <div class="cursor-pointer my-4 text-left">
        <input v-model="formData.agree" type="checkbox" class="checkbox checkbox-primary" />
        <span class="label-text pl-2">Click to agree to our
          <RouterLink to="/common/termsService" class="no-underline text-primary pl-1 ">Terms of Service</RouterLink>
        </span>
      </div>
      <button :disabled="disabledVisible" class="btn btn-primary w-full" @click.prevent="submitForm">Next</button>
    </div>
  </div>
</template>
  

  <style scoped>
  
  </style>
  