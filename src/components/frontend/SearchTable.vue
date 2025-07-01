<template>
    <div class="logistics-container">
        <!-- 搜索和筛选区域 -->
        <div class="filter-container">
            <el-form :inline="true" :model="queryParams" class="demo-form-inline">
                <el-form-item label="关键词">
                    <el-input
                        v-model="queryParams.keyword"
                        placeholder="订单号/收件人姓名"
                        clearable
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="寄件人电话">
                    <el-input
                        v-model="queryParams.senderPhone"
                        placeholder="寄件人电话"
                        clearable
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="收件人电话">
                    <el-input
                        v-model="queryParams.receiverPhone"
                        placeholder="收件人电话"
                        clearable
                        @keyup.enter="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="订单状态" style="width: 180px;">
                    <el-select
                        v-model="queryParams.status"
                        placeholder="全部状态"
                        clearable
                    >
                        <el-option label="已下单" value="1" />
                        <el-option label="待揽件" value="2" />
                        <el-option label="运输中" value="3" />
                        <el-option label="派送中" value="4" />
                        <el-option label="已签收" value="5" />
                    </el-select>
                </el-form-item>
                <el-form-item label="日期范围">
                    <el-date-picker
                        v-model="dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="YYYY-MM-DD"
                        @change="handleDateChange"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <div class="logistics-table">
            <el-empty description="您还没有快递哦~" v-if="!tableData?.length" />
            <el-table
                v-else
                :data="tableData"
                style="max-width:1000px;min-width:1000px"
                border
                stripe
                v-loading="loading"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="orderId" label="订单ID" width="100" />
                <el-table-column prop="senderName" label="寄件人" width="120" />
                <el-table-column prop="senderPhone" label="寄件电话" width="150" />
                <el-table-column prop="receiverName" label="收件人" width="120" />
                <el-table-column prop="receiverPhone" label="收件电话" width="150" />
                <el-table-column prop="weight" label="重量(kg)" width="100" />
                <el-table-column prop="type" label="类型" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getTypeTag(row.type)">
                            {{ row.type }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)" effect="light">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="paymentStatus" label="支付状态" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getPayStatusType(row.paymentStatus)" effect="light">
                            {{ row.paymentStatus }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" width="180" sortable :formatter="formatDate" />
                <el-table-column label="操作" width="260">
                    <template #default="{ row }">
                        <el-button size="small" @click="showDetailModal(row)">
                            订单详情
                        </el-button>
                       
                        <el-button
                            type="danger"
                            size="small"
                            @click="openDialog('delete', row)"
                        >
                            删除
                        </el-button>
                        <el-button
                            v-if="row.paymentStatus === '已支付'"
                            type="primary"
                            size="small"
                            @click="showMapModalVisible(row)"
                        >
                            查看物流
                        </el-button>
                        <el-button
                            v-else
                            type="warning"
                            size="small"
                            @click="openPayDialog(row)"
                        >
                            去支付
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container" v-if="pagination.total > 0">
                <el-pagination
                    :current-page="queryParams.pageNum"
                    :page-sizes="[10, 20, 30, 50]"
                    :page-size="queryParams.pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pagination.total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>

        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="400px"
            @close="resetDialog"
        >
            <span>{{ dialogContent }}</span>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button
                    v-if="dialogType === 'confirm'"
                    type="primary"
                    @click="confirmReceipt"
                >确认</el-button>
                <el-button
                    v-if="dialogType === 'delete'"
                    type="danger"
                    @click="deleteRow"
                >删除</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="detailModalVisible" :title="'订单详情 - ' + currentDetail.orderId" width="600px">
            <el-descriptions :column="1" border>
                <el-descriptions-item label="寄件人信息">
                    {{ currentDetail.senderName }} ({{ currentDetail.senderPhone }})<br />
                    {{ currentDetail.senderAddr }}
                </el-descriptions-item>
                <el-descriptions-item label="收件人信息">
                    {{ currentDetail.receiverName }} ({{ currentDetail.receiverPhone }})<br />
                    {{ currentDetail.receiverAddr }}
                </el-descriptions-item>
                <el-descriptions-item label="快递信息">
                    订单ID: {{ currentDetail.orderId }}<br />
                    重量: {{ currentDetail.weight }}kg<br />
                    类型: {{ currentDetail.type }}<br />
                    状态: <el-tag :type="getStatusType(currentDetail.status)" size="small">{{ currentDetail.status }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="其他信息">
                    取件码: {{ currentDetail.pickupCode || '无' }}<br />
                    费用: ¥{{ currentDetail.fee?.toFixed(2) || '0.00' }}<br />
                    快递员ID: {{ currentDetail.courierId || '未分配' }}<br />
                    创建时间: {{ currentDetail.createdAt }}<br />
                </el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="detailModalVisible = false">关闭</el-button>
            </template>
        </el-dialog>
        <el-dialog v-model="mapModalVisible" width="800px" style="margin-top:20px;height: 800px;overflow: auto;">
    <MapContainner :stringOrderId="selectedOrderId" :key="selectedOrderId" :role="0"></MapContainner>
</el-dialog>

        <el-dialog 
            v-model="payModalVisible" 
            width="500px" 
            title="支付订单" 
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="false"
        >
            <div class="payment-content">
                <div class="payment-info">
                    <h3>订单信息</h3>
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="订单号">{{ payOrderId }}</el-descriptions-item>
                    </el-descriptions>
                </div>
                <div class="payment-methods">
                    <h3 style="margin-bottom: 12px;">选择支付方式</h3>
                    <el-radio-group v-model="paymentMethod" class="pay-radio-group">
                        <el-radio label="wechat" border class="pay-radio">
                            <img src="@/assets/images/common/wechatPay.png" alt="微信支付" class="payment-icon" />
                        </el-radio>
                        <el-radio label="alipay" border class="pay-radio">
                            <img src="@/assets/images/common/zhifubao.png" alt="支付宝" class="payment-icon" />
                        </el-radio>
                    </el-radio-group>
                </div>
                <div class="payment-tips" v-if="paymentStatus === 'pending'">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>正在生成支付二维码...</span>
                </div>
                <div class="payment-qrcode" v-if="paymentStatus === 'ready'">
                    <img src='@/assets/images/common/code.png' alt="支付二维码" class="qrcode-image">
                    <p>请使用{{ paymentMethod === 'wechat' ? '微信' : '支付宝' }}扫码支付</p>
                </div>
                <div class="payment-success" v-if="paymentStatus === 'success'">
                    <el-result icon="success" title="支付成功">
                        <template #extra>
                            <el-button type="primary" @click="handlePaymentComplete">完成</el-button>
                        </template>
                    </el-result>
                </div>
            </div>
            <template #footer>
                <div class="payment-footer">
                    <el-button 
                        v-if="paymentStatus !== 'success'" 
                        @click="handleCancelPayment"
                        :disabled="paymentStatus === 'processing'"
                    >
                        取消支付
                    </el-button>
                    <el-button 
                        v-if="paymentStatus !== 'success'" 
                        type="primary" 
                        @click="handleConfirmPayment"
                        :loading="paymentStatus === 'processing'"
                    >
                        我已支付
                    </el-button>
                    <el-button 
                        v-if="paymentStatus === 'success'" 
                        type="primary" 
                        @click="handlePaymentComplete"
                    >
                        完成
                    </el-button>
                </div>
            </template>
        </el-dialog>

    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { getOrder, getOrderById, deleteOrder } from '@/apis/modules/order'
import { ElMessage } from 'element-plus'
import { defineProps, defineEmits, defineExpose } from 'vue'
import MapContainner from '../shared/MapContainner.vue'

const props = defineProps({
    trackingNumber: {
        type: String,
        default: ''
    },
    searchType: {
        type: String,
        default: 'send'
    }
})

// 请求参数对象
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    keyword: undefined,
    senderPhone: undefined,
    receiverPhone: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined
})

