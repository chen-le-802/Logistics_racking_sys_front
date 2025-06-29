<template>
    <el-empty description="您还没有快递哦~" v-if="!tableData?.length" />
    <div v-else class="logistics-container">
        <div class="logistics-table">
            <el-table
                :data="tableData"
                style="max-Width:1000px;min-width:1000px"
                border
                stripe
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
                        <el-tag :type="getPayStatusType(row.paymantStatus)" effect="light">
                            {{ row.paymentStatus }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" width="180" sortable />
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
                            type="primary"
                            size="small"
                            @click="showMapModalVisible(row)"
                        >
                            查看物流
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="pagination.current"
                    v-model:page-size="pagination.size"
                    :page-sizes="[10, 20, 30, 50]"
                    :background="true"
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
        <el-dialog v-model="mapModalVisible" width="800px" style="margin-top: 20px;">
            <MapContainner :orderId="selectedOrderId"></MapContainner>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getOrder, getOrderById, } from '@/apis/modules/order'
import { ElMessage } from 'element-plus'
import { defineProps, defineEmits, defineExpose } from 'vue'
import MapContainner from '../shared/MapContainner.vue'

const props = defineProps({
    trackingNumber: {
        type: BigInt,
        default: ''
    },
    searchType: {
        type: String,
        default: 'send'
    }
})
const mapModalVisible = ref(false)
const emit = defineEmits(['search-complete'])

const pagination = ref({
    current: 1,
    size: 10,
    total: 0
})

const tableData = ref([])

const fetchOrderList = async () => {
    try {
        const { current, size } = pagination.value
        const params = { pageNum: current, pageSize: size }
        const res = await getOrder(params)
        tableData.value = res.records || []
        pagination.value.total = res.total || 0
        pagination.value.size = res.size || size
        pagination.value.current = res.current || current
    } catch (error) {
        ElMessage.error('获取订单列表异常')
        tableData.value = []
        pagination.value.total = 0
    } finally {
 
    }
}

const handleSizeChange = val => {
    pagination.value.size = val
    pagination.value.current = 1
    fetchOrderList()
}

const handleCurrentChange = val => {
    pagination.value.current = val
    fetchOrderList()
}

const showMapModalVisible = row => {
    selectedOrderId.value = String(row.orderId)
    mapModalVisible.value = true
}

onMounted(fetchOrderList)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogContent = ref('')
const dialogType = ref('')
const currentRow = ref(null)
const detailModalVisible = ref(false)
const selectedOrderId = ref('')
const currentDetail = ref({
    orderId: BigInt,
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

// const confirmReceipt = async () => {
//     if (!currentRow.value) {
//         dialogVisible.value = false
//         return
//     }
//     try {
//         const res = await confirmOrderReceipt(currentRow.value.orderId)
//         if (res.code === 0) {
//             ElMessage.success('确认收货成功')
//             fetchOrderList()
//         } else {
//             ElMessage.error(res.message || '确认收货失败')
//         }
//     } catch {
//         ElMessage.error('确认收货异常')
//     } finally {
//         dialogVisible.value = false
//         resetDialog()
//     }
// }

// const deleteRow = async () => {
//     if (!currentRow.value) {
//         dialogVisible.value = false
//         return
//     }
//     try {
//         const res = await deleteOrder(currentRow.value.orderId)
//         if (res.code === 0) {
//             ElMessage.success('删除订单成功')
//             if (tableData.value.length === 1 && pagination.value.current > 1) {
//                 pagination.value.current -= 1
//             }
//             fetchOrderList()
//         } else {
//             ElMessage.error(res.message || '删除订单失败')
//         }
//     } catch {
//         ElMessage.error('删除订单异常')
//     } finally {
//         dialogVisible.value = false
//         resetDialog()
//     }
// }

const handleSelectionChange = selection => {
    // 可扩展多选逻辑
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
        if (res && res.orderId) {
            tableData.value = [res]
            pagination.value.total = 1
            emit('search-complete', true)
        } else {
            tableData.value = []
            pagination.value.total = 0
            emit('search-complete', false)
            ElMessage.warning('未查到您搜索的快递')
        }
    } catch {
        ElMessage.error('查询失败，稍后再试')
    } finally {
      
    }
}

const loadData = () => fetchOrderList()

defineExpose({ searchByTrackingNumber, loadData,fetchOrderList })

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
</script>

<style scoped>
.logistics-container {
    background-color: #fff;
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
</style>
