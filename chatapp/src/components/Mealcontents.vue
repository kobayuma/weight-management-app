<script setup>
import { ref, onMounted } from 'vue';
import socketManager from '../socketManager.js'



// #region reactive variable
const inputPrompt = ref("")
const gptResponse = ref("")
const mealTime = ref("")
const stapleFood = ref("")
const sideDish = ref("")
const drink = ref("")
// #endregion

const socket = socketManager.getInstance()

const fetchOpenAIResponse = () => {
  const inputPrompt = `次の${mealTime.value}の栄養バランスの評価と、アドバイスをください。主食：${stapleFood.value}、おかず：${sideDish.value}、飲み物：${drink.value}`
  socket.emit("promptEvent", { prompt: inputPrompt });
};
const debug = () => {
  const inputPrompt = `次の${mealTime.value}の栄養バランスの評価と、アドバイスをください。主食：${stapleFood.value}、おかず：${sideDish.value}、飲み物：${drink.value}`

  console.log(inputPrompt);
}

onMounted(() => {
  socket.on("promptResponse", (data) => {
    gptResponse.value = data.response;
  });
});

</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">食事内容</h1>
    <div class="mt-4">
      <label for="mealTime" class="text-h5 font-weight-medium">食事時間を選択:</label>
      <select v-model="mealTime" id="mealTime" class="select">
        <option value="朝食">朝食</option>
        <option value="昼食">昼食</option>
        <option value="晩食">夕食</option>
      </select>
    </div>
    <div class="mt-10">
      <label for="stapleFood" class="text-h5 font-weight-medium">主食:</label>
      <input v-model="stapleFood" id="stapleFood" type="text" placeholder="主食を入力してください" class="input" />
    </div>

    <div class="mt-4">
      <label for="sideDish" class="text-h5 font-weight-medium">おかず:</label>
      <input v-model="sideDish" id="sideDish" type="text" placeholder="おかずを入力してください" class="input" />
    </div>

    <div class="mt-4">
      <label for="drink" class="text-h5 font-weight-medium">飲み物:</label>
      <input v-model="drink" id="drink" type="text" placeholder="飲み物を入力してください" class="input" />
    </div>
  
    <!-- <div class="mt-10">
      <textarea variant="outlined" placeholder="食事内容の入力してください" rows="4" class="area"></textarea> 
    </div> -->
    <button type="button" @click="fetchOpenAIResponse" class="button-normal mt-4">GPT</button>
    <button type="button" @click="debug" class="button-normal mt-4">debug</button>

    <h2 class="text-h5 font-weight-medium">GPTの応答</h2>
    <div v-if="gptResponse" class="mt-4">
      <p>{{ gptResponse }}</p>
    </div>
    <div>    
      <router-link to="/home/" class="link">
        <button type="button" class="button-normal">Home</button>
      </router-link>
    </div>

  </div>
</template>


<style scoped>
.area {
  width: 500px;
  border: 1px solid #000;
  margin-top: 8px;
}
</style>