<script setup>
import { inject, ref } from "vue"
import { useRouter } from "vue-router"
import socketManager from '../socketManager.js'
import OpenAI from "openai";

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
  // 入室メッセージを送信
  socket.emit("enterEvent", inputUserName.value + "さんが入室しました。")
  // 全体で使用するnameに入力されたユーザー名を格納
  userName.value = inputUserName.value;
  // チャット画面へ遷移
  router.push({ name: "home" })
}
const goToRegister = () => {
  router.push({ name: 'register' });
}
// #endregion

const fetchOpenAIResponse = async () => {
  const prompt = "大阪のおすすめの飲食店を教えて";

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    console.log("Message content:", completion.choices[0].message.content);
  } catch (error) {
    console.error("Failed to fetch from OpenAI:", error);
  }
};
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // process.envの代わりにimport.meta.envを使う
  dangerouslyAllowBrowser: true, 
});

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
    <button type="button" @click="fetchOpenAIResponse" class="button-normal mt-4">GPT</button>
  </div>
</template>

<style scoped>
.user-name-text {
  width: 200px;
  border: 1px solid #888;
  margin-bottom: 16px;
}
</style>
