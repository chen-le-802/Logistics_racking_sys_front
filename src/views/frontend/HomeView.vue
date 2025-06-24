<template>
    <div class="home-view">
       <Header></Header>
       <div class="w containner">
            <Sidebar></Sidebar>
           <router-view></router-view>
       </div>
    </div>
</template>
<script lang="ts" setup>
    
</script>
<style scoped lang="css">
.containner {
    display: flex;
}
</style>