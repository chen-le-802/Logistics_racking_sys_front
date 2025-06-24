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
            <div v-if="isLogin" class="user-info">欢迎您: <span class="phone-number" @click="$router.push('/user-info')">187****0502</span></div>
            <div v-else class="user-info"><span class="phone-number" @click="showLoginModal" >立即登录/注册</span></div>
        </div>
    </header>
    </div>
    <el-dialog v-model="loginModalVisible"  width="600">
        <div class="login-nav">
            <nav :class="{active:selected === 'login'}" @click="changeSelected('login')">账号登录</nav>
            <nav :class="{active:selected === 'register'}" @click="changeSelected('register')">账号注册</nav>
        </div>
        <div class="login-box">
            <Login v-if="selected==='login'"></Login>
            <Register v-if="selected==='register'"></Register>

        </div>
    </el-dialog>
</template>
<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import { ElIcon } from 'element-plus';
import { BellFilled } from '@element-plus/icons-vue';            
const isLogin =ref(false);
const loginModalVisible = ref(false)
const selected = ref('login')
const checkLogin=()=>{
    isLogin.value = localStorage.getItem('token')?true:false
}
const changeSelected=(select:string)=>{
    selected.value =select
}
const showLoginModal=()=>{
    loginModalVisible.value = true
}
onMounted(() => {
   checkLogin()
});                                        
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
.login-nav{
    display: flex;
    padding: 10px;
    font-size: 18px;
    color:#000000
}
.login-nav nav{
    margin-right: 30px;
    cursor: pointer;
}
.login-nav nav:hover{
    color: #1A76F3;
}
.active{
    color: #1A76F3;
    font-weight: 500px;
    border-bottom: 2px solid #1A76F3;
}
.login-box{
    width:70%;
    margin: 20px auto;
}
</style>