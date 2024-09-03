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
const inputPassword = ref("")
// #endregion

// #region browser event handler
const onEnter = async () => {
  if (inputUserName.value === "" || inputPassword.value === "") {
    alert("ユーザー名とパスワードを入力してください。");
    return 0;
  }

  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      name: inputUserName.value,
      password: inputPassword.value
    });

    if (response.status === 200) {
      userName.value = inputUserName.value;
      router.push({ name: "chat" });
    }
  } catch (error) {
    alert("ログインに失敗しました。ユーザー名またはパスワードが間違っています。");
  }
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
      <input type="text" class="user-name-text" v-model="inputUserName" />
    </div>
    <div class="mt-10">
      <p>パスワード</p>
      <input type="password" class="user-name-text" v-model="inputPassword" />
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
.button-normal {
  display: block;
  width: 200px;
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
