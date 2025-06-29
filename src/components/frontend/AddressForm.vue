<template>
    <div class="address-form-container">
      <div class="form-header">
        <div class="form-logo" :style="{ backgroundColor: logo.color }">
          {{ logo.title }}
        </div>
        <span class="form-title">{{ title }}</span>
      </div>
  
      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="validationRules"
        class="form-content"
      >
        <el-form-item
          v-for="field in formFields"
          :key="field.prop"
          :prop="field.prop"
          :label="field.label"
          :required="true"
        >
          <el-input
            v-model="formData[field.prop]"
            :placeholder="field.placeholder"
            :readonly="readonlyFields[field.prop]"
            @focus="() => enableEditing(field.prop)"
          />
        </el-form-item>
      </el-form>
    </div>
</template>
  
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'

interface FormField {
  prop: keyof typeof formData
  label: string
  placeholder: string
}

const props = defineProps<{
  logo: {
    title: string
    color: string
  }
  title?: string
}>()

const formRef = ref<FormInstance>()

const formData = reactive({
  name: '',
  phone: '',
  region: '贵州省贵阳市', // 固定为贵州省贵阳市
  detail: ''
})

const readonlyFields = reactive({
  name: true,
  phone: true,
  region: true, // 地区字段设为只读
  detail: true
})

const validationRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在2-10个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { 
      pattern: /^1[3-9]\d{9}$/, 
      message: '请输入正确的手机号码', 
      trigger: 'blur' 
    }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 50, message: '长度在5-50个字符', trigger: 'blur' }
  ]
}

const formFields: FormField[] = [
  { 
    prop: 'name', 
    label: '姓名', 
    placeholder: '请填写真实姓名' 
  },
  { 
    prop: 'phone', 
    label: '联系方式', 
    placeholder: '请填写联系方式' 
  },
  { 
    prop: 'region', 
    label: '地区', 
    placeholder: '贵州省贵阳市' 
  },
  { 
    prop: 'detail', 
    label: '详细地址', 
    placeholder: '请填写详细地址（例如xx街xx号）' 
  }
]

const enableEditing = (field: keyof typeof readonlyFields) => {
  if (field !== 'region') { // 地区字段不允许编辑
    readonlyFields[field] = false
  }
}

const getFormData = () => ({
  ...formData,
  address: `贵州省贵阳市${formData.detail}` // 拼接完整地址
})

defineExpose({ 
  getFormData,
  validate: () => formRef.value?.validate()
})
</script>
  
<style scoped>
.address-form-container {
  width: 520px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
}

.form-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  margin-right: 10px;
}

.form-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.form-content {
  width: 100%;
}

:deep(.el-form-item__label) {
  width: 80px;
  text-align: right;
  padding-right: 12px;
}
</style>