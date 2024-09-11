<template>
  <div class="mx-auto my-5 px-4">
    <h3 class="text-h3 font-weight-medium">体重記録</h3>
    <button type="button" @click="$router.push('/home')" class="button-home">Home</button>

    <!-- Input field for weight -->
    <div class="mt-10">
      <p>体重を入力してください</p>
      <input v-model="weightContent" type="text" placeholder="体重" class="input" />
    </div>

    <!-- Button to register the weight -->
    <div class="mt-5">
      <button class="button-normal" @click="weightRegister">体重を入力</button>
    </div>

    <!-- Button to display the weight chart -->
    <div class="mt-5">
      <button class="button-normal" @click="displayChart">グラフを表示する</button>
    </div>

    <!-- Button to display the weight ranking -->
    <div class="mt-5">
      <button class="button-normal" @click="displayRanking">ランキングを表示する</button>
    </div>

    <!-- Line chart for weight over time, only visible after button click -->
    <div v-if="chartVisible" class="mt-10">
      <h2 class="text-h5 font-weight-medium">Weight Progress Chart</h2>
      <line-chart :chart-data="chartData" :chart-options="chartOptions"></line-chart>
    </div>

    <!-- Ranking table, only visible after button click -->
    <div v-if="rankingVisible" class="mt-10">
      <h2 class="text-h5 font-weight-medium">Weight Ranking</h2>
      <table>
        <thead>
          <tr>
            <th>順位</th>
            <th>ユーザー名</th>
            <th>最新の体重</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in ranking" :key="user.username">
            <td>{{ index + 1 }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.weight }} kg</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from "vue";
import socketManager from '../socketManager.js';
import { parse, format } from 'date-fns';  // Import format from date-fns
import LineChart from './LineChart.vue';  // Import the LineChart component

// Global state
const userName = inject("userName");
const socket = socketManager.getInstance();
const weightContent = ref("");
const chartVisible = ref(false);  // To control the chart visibility
const rankingVisible = ref(false); // To control the ranking visibility
const ranking = ref([]);  // State to hold the ranking data

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
      pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 7,
    }
  ]
});

// Chart options
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Date',
      }
    },
    y: {
      title: {
        display: true,
        text: 'Weight (kg)',
      },
      beginAtZero: false
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (tooltipItem) => {
          const weight = tooltipItem.raw;
          const date = chartData.value.labels[tooltipItem.dataIndex];
          return `Weight: ${weight} kg, Date: ${new Date(date).toLocaleDateString('ja-JP')}`;
        }
      }
    }
  }
});

// Fetch weight history from the latest data in the database
const fetchWeightHistory = () => {
  if (socket && userName.value) {
    // Emit an event to fetch the latest weight history from the database
    socket.emit("getWeightHistory", userName.value, (response) => {
      if (response.success) {
        // Map the response data to update the chart
        const weights = response.data.map(entry => entry.weights);
        const dates = response.data.map(entry => 
          format(parse(entry.date, 'yyyy/MM/dd HH:mm:ss', new Date()), 'yyyy/MM/dd')
        );

        // Update the chart with the latest data
        chartData.value.labels = dates;
        chartData.value.datasets[0].data = weights;

        chartVisible.value = true;  // Make the chart visible after data is fetched
      } else {
        console.error(response.message);
      }
    });
  }
};

// Fetch ranking data
const fetchRankingData = () => {
  if (socket) {
    // Emit an event to fetch the latest weight of each user for ranking
    socket.emit("getLatestWeightsForRanking", (response) => {
      if (response.success) {
        // Sort the response data by weight in descending order
        ranking.value = response.data.sort((a, b) => b.weight - a.weight);

        rankingVisible.value = true;  // Make the ranking visible after data is fetched
      } else {
        console.error(response.message);
      }
    });
  }
};

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

    fetchWeightHistory();  // Fetch updated history after weight registration
  } else {
    console.error("Socket is not initialized");
  }

  weightContent.value = "";
};

// Function to display the chart with the latest data
const displayChart = () => {
  fetchWeightHistory();  // Fetch latest weight history when the button is clicked
};

// Function to display the ranking with the latest data
const displayRanking = () => {
  fetchRankingData();  // Fetch latest ranking data when the button is clicked
};
</script>

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
table {
  width: 100%;
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid black;
}
th, td {
  padding: 10px;
  text-align: left;
}
</style>
