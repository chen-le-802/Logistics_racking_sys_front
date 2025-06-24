<template>
    <el-form :model="form" ref="loginForm" class="login-form">
        <el-form-item prop="phone">
            <el-input
                v-model="form.phone"
                placeholder="请输入手机号"
                class="form-item"
                readonly
                @focus="(e: Event) => (e.target as HTMLInputElement).removeAttribute('readonly')"
            >
                <template #prefix>
                    <el-icon><User /></el-icon>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input
                v-model="form.password"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-item"
                readonly
                @focus="(e: Event) => (e.target as HTMLInputElement).removeAttribute('readonly')"
            >
                <template #prefix>
                    <el-icon><Lock /></el-icon>
                </template>
                <template #suffix>
                    <el-icon
                        style="cursor:pointer"
                        @click="togglePasswordVisible"
                    >
                        <component :is="passwordVisible ? View : Hide" />
                    </el-icon>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading" class="form-item">快速登录</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'

const form = ref({
    phone: '',
    password: ''
})
const loading = ref(false)
const error = ref('')
const passwordVisible = ref(false)

function togglePasswordVisible() {
    passwordVisible.value = !passwordVisible.value
}

function handleLogin() {
    error.value = ''
    loading.value = true
    // mock login
    setTimeout(() => {
        loading.value = false
        if (form.value.phone === '12345678901' && form.value.password === '123456') {
            error.value = ''
            // mock success, e.g. show a message or redirect
            alert('登录成功！')
        } else {
            error.value = '手机号或密码错误'
        }
    }, 1000)
}
</script>

<style lang="css" scoped>
.login-form {
    max-width: 400px;
    margin: 20px auto;
    padding: 24px;
    border-radius: 8px;
    background: #fff;
}
.mt-2 {
    margin-top: 16px;
}
.form-item{
    height: 40px;
    width:100%
}
</style>