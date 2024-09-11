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
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">ChatLogin</h1>
    <div class="mt-10">
      <p>ユーザー名</p>
      <input type="text" class="user-name-text" v-model="inputUserName" @keypress.enter="onEnter"/>
    </div>
    <div class="mt-10">
      <p>パスワード</p>
      <input type="password" class="user-name-text" v-model="inputPassword" @keypress.enter="onEnter"/>
    </div>
    <button type="button" @click="onEnter" class="button-normal">入室する</button>
    <button type="button" @click="goToRegister" class="button-normal mt-4">新規登録</button>
  </div>
</template>

<style scoped>
.user-name-text {
  width: 200px;
  border: 1px solid #888;
  margin-bottom: 16px;
}
</style>
