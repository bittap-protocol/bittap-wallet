
<script setup lang="ts">
// @ts-ignore
import IconEyeOff from '~icons/mdi/eye-off'
// @ts-ignore
import IconEye from '~icons/mdi/eye'
// @ts-ignore
import IconMdiWarningOctagonOutline from '~icons/mdi/warning-octagon-outline';

// import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
import { ref, reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { TestPassword } from '@/popup/libs/tools'

const showPassword = ref(false);
const formData = reactive({
  password: '12345678',
  passwordConfirm: '12345678',
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
  formErrors.value.passwordError = 
    !TestPassword(formData.password.length)
      ? 'Password must be 8-12 characters long.'
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

</script>

<template>
    <div class="flex flex-col items-center justify-center min-box px-2">
      <div class="flex flex-col items-start w-full max-w-xs">
        <div class="text-2xl font-bold mb-5 text-center">Create wallet password</div>
        <div class="text-sm mb-5">Remember your password, which is used to unlock your wallet.</div>

      <label class="input input-bordered flex items-center gap-2 w-full my-2">
        <input
v-model="formData.password" :type="showPassword ? 'text' : 'password'" class="grow border-0 border-transparent bg-transparent 
        hover:bg-transparent hover:border-transparent focus:bg-transparent focus:border-transparent
        active:bg-transparent active:border-transparent" placeholder="Please enter an 8-12 digit password" />
        <IconEye v-if="showPassword"  @click="togglePasswordVisibility" />
        <IconEyeOff v-else  @click="togglePasswordVisibility" />
      </label>

      <label class="input input-bordered flex items-center gap-2 w-full my-2">
        <input
v-model="formData.passwordConfirm" :type="showPassword ? 'text' : 'password'" class="grow border-0 border-none border-transparent bg-transparent 
        hover:bg-transparent hover:border-transparent focus:bg-transparent focus:border-transparent
        active:bg-transparent active:border-transparent" placeholder="Confirm password" />
        <IconEye v-if="showPassword"  @click="togglePasswordVisibility" />
        <IconEyeOff v-else  @click="togglePasswordVisibility" />
      </label>

      <div v-if="formErrors.passwordError || formErrors.passwordConfirmError || formErrors.termsError" class="text-white flex flex-row flex-nowrap justify-around items-center px-6 py-4 w-full border-0 rounded relative mb-4 bg-sky-500">
        <span class="text-xl inline-block mr-5 align-middle">
          <IconMdiWarningOctagonOutline />
        </span>
        <span class="inline-block text-red-500 font-medium">
          {{ formErrors.passwordError || formErrors.passwordConfirmError || formErrors.termsError }}
        </span>
      </div>

        <div class="cursor-pointer label my-2">
          <input v-model="formData.agree" type="checkbox" class="checkbox checkbox-primary" />
          <span class="label-text pl-2">Click to agree to our 
            <RouterLink to="/common/termsService" class="underline text-sky-500 pl-1 ">Terms of Service</RouterLink>  
          .</span> 
        </div>
        <button class="btn btn-primary w-full" @click.prevent="submitForm">Create new wallet</button>
      </div>
    </div>
  </template>
  

  <style scoped>
  
  </style>
  