const dateRange = ref([])
const mapModalVisible = ref(false)
const emit = defineEmits(['search-complete'])

const pagination = ref({
    current: 1,
    size: 10,
    total: 0
})

const tableData = ref([])
const loading = ref(false)

const fetchOrderList = async () => {
    loading.value = true
    try {
        // 发送请求时使用数字类型的参数
        const response = await getOrder({
            ...queryParams,
            status: queryParams.status !== undefined ? Number(queryParams.status) : undefined
        })
        console.log('API响应:', response)
        if (response) {
            tableData.value = response.records ?? []
            pagination.value.total = Number(response.total) || 0
            pagination.value.size = Number(response.size) || queryParams.pageSize
            pagination.value.current = Number(response.current) || queryParams.pageNum
            console.log('订单列表:', tableData.value)
            console.log('总数:', pagination.value.total)
        } else {
            ElMessage.error('获取订单列表失败')
        }
    } catch (error) {
        console.error('获取订单列表失败:', error)
        ElMessage.error('获取订单列表失败')
    } finally {
        loading.value = false
    }
}

function handleQuery() {
    queryParams.pageNum = 1
    fetchOrderList()
}

function resetQuery() {
    queryParams.pageNum = 1
    queryParams.pageSize = 10
    queryParams.keyword = undefined
    queryParams.senderPhone = undefined
    queryParams.receiverPhone = undefined
    queryParams.status = undefined
    queryParams.startDate = undefined
    queryParams.endDate = undefined
    dateRange.value = []
    handleQuery()
}

