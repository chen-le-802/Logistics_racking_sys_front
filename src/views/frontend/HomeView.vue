<template>
    <div class="home-view">
       <Header></Header>
       <div class="w containner">
       <Sidebar></Sidebar>
       <div class="content">
        <div class="title-box">运单查询</div>
       </div>
       </div>
    </div>
</template>
<script lang="ts" setup>
    
</script>
<style scoped lang="css">
.containner {
    display: flex;
}
.content{
    flex:1;
    margin-left: 25px;
}
.content .title-box{
    height: 60px;
    border-radius: 10px;
    margin-top: 40px;
    display: flex;
    align-items: center;
    font-size: 20px;
    text-indent: 1em;
    background-color: #fff;
}

</style>