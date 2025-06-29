<template>
    <div class="home-view">
       <Header theme="blue-theme"></Header>
       <div class="w containner">
            <Sidebar :navList="navList" ></Sidebar>
           <router-view></router-view>
       </div>
    </div>
</template>
<script lang="ts" setup>
const navList =[
    {
        lable:'仪表盘',
        path:'/admin/board',
        icon:'PieChart',
    },
    {
        lable:'订单管理',
        path:'/admin/order-list',
        icon:'Tickets'
    },
    {
        lable:'用户管理',
        path:'/admin/user-manage',
        icon:'User'
    },
    {
        lable:'快递员管理',
        path:'/admin/delivery-manage',
        icon:'User'
    },
    {
        lable:'我的信息',
        path:'/admin/user-info',
        icon:'User'
    },
]
</script>
<style scoped lang="css">
.containner {
    display: flex;
}
</style>