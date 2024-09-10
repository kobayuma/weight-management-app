<script setup>
import { inject, ref} from 'vue'
import { useRouter } from "vue-router"
import socketManager from '../socketManager.js'

const router = useRouter()
const socket = socketManager.getInstance()

const userName = inject("userName")
// #region reactive variables
const inputUserName = ref("")
const inputPassword = ref("")
// #endregion

// #region browser event handler
const onRegister = () => {
  // ユーザー名,パスワードが入力されているかチェック
  if (inputUserName.value === "" ||inputPassword.value === "") {
    alert("すべてのフィールドに入力してください。");
    return;
  }

  socket.emit("userRegistration", { registerUsername: inputUserName.value, registerPassword: inputPassword.value }, (response) => {
    if (response.success) {
      alert(response.message)
      // 全体で使用するnameに入力されたユーザー名を格納
      userName.value = inputUserName.value;
      router.push({name : "home"})
    } else {
      alert(response.message)
    }
  });
}

</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">ユーザー登録</h1>
    <div class="mt-10">
      <p>ユーザー名</p>
      <input type="text" class="user-name-text" v-model="inputUserName" />
    </div>
    <div class="mt-10">
      <p>パスワード</p>
      <input type="text" class="password-text" v-model="inputPassword" />
    </div>
    <button type="button" @click="onRegister" class="button-normal">登録する</button>
  </div>
  <router-link to="/home/" class="link">
      <button type="button" class="button-normal">Home</button>
  </router-link>
</template>

<style scoped>
.user-name-text, .email-text, .password-text {
  width: 200px;
  border: 1px solid #888;
  margin-bottom: 16px;
}
</style>