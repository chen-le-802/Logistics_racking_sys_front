<template>
    <div class="container" :class="theme">
        <header class="header">
            <div class="left">
                <div class="logo-title">
                    <div class="logo"></div>
                    <p class="title" @click="$router.push('/search')">货了么</p>
                </div>
            </div>
            <div class="right">
                <div class="message">
                    <el-icon v-if="theme!=='blue-theme'"><BellFilled color="#1A76F3" /></el-icon>
                </div>
                <div v-if="isLogin" class="user-info">
                    欢迎您:
                    <span
                        class="phone-number"
                        @click="$router.push('/user-info')"
                    >187****0502</span>
                    <el-dropdown 
                        class="setupStyle "
                        v-if="userRole === '1'" 
                        @command="handleCommand"
                        popper-class="role-dropdown"
                    >
                        <span class="el-dropdown-link">
                            <el-icon><ArrowDown /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="/">用户端</el-dropdown-item>
                                <el-dropdown-item command="/admin">快递员端</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <div v-else class="user-info">
                    <span class="phone-number" @click="showLoginModal">立即登录/注册</span>
                </div>
            </div>
        </header>
    </div>
    <el-dialog v-model="loginModalVisible" width="600">
        <div class="login-nav">
            <nav
                :class="{ active: selected === 'login' }"
                @click="changeSelected('login')"
            >账号登录</nav>
            <nav
                :class="{ active: selected === 'register' }"
                @click="changeSelected('register')"
            >账号注册</nav>
        </div>
        <div class="login-box">
            <keep-alive>
            <Login v-if="selected === 'login'" />
            <Register v-else />
            </keep-alive>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { BellFilled, ArrowDown } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLogin = ref(false);
const loginModalVisible = ref(false);
const selected = ref('login');
const userRole = ref('');

const props = defineProps({
    theme: {
        type: String,
        default: 'white-theme'
    }
});
const theme = props.theme;

const checkLogin = () => {
    isLogin.value = !!localStorage.getItem('token');
    userRole.value = localStorage.getItem('role') || '';
};

const changeSelected = (select: string) => {
    selected.value = select;
};

const showLoginModal = () => {
    loginModalVisible.value = true;
};

const handleCommand = (command: string) => {
    router.push(command);
};

onMounted(() => {
    checkLogin();
});
</script>

<style scoped>
.white-theme {
    background-color: #fff;
}
.blue-theme {
    background-color: #1a76f3;
    color: #fff;
}
.phone-number {
    margin-left: 5px;
    cursor: pointer;
}

/* 白色主题下 hover 为蓝色 */
.white-theme .phone-number:hover {
    color: #1a76f3;
}

/* 蓝色主题下 hover 为白色 */
.blue-theme .phone-number:hover {
    color: #fff;
}

.container {
    display: flex;
    align-items: center;
    height: 60px;
    width: 100%;
    margin: 0 auto;
}
.header {
    width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.logo-title {
    display: flex;
    align-items: center;
}
.logo-title .logo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-image: url('@/assets/images/common/logo.png');
    background-size: cover;
}
.logo-title .title {
    font-size: 18px;
    font-weight: 600;
    margin-left: 15px;
    cursor: pointer;
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

.user-info {
    display: flex;
    align-items: center;
    position: relative;
}
.login-nav {
    display: flex;
    padding: 10px;
    font-size: 18px;
    color: #000;
}
.login-nav nav {
    margin-right: 30px;
    cursor: pointer;
}
.login-nav nav:hover {
    color: #1a76f3;
}
.active {
    color: #1a76f3;
    font-weight: 500;
    border-bottom: 2px solid #1a76f3;
}
.login-box {
    width: 70%;
    margin: 20px auto;
}
.el-dropdown-link {
    margin-left: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
}
</style>

<style>
.role-dropdown {
    border: none !important;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.role-dropdown .el-dropdown-menu {
    border: none;
    padding: 5px 0;
}
.role-dropdown .el-dropdown-menu__item {
    padding: 8px 20px;
    font-size: 14px;
}
.role-dropdown .el-dropdown-menu__item:hover {
    background-color: #f5f7fa;
    color: #1a76f3;
}
:deep(.el-tooltip__trigger:focus-visible) {
      outline: unset !important
}
.setupStyle .el-dropdown-link:focus {
  outline: none !important;
}
</style>