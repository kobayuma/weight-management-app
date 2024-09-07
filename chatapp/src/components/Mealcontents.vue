<script setup>
import { ref, onMounted } from 'vue';
import socketManager from '../socketManager.js'

// #region reactive variable
const gptResponse = ref("")
const mealTime = ref("")
const stapleFood = ref("")
const mainDish = ref("")
const sideDish = ref("")
const drink = ref("")
// #endregion

const socket = socketManager.getInstance()

const fetchOpenAIResponse = () => {
  if(mealTime.value === ""){
    alert("食事時間を選択してください。")
    return 0
  }
  const inputPrompt = `${mealTime.value}の内容は、主食：${stapleFood.value}、主菜：${mainDish.value}、副菜：${sideDish.value}、飲み物：${drink.value}。エネルギーバランス
(総カロリー摂取量とPFCバランス)と栄養素バランスの観点の二つの観点で10点満点で点数をつけて。また、おすすめのメニューを簡潔に教えて。`
  socket.emit("promptEvent", { prompt: inputPrompt });
};

onMounted(() => {
  socket.on("promptResponse", (data) => {
    gptResponse.value = data.response;
  });
});

</script>

<template>
  <div class="container">
    <h1 class="text-h3 font-weight-medium">食事内容</h1>
    <button type="button" @click="$router.push('/home')" class="button-home">Home</button>

    <div class="input-group">
      <label for="mealTime" class="label">食事時間を選択:</label>
      <select v-model="mealTime" id="mealTime" class="select">
        <option value="朝食">朝食</option>
        <option value="昼食">昼食</option>
        <option value="夕食">夕食</option>
      </select>
    </div>
    
    <div class="input-group">
      <label for="stapleFood" class="label">主食:</label>
      <div class="input-wrapper">
        <input v-model="stapleFood" id="stapleFood" type="text" placeholder="例: ご飯、パン、麺類" class="input" />
      </div>
    </div>

    <div class="input-group">
      <label for="mainDish" class="label">主菜:</label>
      <div class="input-wrapper">
        <input v-model="mainDish" id="mainDish" type="text" placeholder="例: 肉、魚、卵、大豆製品" class="input" />
      </div>
    </div>

    <div class="input-group">
      <label for="sideDish" class="label">副菜:</label>
      <div class="input-wrapper">
        <input v-model="sideDish" id="sideDish" type="text" placeholder="例: 野菜料理、海藻類" class="input" />
      </div>
    </div>

    <div class="input-group">
      <label for="drink" class="label">飲み物:</label>
      <div class="input-wrapper">
        <input v-model="drink" id="drink" type="text" placeholder="例: お茶、水、ジュース" class="input" />
      </div>
    </div>
    
    <button type="button" @click="fetchOpenAIResponse" class="button-submit">送信</button>
    <h3 class="subtitle">AIの評価</h3>
    <div v-if="gptResponse" class="response">
      <p>{{ gptResponse }}</p>
    </div>
  </div>
</template>


<style scoped>
.container {
  max-width: 100%;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
}

.button-home {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
}

.button-home:hover {
  background-color: #c74516;
}

.title {
  font-size: 1.5rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 1.25rem;
  font-weight: 500;
  margin-top: 16px;
}

.input-group {
  margin-bottom: 16px;
}

.label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.input-wrapper {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px;
}

.input {
  width: 100%;
  border: none;
  padding: 8px;
  border-radius: 4px;
}

.button-submit {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px;
  width: 100%;
  cursor: pointer;
  border-radius: 4px;
}

.button-submit:hover {
  background-color: #d05010;
}

.response {
  margin-top: 16px;
  font-size: 1rem;
  text-align: center;
}
</style>