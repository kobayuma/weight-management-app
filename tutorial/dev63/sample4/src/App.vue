<script setup>
const handleClick = () => {
  alert("ボタンがクリックされました")
}
const handleMouseOver = () => {
  alert("ボタンがマウスオーバーされた！")
}
</script>

<template>
  <h1>Sample4</h1>
  <button @click="handleClick">click</button>
  <button @mouseover="handleMouseOver">Mouseover</button>
</template>




