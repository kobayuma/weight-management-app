<script setup>
import socketManager from '../socketManager.js'
</script>

<template>
    <div class="mx-auto my-5 px-4">
      <h1 class="text-h3 font-weight-medium">食事内容</h1>
      <div class="mt-10">
        <p>食事内容入力画面</p>
        <input type="text"/>
      </div>
    </div>
    <router-link to="/home/" class="link">
      <button type="button" class="button-normal">Home</button>
    </router-link>
</template>