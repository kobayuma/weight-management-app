<script setup>
import socketManager from '../socketManager.js'
</script>

<template>
    <div class="mx-auto my-5 px-4">
      <h1 class="text-h3 font-weight-medium">ChatLogin</h1>
      <div class="mt-10">
        <p>体重入力画面</p>
        <input type="text"/>
      </div>
    </div>
    <router-link to="/home/" class="link">
      <button type="button" class="button-normal">Home</button>
    </router-link>
</template>