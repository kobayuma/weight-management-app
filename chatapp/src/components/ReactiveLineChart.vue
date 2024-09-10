<template>
    <div>
      <Line :data="chartData" :options="options" />
    </div>
  </template>
  
  <script>
  import { defineComponent } from "vue";
  import { Line } from "vue-chartjs";
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    TimeScale,
    Filler // Ensure Filler is imported for the fill option
  } from "chart.js";
  import 'chartjs-adapter-date-fns';
  
  ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, TimeScale, Filler);
  
  export default defineComponent({
    components: {
      Line
    },
    props: {
      chartData: {
        type: Object,
        required: true
      },
      options: {
        type: Object,
        required: true
      }
    }
  });
  </script>
  