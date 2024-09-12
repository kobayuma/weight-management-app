<script setup>
import { inject, ref } from 'vue'
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
  if (inputUserName.value === "" || inputPassword.value === "") {
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
  <div class="container">
    <h1 class="title">新規登録画面</h1>
    <div class="input-group">
      <p class="label">ユーザー名</p>
      <input type="text" class="input" v-model="inputUserName" />
    </div>
    <div class="input-group">
      <p class="label">パスワード</p>
      <input type="password" class="input" v-model="inputPassword" />
    </div>
    <button type="button" @click="onRegister" class="button">登録する</button>
    <router-link to="/">
      <button type="button" class="button">ログイン画面に戻る</button>
    </router-link>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
}

.title {
  font-size: 32px;
  margin-bottom: 16px;
  color: #ff6600;
}

.input-group {
  width: 100%;
  margin-bottom: 16px;
}

.label {
  margin-bottom: 8px;
  color: #555;
}

.input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button {
  background-color: #ff6600;
  color: #fff;
  padding: 8px;
  margin-bottom: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-size: 16px;
}

</style>
