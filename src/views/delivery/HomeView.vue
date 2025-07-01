<template>
    <div class="home-view">
       <Header theme="blue-theme"></Header>
       <div class="w containner">
            <Sidebar :navList="navList"></Sidebar>
            <router-view></router-view>
       </div>
    </div>
</template>
<script lang="ts" setup>
const navList =[
    {
        lable:'绩效统计',
        path:'/delivery/board',
        icon:'PieChart',
    },
    {
        lable:'订单大厅',
        path:'/delivery/order-list',
        icon:'Tickets'
    },
    {
        lable:'我的订单',
        path:'/delivery/my-orders',
        icon:'Tickets'
    },
    {
        lable:'我的信息',
        path:'/delivery/user-info',
        icon:'User'
    },
]
</script>
<style scoped lang="css">
.containner {
    display: flex;
}
</style>