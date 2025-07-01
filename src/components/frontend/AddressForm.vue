<template>
    <div class="address-form-container">
      <div class="form-header">
        <div class="form-logo" :style="{ backgroundColor: logo.color }">
          {{ logo.title }}
        </div>
        <span class="form-title">{{ title }}</span>
        <el-button 
          type="primary" 
          size="small" 
          @click="openAddressBook"
          class="address-book-btn"
        >
          地址簿
        </el-button>
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

      <el-dialog
        v-model="addressBookVisible"
        title="选择地址"
        width="80%"
        :before-close="handleCloseAddressBook"
      >
        <AddressBook 
          :show-selection="true"
          @select="handleAddressSelect"
          :key="addressBookKey"
        />
      </el-dialog>
    </div>
</template>
  
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import AddressBook from './AddressBook.vue'

interface FormField {
  prop: keyof typeof formData
  label: string
  placeholder: string
}

interface Address {
  id: number
  name: string
  phone: string
  address: string
  isDefault?: number
}

const props = defineProps<{
  logo: {
    title: string
    color: string
  }
  title?: string
}>()

const formRef = ref<FormInstance>()
const addressBookVisible = ref(false)
const addressBookKey = ref(0)

const formData = reactive({
  name: '',
  phone: '',
  region: '', 
  detail: ''
})

const readonlyFields = reactive({
  name: true,
  phone: true,
  region: true, 
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
  region: [
    { required: true, message: '请输入地区', trigger: 'blur' }
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
    placeholder: '请填写所在地区' 
  },
  { 
    prop: 'detail', 
    label: '详细地址', 
    placeholder: '请填写详细地址（例如xx街xx号）' 
  }
]

const enableEditing = (field: keyof typeof readonlyFields) => {
    readonlyFields[field] = false
}

const openAddressBook = () => {
  addressBookKey.value++
  addressBookVisible.value = true
}

const handleAddressSelect = (address: Address) => {
  console.log('收到地址:', address)
  const addressText = address.address || ''
  
  let region = ''
  let detail = addressText
  
  const regionPatterns = [
    /^(.+?省.+?市.+?区)/,
    /^(.+?省.+?市)/,
    /^(.+?市.+?区)/,
    /^(.+?市)/,
    /^(.+?区)/
  ]
  
  for (const pattern of regionPatterns) {
    const match = addressText.match(pattern)
    if (match) {
      region = match[1]
      detail = addressText.substring(match[1].length)
      break
    }
  }
  
  if (!region) {
    region = addressText
    detail = ''
  }
  
  formData.name = address.name
  formData.phone = address.phone
  formData.region = region
  formData.detail = detail
  
  Object.keys(readonlyFields).forEach(key => {
    readonlyFields[key as keyof typeof readonlyFields] = false
  })
  
  addressBookVisible.value = false
}

const handleCloseAddressBook = () => {
  addressBookVisible.value = false
}

const getFormData = () => ({
  ...formData,
  address: `${formData.region}${formData.detail}`
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

.address-book-btn {
  margin-left: auto;
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