<script setup>
import { inject, ref, reactive } from 'vue';
import socketManager from '../socketManager.js'

// #region global state
const userName = inject("userName")
// #endregion

// #region reactive variable
const gptResponse = ref("")
const mealTime = ref("")
const stapleFood = ref("")
const mainDish = ref("")
const sideDish = ref("")
const drink = ref("")
const pastMenu = ref([])
// #endregion

const socket = socketManager.getInstance()

const submitMeals = () => {
  if (mealTime.value === "") {
    alert("食事時間を選択してください。");
    return;
  }
  const mealData = {
    userName: userName.value,
    mealTime: mealTime.value,
    stapleFood: stapleFood.value,
    mainDish: mainDish.value,
    sideDish: sideDish.value,
    drink: drink.value
  };
  
  socket.emit('mealsEvent', mealData, (response) => {
    if (response.success) {
      alert('食事内容が保存されました');
    } else {
      alert('食事内容の保存に失敗しました: ' + response.message);
    }
  });
};

const getPastMenu = () => {
  // ユーザーの過去のメニューデータを取得
  socket.emit("pastMenuEvent", userName.value, (response) => {
    if (response.success) {
      pastMenu.value = response.data;
    } else {
      alert('過去のメニューの取得に失敗しました: ' + response.message);
    }
  });
}

const toGPT = () => {
  if (mealTime.value === "") {
    alert("食事時間を選択してください。");
    return;
  }
  const inputPrompt = `${mealTime.value}の内容は、主食：${stapleFood.value}、主菜：${mainDish.value}、副菜：${sideDish.value}、飲み物：${drink.value}。エネルギーバランス(総カロリー摂取量とPFCバランス)と栄養素バランスの観点などの観点から総合評価を10点満点で教えて。また、おすすめのメニューを簡潔に教えて。`;
  socket.emit("promptEvent", { prompt: inputPrompt }, (data) => {
    gptResponse.value = data.response;
  });
}


</script>

<template>
  <div class="container">
    <p>ログインユーザ：{{ userName }}さん</p>
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
    
    <button type="button" @click="submitMeals" class="button-submit">データベースに保存</button>
    <button type="button" @click="getPastMenu" class="button-submit">過去の自分のメニューを表示</button>
    <button type="button" @click="toGPT" class="button-submit">AIの評価を聞く(10点満点)</button>

    <h3 class="subtitle">過去の{{userName}}さんのメニュー一覧</h3>
    <div class="scrollable-container">
      <table class="menu-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>食事時間</th>
            <th>主食</th>
            <th>主菜</th>
            <th>副菜</th>
            <th>飲み物</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(menu, index) in pastMenu" :key="index">
            <td>{{ menu[0] }}</td>
            <td>{{ menu[1] === 1 ? '朝食' : menu[1] === 2 ? '昼食' : '夕食' }}</td>
            <td>{{ menu[2] }}</td>
            <td>{{ menu[3] }}</td>
            <td>{{ menu[4] }}</td>
            <td>{{ menu[5] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="subtitle">AIの評価</h3>
    <div class="scrollable-container">
      <div v-if="gptResponse" class="response">
        <p>{{ gptResponse }}</p>
      </div>
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

.menu-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.menu-table th, .menu-table td {
  border: 1px solid #000;  /* テーブル全体に罫線を追加 */
  padding: 8px;
  text-align: left;
}

.menu-table th {
  background-color: #f2f2f2;
}

.scrollable-container {
  max-height: 200px;  /* 表示枠の高さを設定 */
  overflow-y: auto;  /* 縦方向にスクロール可能にする */
  border: 1px solid #ccc;
  padding: 8px;
  margin-top: 8px;
}

.response {
  margin-top: 16px;
  font-size: 1rem;
  text-align: center;
}
</style>