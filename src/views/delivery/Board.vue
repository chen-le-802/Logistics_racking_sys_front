<template>
  <div class="performance-container">
     <Title-Box title="绩效统计查询" style="margin-bottom: 25px;"></Title-Box>
    <el-card class="performance-card">
      <template #header>
        <div class="card-header">
          <span>绩效统计查询</span>
        </div>
      </template>
      <!-- 查询表单 -->
      <div class="query-form">
        <el-form :inline="true" :model="queryParams" :rules="rules" ref="queryFormRef">
          <el-form-item label="查询月份" prop="month">
            <el-date-picker
              v-model="queryParams.month"
              type="month"
              value-format="YYYY-MM"
              placeholder="选择月份"
              :disabled-date="disabledDate"
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchPerformance" :loading="loading" :disabled="!queryParams.month">
              查询
            </el-button>
            <el-button @click="resetForm">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="2" animated />
      </div>
      <!-- 完成订单量展示 -->
      <div v-else-if="showResult" class="result-container">
        <el-card class="result-card">
          <div class="result-label">{{ queryParams.month }} 完成订单量</div>
          <div class="result-value">{{ performanceData }} 单</div>
        </el-card>
      </div>
      <!-- 无数据提示 -->
      <div v-else class="no-data">
        <el-empty description="请选择月份进行查询" :image-size="180" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getCourierPerformance } from '@/apis/modules/order'
import { ElMessage } from 'element-plus'

const queryFormRef = ref()
const performanceData = ref<number>(0)
const loading = ref(false)
const showResult = ref(false)

// 查询参数
const queryParams = ref({
  month: ''
})

// 表单验证规则
const rules = {
  month: [
    { required: true, message: '请选择查询月份', trigger: 'change' }
  ]
}

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 重置表单
const resetForm = () => {
  queryFormRef.value?.resetFields()
  showResult.value = false
  performanceData.value = 0
}

// 获取绩效数据
async function fetchPerformance() {
  if (!queryParams.value.month) {
    ElMessage.warning('请选择月份')
    return
  }
  loading.value = true
  try {
    const response = await getCourierPerformance(queryParams.value.month)
    if (response) {
      performanceData.value = typeof response === 'number' ? response : 0
      showResult.value = true
    } else {
      ElMessage.warning('本月没有绩效数据')
      showResult.value = false
    }
  } catch (error) {
    console.error('获取绩效数据失败:', error)
    ElMessage.error('获取绩效数据失败')
    showResult.value = false
  } finally {
    loading.value = false
  }
}

// 页面加载时默认显示本月绩效
onMounted(() => {
  const now = new Date()
  const month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  queryParams.value.month = month
  fetchPerformance()
})
</script>

<style scoped>
.performance-container {
  flex: 1;
  padding: 25px;
}
.performance-card {
  border-radius: 12px;
  box-shadow: none !important;
  border: none;
  height: 600px;
}
.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}
.query-form {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 8px;
}
.loading-container {
  padding: 40px;
}
.result-container {
  display: flex;
  justify-content: center;
  margin-top: 0px;
}
.result-card {
  text-align: center;
  border-radius: 12px;
  border: none;
  padding: 100px;
}
.result-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
}
.result-value {
  font-size: 40px;
  font-weight: bold;
  color: #36a2eb;
}
.no-data {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}
</style>