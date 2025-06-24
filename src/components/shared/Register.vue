<template>
    <el-form :model="form" ref="registerForm" class="register-form" :rules="rules">
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
        
        <el-form-item prop="confirmPassword">
            <el-input
                v-model="form.confirmPassword"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="form-item"
                readonly
                @focus="(e: Event) => (e.target as HTMLInputElement).removeAttribute('readonly')"
            >
                <template #prefix>
                    <el-icon><Lock /></el-icon>
                </template>
            </el-input>
        </el-form-item>
        
        <el-form-item>
            <el-button 
                type="primary" 
                @click="handleRegister" 
                :loading="loading" 
                class="form-item"
            >
                立即注册
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'

const form = ref({
    phone: '',
    password: '',
    confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const passwordVisible = ref(false)

const validatePassword = (rule: any, value: string, callback: Function) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else if (value.length < 6) {
        callback(new Error('密码长度不能少于6位'))
    } else {
        if (form.value.confirmPassword !== '') {
            registerForm.value?.validateField('confirmPassword')
        }
        callback()
    }
}

const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== form.value.password) {
        callback(new Error('两次输入密码不一致!'))
    } else {
        callback()
    }
}

const rules: FormRules = {
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    password: [
        { validator: validatePassword, trigger: 'blur' }
    ],
    confirmPassword: [
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
}

const registerForm = ref()

function togglePasswordVisible() {
    passwordVisible.value = !passwordVisible.value
}

function handleRegister() {
    registerForm.value?.validate((valid: boolean) => {
        if (valid) {
            error.value = ''
            loading.value = true
            // 模拟注册请求
            setTimeout(() => {
                loading.value = false
                alert('注册成功！')
                // 这里可以添加注册成功后的逻辑，比如跳转到登录页
            }, 1000)
        } else {
            return false
        }
    })
}
</script>

<style lang="css" scoped>
.register-form {
    max-width: 400px;
    margin: 20px auto;
    padding: 24px;
    border-radius: 8px;
    background: #fff;
}

.form-item {
    height: 40px;
    width: 100%;
}

.error-message {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 5px;
}
</style>