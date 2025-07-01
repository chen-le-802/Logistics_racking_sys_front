<template>
    <div class="home-view">
       <Header theme="white-theme"></Header>
       <div class="w containner">
            <Sidebar :navList= navList></Sidebar>
           <router-view></router-view>
       </div>
    </div>
</template>
<script lang="ts" setup>
const navList =[
    {
        lable:'运单查询',
        path:'/search',
        icon:'Search',
    },
    {
        lable:'我要寄件',
        path:'/order',
        icon:'Position'
    },
    {
        lable:'我的信息',
        path:'/user-info',
        icon:'User'
    },
]
</script>
<style scoped lang="css">
.containner {
    display: flex;
}
</style>