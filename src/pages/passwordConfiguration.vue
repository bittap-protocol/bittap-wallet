<template>
  <div class="w-full min-box pwd">
    <div class="w-full py-20 flex flex-col justify-center items-center px-4">
      <div class="item">
        <input v-model="confirmPassword" type="password" class="field" placeholder="Current password" />
      </div>
      <div class="item">
        <input v-model="newPassword" type="password" class="field" placeholder="New password" />
      </div>
      <div class="item">
        <input v-model="confirmPassword" type="password" class="field" placeholder="Confirm password" />
      </div>
      <button class="button" :disabled="password.length >= 8  && newPassword.length >= 8  && newPassword != confirmPassword" @click="changePassword">Change password</button>
    </div>
  </div>
</template>
  
<script lang="ts">
// @ts-ignore
import { useAppStore } from '@/stores/app.store'
// @ts-ignore
import { TestPassword } from '@/popup/libs/tools'

export default {
  setup() {
    
    const store = useAppStore()
    // const router = useRouter()

    store.setGoBackUrl('')
    store.isGoBack()
    return {

    }
  },
  data() {
    return {
      password: '',
      newPassword: '',
      confirmPassword: '',
    }
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
    changePassword(){
      if(!TestPassword(this.password)) {
        // @ts-ignore
        return this.$root._toast('Current password format is invalid','error')
      }
      if(!TestPassword(this.newPassword)) {
        // @ts-ignore
        return this.$root._toast('New password format is invalid','error')
      }
      if(this.newPassword != this.confirmPassword) {
        // @ts-ignore
        return this.$root._toast('The new password is different from the confirmed password','error')
      }
      // Authentication password
      const store = useAppStore()
      if(store.AuthenticationPassword(this.password)) {
        // @ts-ignore
        return this.$root._toast('Current password is invalid','error')
      }
      
      // Change password
      store.savePassword(this.newPassword)
      // @ts-ignore
      this.$root._toast('Password changed','success')

    }
  }
}


</script>

<style lang="scss" scoped>
.pwd {
  .item{
    @apply mb-4 w-full ;
    .field{
      @apply w-full ;
    }
  }
}
</style>