<script setup>
import { ref } from 'vue'
import axios from 'axios'

// #region reactive variables
const inputUserName = ref("")
const inputEmail = ref("") // メールフィールドを追加
const inputPassword = ref("")
// #endregion

// #region browser event handler
const onRegister = async () => {
  // ユーザー名、メール、パスワードが入力されているかチェック
  if (inputUserName.value === "" || inputEmail.value === "" || inputPassword.value === "") {
    alert("すべてのフィールドに入力してください。");
    return;
  }

  try {
    // サーバーサイドでユーザー登録を行う
    const response = await axios.post('http://localhost:3000/api/register', {
      name: inputUserName.value,
      email: inputEmail.value,
      password: inputPassword.value
    });

    if (response.status === 201) {
      alert("ユーザーが登録されました。");
    }
  } catch (error) {
    alert("ユーザー登録に失敗しました。" + error.response.data.error);
  }
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
      <p>メールアドレス</p>
      <input type="email" class="email-text" v-model="inputEmail" />
    </div>
    <div class="mt-10">
      <p>パスワード</p>
      <input type="password" class="password-text" v-model="inputPassword" />
    </div>
    <button type="button" @click="onRegister" class="button-normal">登録する</button>
  </div>
</template>

<style scoped>
.user-name-text, .email-text, .password-text {
  width: 200px;
  border: 1px solid #888;
  margin-bottom: 16px;
}
</style>