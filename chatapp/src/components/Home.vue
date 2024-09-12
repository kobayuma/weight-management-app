<script setup>
import { inject, ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import socketManager from '../socketManager.js';

// #region global state
const userName = inject("userName");
// #endregion

// #region local variable
const router = useRouter();
const socket = socketManager.getInstance();
// #endregion

// #region reactive variable
const chatContent = ref("");
const chatList = reactive([]);
// #endregion

// #region lifecycle
onMounted(() => {
  registerSocketEvent();
});
// #endregion

// #region browser event handler
const onPublish = () => {
  if (chatContent.value === "") return;
  socket.emit("publishEvent", userName.value + "さん：" + chatContent.value);
  chatContent.value = "";
};

const onExit = () => {
  socket.emit("exitEvent", userName.value + "さんが退室しました。");
  router.push({ name: "login" });
};

const onMemo = () => {
  if (chatContent.value === "") return;
  chatList.push(userName.value + "さんのメモ：" + chatContent.value);
  chatContent.value = "";
};
// #endregion

// #region socket event handler
const onReceiveEnter = (data) => {
  chatList.push(data);
};

const onReceiveExit = (data) => {
  chatList.push(data);
};

const onReceivePublish = (data) => {
  chatList.push(data);
};
// #endregion

// #region local methods
const registerSocketEvent = () => {
  socket.on("enterEvent", (data) => {
    onReceiveEnter(data);
  });

  socket.on("exitEvent", (data) => {
    onReceiveExit(data);
  });

  socket.on("publishEvent", (data) => {
    onReceivePublish(data);
  });
};
// #endregion

// #region navigation handlers
const toWeights = () => {
  router.push({name: "weights"});
};
const toMealcontents = () => {
  router.push({ name: "mealcontents"});
};
// #endregion
</script>

<template>
  <div class="container">
    <button type="button" class="exit-button" @click="onExit">退室</button>
    <p>{{ userName }}さん</p>
    <h1 class="title">Home</h1>
    <div class="button-group-horizontal">
      <button type="button" @click="toWeights" class="button-blue">体重記録</button>
      <button type="button" @click="toMealcontents" class="button-blue">食事内容</button>
    </div>
    <div class="chat-area">
      <textarea v-model.trim="chatContent" @keypress.enter="onPublish" class="textarea" placeholder="投稿文を入力してください"></textarea>
      <div class="button-group-horizontal">
        <button class="button router-button" @click="onPublish">投稿</button>
        <button class="button router-button" @click="onMemo">メモ</button>
      </div>
      <div class="scrollable-container">
        <div v-if="chatList.length !== 0" class="chat-list">
          <ul>
            <li class="item mt-4" v-for="(chat, i) in chatList.slice().reverse()" :key="i">{{ chat }}</li>
          </ul>
        </div>
      </div>
    </div>
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
  position: relative;
}

.exit-button {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: #ff6600;
  color: #fff;
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.title {
  font-size: 32px;
  margin-bottom: 16px;
  color: #ff6600;
}

.button-group-horizontal {
  display: flex;
  justify-content: space-between;
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
  width: 48%;
}

.button-blue {
  background-color: #007bff;
  color: #fff;
  padding: 8px;
  margin-bottom: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-size: 16px;
  width: 48%;
}

.chat-area {
  width: 100%;
  margin-bottom: 16px;
}

.textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
}

.chat-list {
  width: 100%;
}

.chat-item {
  display: block;
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.scrollable-container {
  max-height: 200px;  /* 表示枠の高さを設定 */
  overflow-y: auto;  /* 縦方向にスクロール可能にする */
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
}
</style>
