<template>
    <div class="order-management-container">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>订单管理</span>
            <div class="header-actions">
              <el-button type="primary" @click="refreshOrders">刷新</el-button>
            </div>
          </div>
        </template>
  
        <!-- 搜索和筛选区域 -->
        <div class="filter-container">
          <el-form :inline="true" :model="filterForm" class="demo-form-inline">
            <el-form-item label="订单ID">
              <el-input v-model="filterForm.orderId" placeholder="订单ID" clearable />
            </el-form-item>
            <el-form-item label="快递单号">
              <el-input v-model="filterForm.trackingNumber" placeholder="快递单号" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
                <el-option label="未发货" value="pending" />
                <el-option label="已发货" value="shipped" />
                <el-option label="运输中" value="in_transit" />
                <el-option label="已签收" value="delivered" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleFilter">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
  
        <!-- 订单表格 -->
        <el-table
          :data="orderList"
          border
          style="width: 100%"
          v-loading="loading"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="id" label="订单ID" width="120" sortable="custom" />
          <el-table-column prop="trackingNumber" label="快递单号" width="180" />
          <el-table-column prop="orderTime" label="下单时间" width="180" sortable="custom">
            <template #default="{ row }">
              {{ formatDate(row.orderTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="courier" label="负责快递员" width="150">
            <template #default="{ row }">
              {{ row.courier || '未分配' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                @click="assignCourier(row)"
                :disabled="row.status !== 'pending'"
              >
                分配快递员
              </el-button>
              <el-button size="small" @click="viewDetails(row)">订单详情</el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteOrder(row)"
                :disabled="row.status === 'delivered'"
              >
                删除
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
  
      <!-- 分配快递员对话框 -->
      <el-dialog v-model="assignDialogVisible" title="分配快递员" width="500px">
        <el-form :model="assignForm" label-width="100px">
          <el-form-item label="订单ID">
            <el-input v-model="assignForm.orderId" disabled />
          </el-form-item>
          <el-form-item label="快递员">
            <el-select v-model="assignForm.courierId" placeholder="请选择快递员" style="width: 100%">
              <el-option
                v-for="courier in courierList"
                :key="courier.id"
                :label="courier.name"
                :value="courier.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="assignDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAssign">确认分配</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 订单详情对话框 -->
      <el-dialog v-model="detailDialogVisible" title="订单详情" width="700px">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单ID">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">{{ currentOrder.trackingNumber }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.orderTime) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusTagType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="快递员">{{ currentOrder.courier || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="收件人">{{ currentOrder.receiver }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ currentOrder.address }}
          </el-descriptions-item>
          <el-descriptions-item label="货物信息" :span="2">
            <el-table :data="currentOrder.items" style="width: 100%">
              <el-table-column prop="name" label="货物名称" />
              <el-table-column prop="quantity" label="货物数量" width="80" />
              <el-table-column prop="quantity" label="总重量" width="80" />
              <el-table-column prop="price" label="总价格" width="100" />
            </el-table>
          </el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  export default {
    setup() {
      // 订单数据
      const orderList = ref([])
      const loading = ref(false)
      const currentPage = ref(1)
      const pageSize = ref(10)
      const total = ref(0)
      const sortProp = ref('id')
      const sortOrder = ref('ascending')
  
      // 筛选表单
      const filterForm = reactive({
        orderId: '',
        trackingNumber: '',
        status: ''
      })
  
      // 分配快递员相关
      const assignDialogVisible = ref(false)
      const assignForm = reactive({
        orderId: '',
        courierId: ''
      })
      const courierList = ref([
        { id: '1', name: '张三' },
        { id: '2', name: '李四' },
        { id: '3', name: '王五' },
        { id: '4', name: '赵六' }
      ])
  
      // 订单详情相关
      const detailDialogVisible = ref(false)
      const currentOrder = ref({
        id: '',
        trackingNumber: '',
        orderTime: '',
        status: '',
        courier: '',
        receiver: '',
        phone: '',
        address: '',
        items: []
      })
  
      // 模拟获取订单数据
      const fetchOrders = async () => {
        loading.value = true
        try {
          // 这里应该是API调用，我们模拟数据
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 模拟数据
          const mockData = Array.from({ length: 50 }, (_, i) => ({
            id: `ORD${10000 + i}`,
            trackingNumber: `SF${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            orderTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            status: ['pending', 'shipped', 'in_transit', 'delivered'][Math.floor(Math.random() * 4)],
            courier: Math.random() > 0.3 ? courierList.value[Math.floor(Math.random() * courierList.value.length)].name : '',
            receiver: `用户${i + 1}`,
            phone: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
            address: `北京市朝阳区某某街道${i + 1}号`,
            items: [
              { name: `商品${i + 1}`, quantity: Math.floor(Math.random() * 5) + 1, price: (Math.random() * 100 + 10).toFixed(2) },
              { name: `商品${i + 100}`, quantity: Math.floor(Math.random() * 3) + 1, price: (Math.random() * 50 + 5).toFixed(2) }
            ]
          }))
  
          // 应用筛选
          let filteredData = [...mockData]
          if (filterForm.orderId) {
            filteredData = filteredData.filter(item => item.id.includes(filterForm.orderId))
          }
          if (filterForm.trackingNumber) {
            filteredData = filteredData.filter(item => item.trackingNumber.includes(filterForm.trackingNumber))
          }
          if (filterForm.status) {
            filteredData = filteredData.filter(item => item.status === filterForm.status)
          }
  
          // 应用排序
          if (sortProp.value) {
            filteredData.sort((a, b) => {
              if (sortOrder.value === 'ascending') {
                return a[sortProp.value] > b[sortProp.value] ? 1 : -1
              } else {
                return a[sortProp.value] < b[sortProp.value] ? 1 : -1
              }
            })
          }
  
          // 应用分页
          total.value = filteredData.length
          const start = (currentPage.value - 1) * pageSize.value
          const end = start + pageSize.value
          orderList.value = filteredData.slice(start, end)
        } catch (error) {
          ElMessage.error('获取订单数据失败: ' + error.message)
        } finally {
          loading.value = false
        }
      }
  
      // 初始化加载数据
      onMounted(() => {
        fetchOrders()
      })
  
      // 刷新订单
      const refreshOrders = () => {
        currentPage.value = 1
        fetchOrders()
      }
  
      // 处理筛选
      const handleFilter = () => {
        currentPage.value = 1
        fetchOrders()
      }
  
      // 重置筛选
      const resetFilter = () => {
        filterForm.orderId = ''
        filterForm.trackingNumber = ''
        filterForm.status = ''
        handleFilter()
      }
  
      // 处理排序
      const handleSortChange = ({ prop, order }) => {
        sortProp.value = prop
        sortOrder.value = order
        fetchOrders()
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
  
      // 分配快递员
      const assignCourier = (row) => {
        assignForm.orderId = row.id
        assignForm.courierId = ''
        assignDialogVisible.value = true
      }
  
      // 确认分配
      const confirmAssign = async () => {
        if (!assignForm.courierId) {
          ElMessage.warning('请选择快递员')
          return
        }
  
        try {
          loading.value = true
          // 这里应该是API调用，我们模拟
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 更新订单数据
          const order = orderList.value.find(item => item.id === assignForm.orderId)
          if (order) {
            const courier = courierList.value.find(c => c.id === assignForm.courierId)
            order.courier = courier.name
            order.status = 'shipped' // 分配后状态变为已发货
          }
          
          ElMessage.success('分配成功')
          assignDialogVisible.value = false
        } catch (error) {
          ElMessage.error('分配失败: ' + error.message)
        } finally {
          loading.value = false
        }
      }
  
      // 查看详情
      const viewDetails = (row) => {
        currentOrder.value = { ...row }
        detailDialogVisible.value = true
      }
  
      // 删除订单
      const deleteOrder = (row) => {
        ElMessageBox.confirm(`确定要删除订单 ${row.id} 吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            loading.value = true
            // 这里应该是API调用，我们模拟
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // 从列表中移除
            orderList.value = orderList.value.filter(item => item.id !== row.id)
            ElMessage.success('删除成功')
          } catch (error) {
            ElMessage.error('删除失败: ' + error.message)
          } finally {
            loading.value = false
          }
        }).catch(() => {
          // 用户取消
        })
      }
  
      // 格式化日期
      const formatDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      }
  
      // 获取状态文本
      const getStatusText = (status) => {
        const map = {
          pending: '未发货',
          shipped: '已发货',
          in_transit: '运输中',
          delivered: '已签收'
        }
        return map[status] || status
      }
  
      // 获取状态标签类型
      const getStatusTagType = (status) => {
        const map = {
          pending: 'warning',
          shipped: '',
          in_transit: 'info',
          delivered: 'success'
        }
        return map[status] || ''
      }
  
      return {
        orderList,
        loading,
        currentPage,
        pageSize,
        total,
        filterForm,
        assignDialogVisible,
        assignForm,
        courierList,
        detailDialogVisible,
        currentOrder,
        
        refreshOrders,
        handleFilter,
        resetFilter,
        handleSortChange,
        handleSizeChange,
        handleCurrentChange,
        assignCourier,
        confirmAssign,
        viewDetails,
        deleteOrder,
        formatDate,
        getStatusText,
        getStatusTagType
      }
    }
  }
  </script>
  
  <style scoped>
  .order-management-container {
    padding: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .filter-container {
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  </style>