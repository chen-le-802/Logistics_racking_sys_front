<template>
    <div class="container">
    <header class="header">
        <div class="left">
            <div class="logo-title">
                <div class="logo"></div>
                <p class="title" @click="$router.push('/search')">货了么</p>
            </div>
        </div>
        <div class="right">
            <div class="message"><el-icon><BellFilled color="#1A76F3"/></el-icon></div>
            <div class="user-info">欢迎您: <span class="phone-number" @click="$router.push('/user-info')">187****0502</span></div>
        </div>
    </header>
    </div>
</template>
<script lang="ts" setup>
import { ElIcon } from 'element-plus';
import { BellFilled } from '@element-plus/icons-vue';                                                       
</script>
<style scoped lang="css">
.container{
    display: flex;
    align-items: center;
    height: 60px;
    width: 100%;
    margin:0 auto;
    background-color: #fff;
}
.header{
    width:1400px;
    margin:0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.logo-title {
    display: flex;
    align-items: center;
}
.logo-title .logo{
    width:50px;
    height: 50px;
    border-radius: 50%;
    background-image: url('@/assets/images/common/logo.png');
    background-size: cover;
}
.logo-title .title {
    font-size: 18px;
    font-weight:600;
    margin-left: 15px;
}
.right {
    display: flex;
    align-items: center;
}
.right .message {
    width: 20px;
    height: 20px;
    cursor: pointer;
    margin-right: 15px;
}
.phone-number{
    margin-left: 5px;
    cursor: pointer;
}
.phone-number:hover {
    color: #1A76F3;
}
</style>