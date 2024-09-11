<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Filler } from 'chart.js';

// Register the necessary chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Filler);

const props = defineProps({
  chartData: Object,
  chartOptions: Object
});

const canvas = ref(null);
let chartInstance = null;

onMounted(() => {
  if (canvas.value) {
    chartInstance = new Chart(canvas.value, {
      type: 'line',
      data: props.chartData,
      options: props.chartOptions
    });
  }
});

watch(
  () => props.chartData,
  (newData) => {
    if (chartInstance) {
      chartInstance.data = newData;
      chartInstance.update();
    }
  }
);
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 400px; /* 高さを固定 */
  width: 100%; /* 幅を100%に設定 */
}
</style>
  
