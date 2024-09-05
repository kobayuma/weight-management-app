<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router"

const router = useRouter()

// #region reactive variables
const inputUserName = ref("")
const inputPassword = ref("")
// #endregion

// #region browser event handler
const onRegister = () => {
  // ユーザー名、メール、パスワードが入力されているかチェック
  if (inputUserName.value === "" ||inputPassword.value === "") {
    alert("すべてのフィールドに入力してください。");
    return;
  }
  router.push({ name: "home" })
}
// #endregion
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
      <input type="password" class="password-text" v-model="inputPassword" />
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