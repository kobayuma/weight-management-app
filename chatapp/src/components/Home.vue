<script setup>

import { useRouter } from "vue-router"
import socketManager from '../socketManager.js'

// #region local variable
const router = useRouter()
const socket = socketManager.getInstance()
// #endregion

// #region browser event handler
// 入室メッセージをクライアントに送信する
const toChat = () => {
  router.push({ name: "chat" })
}
const toWeights = () => {
  router.push({name: "weights"})
}
const toMealcontents = () => {
  router.push({ name: "mealcontents"})
}
// #endregion
</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">Home</h1>
        <button type="button" @click="toChat" class="button-normal">Chat</button>
        <button type="button" @click="toWeights" class="button-normal">体重</button>
        <button type="button" @click="toMealcontents" class="button-normal">食事内容</button>
  </div>
  <router-link to="/" class="link">
    <button type="button" class="button-normal button-exit">退室する</button>
  </router-link>
</template>

<style scoped>
.button-exit {
  color: #000;
  margin-top: 8px;
}
</style>

