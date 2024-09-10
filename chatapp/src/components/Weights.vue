<script setup>
import { inject, ref, onMounted } from "vue";
import socketManager from '../socketManager.js';
import ReactiveLineChart from './ReactiveLineChart.vue'; // Import the updated ReactiveLineChart component
import { parse } from 'date-fns';  // Import date-fns for date parsing

// Global state
const userName = inject("userName");
const socket = socketManager.getInstance();
const weightContent = ref("");

// Chart data state
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Weight Over Time',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
    }
  ]
});

// Chart options
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day'
      }
    },
    y: {
      beginAtZero: false
    }
  }
});

// Fetch weight history when component mounts
const fetchWeightHistory = () => {
  if (socket && userName.value) {
    socket.emit("getWeightHistory", userName.value, (response) => {
      if (response.success) {
        const weights = response.data.map(entry => entry.weights);
        const dates = response.data.map(entry => 
          parse(entry.date, 'yyyy/MM/dd HH:mm:ss', new Date()) // Use date-fns to parse the date
        );

        chartData.value.labels = dates;
        chartData.value.datasets[0].data = weights;
      } else {
        console.error(response.message);
      }
    });
  }
};

onMounted(() => {
  fetchWeightHistory();  // Fetch the weight data on mount
});

// Function to register the weight
const weightRegister = () => {
  if (!weightContent.value || isNaN(weightContent.value)) {
    alert("体重は数値で入力してください");
    return;
  }

  const currentDate = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  if (socket) {
    socket.emit("WeightRegisterEvent", {
      username: userName.value,
      weight: parseFloat(weightContent.value),
      date: currentDate
    });

    fetchWeightHistory();
  } else {
    console.error("Socket is not initialized");
  }

  weightContent.value = "";
};
</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">Weight Input</h1>
    <div class="mt-10">
      <p>体重を入力してください</p>
      <input v-model="weightContent" type="text" placeholder="体重" class="input" />
    </div>
    <div class="mt-5">
      <button class="button-normal" @click="weightRegister">体重を入力</button>
    </div>

    <!-- Use the ReactiveLineChart component -->
    <div class="mt-5">
      <h2>体重推移グラフ</h2>
      <div style="height: 400px;">
        <ReactiveLineChart :chartData="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.button-normal {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.button-normal:hover {
  background-color: #0056b3;
}
</style>
