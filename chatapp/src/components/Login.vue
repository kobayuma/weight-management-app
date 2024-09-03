<script setup>
import { inject, ref } from "vue"
import { useRouter } from "vue-router"
import axios from 'axios'

// #region global state
const userName = inject("userName")
// #endregion

// #region local variable
const router = useRouter()
// #endregion

// #region reactive variable
const inputUserName = ref("")
const inputPassword = ref("") // パスワードフィールドを追加
// #endregion

// #region browser event handler
const onEnter = async () => {
  // ユーザー名とパスワードが入力されているかチェック
  if (inputUserName.value === "" || inputPassword.value === "") {
    alert("ユーザー名とパスワードを入力してください。");
    return 0;
  }

  try {
    // サーバーサイドでユーザー認証を行う
    const response = await axios.post('/api/login', {
      name: inputUserName.value,
      password: inputPassword.value
    });

    if (response.status === 200) {
      // 認証が成功した場合、ユーザー名を格納してチャット画面へ遷移
      userName.value = inputUserName.value;
      router.push({ name: "chat" });
    }
  } catch (error) {
    alert("ログインに失敗しました。ユーザー名またはパスワードが間違っています。");
  }
}
// #endregion
</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">ChatLogin</h1>
    <div class="mt-10">
      <p>ユーザー名</p>
      <input type="text" class="user-name-text" v-model="inputUserName" />
    </div>
    <div class="mt-10">
      <p>パスワード</p>
      <input type="password" class="user-name-text" v-model="inputPassword" />
    </div>
    <button type="button" @click="onEnter" class="button-normal">入室する</button>
  </div>
</template>

<style scoped>
.user-name-text {
  width: 200px;
  border: 1px solid #888;
  margin-bottom: 16px;
}
</style>
