<script setup>
import { inject, ref } from "vue"
import { useRouter } from "vue-router"
import socketManager from '../socketManager.js'


// #region global state
const userName = inject("userName")
const inputPassword = ref("")
// #endregion

// #region local variable
const router = useRouter()
const socket = socketManager.getInstance()
// #endregion

// #region reactive variable
const inputUserName = ref("")
// #endregion

// #region browser event handler
// 入室メッセージをクライアントに送信する
const onEnter = () => {
  // ユーザー名が入力されているかチェック
  if (inputUserName.value === "" || inputPassword.value === "") {
    alert("ユーザー名とパスワードを入力してください。");
    return 0;
  }
  
  //ログインイベントを送信
  socket.emit("loginEvent", { username: inputUserName.value, password: inputPassword.value }, (response) => {
    if (response.success) {
      // alert(`ようこそ！${inputUserName.value}さん`)
      // 入室メッセージを送信
      socket.emit("enterEvent", inputUserName.value + "さんが入室しました。")
      // 全体で使用するnameに入力されたユーザー名を格納
      userName.value = inputUserName.value;
      // チャット画面へ遷移
      router.push({ name: "home" });
    } else{
      alert(response.message)
    }
  });
}
const goToRegister = () => {
  router.push({ name: 'register' });
}
// #endregion

</script>

<template>
  <div class="container">
    <h1 class="title">楽楽減量</h1>
    <div class="input-group">
      <p calss="label">ユーザー名</p>
      <input type="text" class="input" v-model="inputUserName" @keypress.enter="onEnter"/>
    </div>
    <div class="input-group">
      <p class="label">パスワード</p>
      <input type="password" class="input" v-model="inputPassword" @keypress.enter="onEnter"/>
    </div>
    <button type="button" @click="onEnter" class="button">入室する</button>
    <button type="button" @click="goToRegister" class="button">新規登録</button>
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

.button-group {
  display: flex;
  flex-direction: column;
  width: 100%;
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
