<template>
  <el-form :model="form" ref="registerForm" class="register-form" :rules="rules">
    <el-form-item prop="phone">
      <el-input
        v-model="form.phone"
        placeholder="请输入手机号"
        class="form-item"
        :readonly="readonly.phone"
        @focus="removeReadonly('phone')"
      >
        <template #prefix>
          <el-icon><Iphone /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item prop="email">
      <el-input
        v-model="form.email"
        placeholder="请输入邮箱"
        class="form-item"
        :readonly="readonly.email"
        @focus="removeReadonly('email')"
      >
        <template #prefix>
          <el-icon><Message /></el-icon>
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

    <el-form-item prop="role">
      <el-radio-group v-model="form.role">
        <el-radio :label="0">普通用户</el-radio>
        <el-radio :label="1">快递员</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item prop="registryCode" v-if="form.role === 1">
      <el-input
        v-model="form.registryCode"
        placeholder="请输入快递员注册码"
        class="form-item"
      >
        <template #prefix>
          <el-icon><Unlock /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-button 
        type="primary" 
        @click="handleRegister" 
        :loading="loading" 
        class="form-item register-btn"
      >
        立即注册
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, onActivated, onBeforeUnmount } from 'vue'
import { Iphone, Message, Key, Unlock } from '@element-plus/icons-vue'
import { userApi } from '@/apis/modules'
import { ElMessage } from 'element-plus'
import type { FormRules } from 'element-plus'

const form = reactive({
  phone: '',
  email: '',
  code: '',
  role: 0,
  registryCode: ''
})

const loading = ref(false)
const countdown = ref(0)
const isCountingDown = ref(false)
const registerForm = ref()
let countdownTimer: number | null = null

const readonly = reactive({
  phone: true,
  email: true
})

function removeReadonly(field: 'phone' | 'email') {
  readonly[field] = false
}

const validateRegistryCode = (_rule: any, value: string, callback: Function) => {
  if (form.role === 1 && !value) {
    callback(new Error('快递员注册码不能为空'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  registryCode: [
    { validator: validateRegistryCode, trigger: 'blur' }
  ]
}

function updateCountdown(endTime: number) {
  const remain = Math.max(Math.floor((endTime - Date.now()) / 1000), 0)
  countdown.value = remain
  if (remain <= 0) {
    clearCountdown()
  }
}

function startCountdown() {
  // 记录倒计时结束的时间戳
  const endTime = Date.now() + 120 * 1000
  localStorage.setItem('register_countdown_end', endTime.toString())
  updateCountdown(endTime)
  isCountingDown.value = true
  countdownTimer = setInterval(() => {
    updateCountdown(endTime)
  }, 1000) as unknown as number
}

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  isCountingDown.value = false
  countdown.value = 0
  localStorage.removeItem('register_countdown_end')
}

async function sendCode() {
  if (!form.phone) {
    return registerForm.value?.validateField('phone')
  }
  try {
    await userApi.sendCode(form.phone)
    startCountdown()
  } catch (err) {
    ElMessage.error('发送验证码失败')
  }
}

async function handleRegister() {
  loading.value = true
  try {
    const valid = await registerForm.value?.validate()
    if (!valid) return
    const requestData = {
      phone: form.phone,
      email: form.email,
      code: form.code,
      role: form.role,
      registryCode: form.role === 1 ? form.registryCode : undefined
    }
    const res = await userApi.register(requestData)
    if(res.code ===200){ElMessage.success('注册成功')}
    
  } catch (err: any) {

  } finally {
    loading.value = false
  }
}

onActivated(() => {
  if (countdown.value > 0 && !countdownTimer) {
    startCountdown()
  }
})

// keep-alive 停用时清除定时器
onActivated(() => {
  // 恢复倒计时
  const end = localStorage.getItem('register_countdown_end')
  if (end) {
    const endTime = parseInt(end)
    const remain = Math.max(Math.floor((endTime - Date.now()) / 1000), 0)
    if (remain > 0) {
      countdown.value = remain
      isCountingDown.value = true
      countdownTimer = setInterval(() => {
        updateCountdown(endTime)
      }, 1000) as unknown as number
    } else {
      clearCountdown()
    }
  }
})
onBeforeUnmount(() => {
  clearCountdown()
})
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

.code-input {
  display: flex;
  gap: 10px;
}

.send-code-btn {
  width: 120px;
  height: 40px;
  transition: 
    background-color 0.3s ease,
    border-color 0.3s ease,
    opacity 0.3s ease;
}

.send-code-btn:disabled {
  opacity: 0.7;
}

.register-btn {
  width: 100%;
  margin-top: 10px;
}
</style>
