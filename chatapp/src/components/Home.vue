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
  const publishedTime = new Date().toLocaleTimeString({ timeZone: 'Asia/Tokyo' });
  socket.emit("publishEvent", "[" + publishedTime + "]  " + userName.value + "さん：" + chatContent.value);
  chatContent.value = "";
};

const onExit = () => {
  socket.emit("exitEvent", userName.value + "さんが退室しました。");
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
  <div class="mx-auto my-5 px-4">
    <p>ログインユーザ：{{ userName }}さん</p>
    <h1 class="text-h3 font-weight-medium">Home</h1>
    <button type="button" @click="toWeights" class="button-normal">体重</button>
    <button type="button" @click="toMealcontents" class="button-normal">食事内容</button>

    <div class="mt-10">
      <textarea v-model.trim="chatContent" @keypress.enter="onPublish" variant="outlined" placeholder="投稿文を入力してください" rows="4" class="area"></textarea>
      <div class="mt-5">
        <button class="button-normal" @click="onPublish">投稿</button>
        <button class="button-normal util-ml-8px" @click="onMemo">メモ</button>
      </div>
      <div class="mt-5" v-if="chatList.length !== 0">
        <ul>
          <li class="item mt-4" v-for="(chat, i) in chatList.slice().reverse()" :key="i">{{ chat }}</li>
        </ul>
      </div>
    </div>
    <router-link to="/" class="link">
      <button type="button" class="button-normal button-exit" @click="onExit">退室する</button>
    </router-link>
  </div>
</template>

<style scoped>
.link {
  text-decoration: none;
}

.area {
  width: 500px;
  border: 1px solid #000;
  margin-top: 8px;
}

.item {
  display: block;
}

.util-ml-8px {
  margin-left: 8px;
}

.button-exit {
  color: #000;
  margin-top: 8px;
}
</style>