function handleDateChange(value) {
    if (value && value.length === 2) {
        queryParams.startDate = value[0];
        queryParams.endDate = value[1];
    } else {
        queryParams.startDate = undefined;
        queryParams.endDate = undefined;
    }
}

const handleSizeChange = val => {
    queryParams.pageSize = val
    queryParams.pageNum = 1
    fetchOrderList()
}

const handleCurrentChange = val => {
    queryParams.pageNum = val
    fetchOrderList()
}

const showMapModalVisible = row => {
    selectedOrderId.value = row.orderId
    mapModalVisible.value = true
}

onMounted(() => {
    fetchOrderList()
    console.log('SearchTable mounted, queryParams:', queryParams)
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogContent = ref('')
const dialogType = ref('')
const currentRow = ref(null)
const detailModalVisible = ref(false)
const selectedOrderId = ref('')
const currentDetail = ref({
    orderId: '',
    senderName: '',
    senderPhone: '',
    senderAddr: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddr: '',
    weight: 0,
    type: '',
    status: '',
    paymentStatus:'',
    pickupCode: '',
    fee: 0,
    courierId: 0,
    createdAt: '',
})

const showDetailModal = row => {
    currentDetail.value = { ...row }
    detailModalVisible.value = true
}

const openDialog = (type, row) => {
    dialogType.value = type
    currentRow.value = row
    dialogVisible.value = true
    if (type === 'confirm') {
        dialogTitle.value = '确认收货'
        dialogContent.value = `确认订单 ${row.orderId} 已收货?`
    } else if (type === 'delete') {
        dialogTitle.value = '删除确认'
        dialogContent.value = `确定要删除订单 ${row.orderId} 的记录吗?`
    }
}

const resetDialog = () => {
    dialogType.value = ''
    currentRow.value = null
    dialogTitle.value = ''
    dialogContent.value = ''
}

const handleSelectionChange = selection => {
    // 可扩展多选逻辑
}

const deleteRow = async () => {
    if (!currentRow.value) return
    
    try {
        await deleteOrder(currentRow.value.orderId)
        ElMessage.success('订单删除成功')
        dialogVisible.value = false
        // 重新加载数据
        await fetchOrderList()
    } catch (error) {
        console.error('删除订单失败:', error)
        ElMessage.error('删除订单失败，请稍后重试')
    }
}

const getStatusType = status => ({
    '未揽收': 'info',
    '已揽收': '',
    '运输中': 'warning',
    '已收货': 'success'
}[status] || '')
const getPayStatusType = status => ({
    '未支付': 'warning',
    '已支付': 'success'
}[status] || '')

const getTypeTag = type => ({
    '文件': 'info',
    '包裹': '',
    '大件': 'warning'
}[type] || '')

// 按快递单号查询
const searchByTrackingNumber = async trackingNumber => {
    try {
        const res = await getOrderById(trackingNumber)
        if (res && res.records && res.records.length > 0) {
            tableData.value = res.records
            pagination.value.total = parseInt(res.total) || res.records.length
            emit('search-complete', true)
        } else {
            tableData.value = []
            pagination.value.total = 0
            emit('search-complete', false)
            ElMessage.warning('未查到您搜索的快递')
        }
    } catch {
        ElMessage.error('查询失败，稍后再试')
    }
}

// 模糊搜索功能
const searchByKeyword = async (keyword) => {
    try {
        queryParams.keyword = keyword
        queryParams.pageNum = 1
        await fetchOrderList()
        emit('search-complete', tableData.value.length > 0)
        if (tableData.value.length === 0) {
            ElMessage.warning('未找到相关订单')
        }
    } catch (error) {
        ElMessage.error('搜索失败，稍后再试')
        emit('search-complete', false)
    }
}

const loadData = () => fetchOrderList()

// 添加调试函数
const debugPagination = () => {
    console.log('分页信息:', {
        current: queryParams.pageNum,
        size: queryParams.pageSize,
        total: pagination.value.total,
        tableDataLength: tableData.value.length
    })
}

defineExpose({ searchByTrackingNumber, searchByKeyword, loadData, fetchOrderList, debugPagination })

watch(
    () => props.searchType,
    () => {
        if (props.trackingNumber) {
            searchByTrackingNumber(props.trackingNumber)
        } else {
            loadData()
        }
    }
)

// 在 <script setup> 里添加 formatDate 方法
const formatDate = (row, column, cellValue) => {
    if (!cellValue) return '';
    const date = new Date(cellValue);
    if (isNaN(date.getTime())) return cellValue;
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 支付相关状态
const payModalVisible = ref(false)
const paymentMethod = ref('wechat')
const paymentStatus = ref('pending')
const qrcodeUrl = ref('')
const payOrderId = ref('')
const paymentTimer = ref(null)

// 打开支付弹窗
const openPayDialog = (row) => {
    payOrderId.value = row.orderId
    payModalVisible.value = true
    paymentStatus.value = 'pending'
    startPaymentProcess()
}

// 模拟生成支付二维码
const startPaymentProcess = () => {
    paymentStatus.value = 'pending'
    setTimeout(() => {
        qrcodeUrl.value = paymentMethod.value === 'wechat'
            ? '@/assets/images/common/code.png'
            : '@/assets/images/common/code.png'
        paymentStatus.value = 'ready'
    }, 1500)
}

// 支付已完成按钮处理
const handleConfirmPayment = () => {
    paymentStatus.value = 'processing'
    changePayStatu()
    setTimeout(() => {
        paymentStatus.value = 'success'
        if (paymentTimer.value) {
            clearInterval(paymentTimer.value)
        }
        ElMessage.success('支付成功！')
        // 支付成功后刷新订单列表
        fetchOrderList()
    }, 3000)
}

const changePayStatu = async () => {
    await getOrderById(payOrderId.value) // 这里可替换为实际的支付状态变更API
}

// 取消支付处理
const handleCancelPayment = () => {
    if (paymentTimer.value) {
        clearInterval(paymentTimer.value)
    }
    payModalVisible.value = false
    paymentStatus.value = 'pending'
    ElMessage.info('已取消支付')
}
const handlePaymentComplete = () => {
    payModalVisible.value = false
    paymentStatus.value = 'pending'
    fetchOrderList()
}
</script>

<style scoped>
.logistics-container {
    background-color: #fff;
}
.filter-container {
    margin-bottom: 20px;
}
.logistics-table {
    margin-bottom: 20px;
}
.el-table {
    margin-top: 20px;
}
.el-button + .el-button {
    margin-left: 8px;
}
.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
.payment-content {
    padding: 0 20px;
}
.payment-info, .payment-methods {
    margin-bottom: 20px;
}
.payment-amount {
    color: #f56c6c;
    font-weight: bold;
    font-size: 18px;
}
.payment-icon {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin-right: 5px;
}
.payment-tips {
    text-align: center;
    padding: 20px 0;
    color: #666;
}
.payment-qrcode {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px 0;
}
.qrcode-image {
    width: 200px;
    height: 200px;
    margin-bottom: 10px;
}
.payment-footer {
    display: flex;
    justify-content: space-between;
}
.payment-success {
    padding: 20px 0;
}
.pay-radio{
    display: flex !important;
    flex-wrap: nowrap;
}
@media (max-width: 768px) {
    .payment-content {
        padding: 0 5px;
    }
    .payment-info, .payment-methods {
        margin-bottom: 10px;
    }
    .qrcode-image {
        width: 120px;
        height: 120px;
    }
}
</style>
