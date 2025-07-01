<template>
    <div class="order-management-container">
      <TitleBox title="可领取的订单" style="margin-bottom: 25px;"></TitleBox>
        <el-card class="box-card" style="box-shadow: none !important;">
        <template #header>
          <div class="card-header">
            
            <div class="header-actions">
              <el-button type="primary" @click="fetchOrders">刷新</el-button>
            </div>
          </div>
        </template>
  
        <!-- 订单表格 -->
        <el-table
          :data="orderList"
          border
          style="width: 1000px; "
          v-loading="loading"
        >
          <el-table-column prop="orderId" label="订单号" width="120" />
          <el-table-column label="寄件人信息" width="250">
            <template #default="{ row }">
              <div>{{ row.senderAddr }}</div>
              <div>{{ row.senderPhone }}</div>
            </template>
          </el-table-column>
          <el-table-column label="收件人信息" width="250">
            <template #default="{ row }">
              <div>{{ row.receiverAddr }}</div>
              <div>{{ row.receiverPhone }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="重量(kg)" width="100" />
          <el-table-column prop="type" label="货物类型" width="120" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="paymentStatus" label="支付状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.paymentStatus === '已支付' ? 'success' : 'danger'">
                {{ row.paymentStatus === '已支付' ? '已支付' : '未支付' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="fee" label="费用(元)" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                @click="handleAcceptOrder(row.orderId)"
              >
                接单
              </el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'
  import { ElMessage,ElMessageBox } from 'element-plus'
  import { getUnassignedOrders, acceptOrder } from '@/apis/modules/order'
  
  export default {
    setup() {
      // 订单数据
      const orderList = ref([])
      const loading = ref(false)
      const currentPage = ref(1)
      const pageSize = ref(10)
      const total = ref(0)
  
      // 获取未分配订单
      const fetchOrders = async () => {
        loading.value = true
        try {
          const params = {
            pageNum: currentPage.value,
            pageSize: pageSize.value
          }
          const response = await getUnassignedOrders(params)
          console.log(response)
          if (response) {
            orderList.value = response.records
            total.value = Number(response.total) || 0
            pageSize.value = Number(response.size) || 10
            currentPage.value = Number(response.current) || 1
          } else {
            ElMessage.error(response.message || '获取订单失败')
          }
        } catch (error) {
          ElMessage.error('获取订单失败: ' + error.message)
        } finally {
          loading.value = false
        }
      }
  
      // 接单操作
     
  const handleAcceptOrder = async (orderId) => {
    try {
      await ElMessageBox.confirm(
        '确定要接收该订单吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      loading.value = true
      const response = await acceptOrder(orderId)
        ElMessage.success('接单成功')
        fetchOrders()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('接单失败: ' + (error.message || error))
      }
      // 用户取消时不提示
    } finally {
      loading.value = false
    }
  }
  
  
  
      // 分页大小变化
      const handleSizeChange = (val) => {
        pageSize.value = val
        fetchOrders()
      }
  
      // 当前页变化
      const handleCurrentChange = (val) => {
        currentPage.value = val
        fetchOrders()
      }
  
      // 格式化日期
      const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleString()
      }
  
      // 获取状态标签类型
      const getStatusTagType = (status) => {
        const map = {
          unassigned: 'warning',
          assigned: 'info',
          picked_up: '',
          delivered: 'success',
          cancelled: 'danger'
        }
        return map[status] || ''
      }
  
      // 初始化加载数据
      onMounted(() => {
        fetchOrders()
      })
  
      return {
        orderList,
        loading,
        currentPage,
        pageSize,
        total,
        fetchOrders,
        handleAcceptOrder,
        handleSizeChange,
        handleCurrentChange,
        formatDate,
        getStatusTagType
      }
    }
  }
  </script>
  
  <style scoped>
  .order-management-container {
    flex: 1;
    padding: 25px;
     padding-bottom:0 ;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  </style>