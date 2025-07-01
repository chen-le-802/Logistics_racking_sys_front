<template>
     <div class="title-box">{{ title }}</div>
</template>
<script lang="ts" setup>
const { title } = defineProps<{
  title: string
}>();
</script>
<style lang="css" scoped>
.title-box{
    height: 60px;
    border-radius: 10px;
    margin-top: 20px;
    display: flex;
    align-items: center;
    font-size: 20px;
    text-indent: 1em;
    background-color: #fff;
    
}
</style>