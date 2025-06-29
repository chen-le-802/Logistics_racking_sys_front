<template>
  <el-form :model="form" ref="loginForm" class="login-form">
    <el-form-item prop="phone">
      <el-input
        v-model="form.phone"
        placeholder="请输入手机号"
        class="form-item"
        :readonly="readonly"
        @focus="readonly = false"
      >
        <template #prefix>
          <el-icon><Iphone /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item prop="code">
      <div class="code-input">
        <el-input
          v-model="form.code"
          placeholder="请输入验证码"
          class="form-item"
        >
          <template #prefix>
            <el-icon><Key /></el-icon>
          </template>
        </el-input>
        <el-button 
          type="primary" 
          class="send-code-btn" 
          @click="sendCode"
          :disabled="isCountingDown"
        >
          <transition name="fade-count" mode="out-in">
            <span :key="countdown">
              {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
            </span>
          </transition>
        </el-button>
      </div>
    </el-form-item>

    <el-form-item>
      <el-button 
        type="primary" 
        @click="handleLogin" 
        :loading="loading" 
        class="form-item"
      >
        快速登录
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, onActivated, onBeforeUnmount } from 'vue'
import { Iphone, Key } from '@element-plus/icons-vue'
import { userApi } from '@/apis/modules'
import { ElMessage } from 'element-plus'

const form = reactive({
  phone: '',
  code: ''
})

const loading = ref(false)
const countdown = ref(0)
const isCountingDown = ref(false)
const readonly = ref(true)
let countdownTimer: number | null = null

function updateCountdown(endTime: number) {
  const remain = Math.max(Math.floor((endTime - Date.now()) / 1000), 0)
  countdown.value = remain
  if (remain <= 0) clearCountdown()
}

function startCountdown() {
  const endTime = Date.now() + 120 * 1000
  localStorage.setItem('login_countdown_end', endTime.toString())
  updateCountdown(endTime)
  isCountingDown.value = true
  countdownTimer = window.setInterval(() => updateCountdown(endTime), 1000)
}

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  isCountingDown.value = false
  countdown.value = 0
  localStorage.removeItem('login_countdown_end')
}

async function sendCode() {
  if (!form.phone) {
    ElMessage.error('请输入手机号')
    return
  }
  try {
    await userApi.sendCode(form.phone)
    startCountdown()
  } catch {
    ElMessage.error('发送验证码失败')
  }
}

async function handleLogin() {
  if (!form.phone) {
    ElMessage.error('请输入手机号')
    return
  }
  if (!form.code) {
    ElMessage.error('请输入验证码')
    return
  }
  loading.value = true
  try {
    const res = await userApi.login({ phone: form.phone, code: form.code })
    ElMessage.success('登录成功')
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    if (res.token) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('role', res.role)
      clearCountdown() // 登录成功后关闭定时器
    } else {
    }
  } catch {
  } finally {
    loading.value = false
  }
}


onActivated(() => {
  const end = localStorage.getItem('login_countdown_end')
  if (end) {
    const endTime = parseInt(end)
    const remain = Math.max(Math.floor((endTime - Date.now()) / 1000), 0)
    if (remain > 0) {
      countdown.value = remain
      isCountingDown.value = true
      countdownTimer = window.setInterval(() => updateCountdown(endTime), 1000)
    } else {
      clearCountdown()
    }
  }
})

onBeforeUnmount(clearCountdown)
</script>

<style scoped>
.login-form {
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
.code-input {
  display: flex;
  gap: 10px;
}
.send-code-btn {
  width: 120px;
  height: 40px;
  transition: background-color 0.3s, border-color 0.3s, opacity 0.3s;
}
.send-code-btn:disabled {
  opacity: 0.7;
}
</style>
