<template>
    <div class="courier-order-container">
        <TitleBox title="我的订单" style="margin-bottom: 25px;"></TitleBox>
        <el-card class="box-card" style="box-shadow: none !important;">
            <template #header>
                <div class="card-header">
                    <span>已领取订单</span>
                </div>
            </template>

            <!-- 搜索和筛选区域 -->
            <div class="filter-container">
                <el-form :inline="true" :model="queryParams" class="demo-form-inline" >
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

            <!-- 订单表格 -->
            <el-table
                :data="orderList"
                border
                style="width: 1000px;"
                v-loading="loading"
                :shadow="false"
                class="table"
            >
                <el-table-column prop="orderId" label="订单号" width="120" fixed />
                <el-table-column label="寄件人信息" width="180">
                    <template #default="{ row }">
                        <div class="text-ellipsis" :title="row.senderName">
                            {{ row.senderName }}
                        </div>
                        <div class="text-ellipsis" :title="row.senderPhone">
                            {{ row.senderPhone }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="收件人信息" width="180">
                    <template #default="{ row }">
                        <div class="text-ellipsis" :title="row.receiverName">
                            {{ row.receiverName }}
                        </div>
                        <div class="text-ellipsis" :title="row.receiverPhone">
                            {{ row.receiverPhone }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="weight" label="重量(kg)" width="80" />
                <el-table-column label="货物类型" width="100">
                    <template #default="{ row }">
                        {{ row.type }}
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusTagType(row.status)" size="small">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="费用(元)" width="100">
                    <template #default="{ row }">
                        {{ row.fee.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" width="150">
                    <template #default="{ row }">
                        {{ formatDate(row.createdAt) }}
                    </template>
                </el-table-column>
                    <el-table-column label="操作" width="80" fixed="right">
                        <template #default="{ row }">
                            <el-button size="small" center @click="handleUpdateStatus(row)">更新</el-button>
                        </template>
                    </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination
                    :current-page="queryParams.pageNum"
                    :page-sizes="[5, 10, 20, 30, 50]"
                    :page-size="queryParams.pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>
        <!-- 新增地图对话框 -->
        <el-dialog
            title="更新状态"
            v-model="mapDialogVisible"
            width="800px"
            :style="{ marginTop: '20px', height: '800px', overflow: 'auto' }"
        >
            <MapContainner :stringOrderId="String(selectedId)" :key="selectedId" :role="1" />
            <template #footer>
                <el-button @click="mapDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { getCourierOrders } from '@/apis/modules/order'
import { ElMessage } from 'element-plus'
import MapContainner from '@/components/shared/MapContainner.vue'

interface Order {
    orderId: string
    senderName: string
    senderPhone: string
    senderAddr: string
    receiverName: string
    receiverPhone: string
    receiverAddr: string
    weight: number
    type: string  // 后端返回的是字符串
    status: string  // 后端返回的是字符串
    fee: number
    pickupCode?: string
    createdAt: string
    updatedAt: string
}

// 请求参数接口
interface QueryParams {
    pageNum: number
    pageSize: number
    keyword?: string
    senderPhone?: string
    receiverPhone?: string
    status?: number  // 发送请求时使用数字
    startDate?: string
    endDate?: string
}

const queryParams = reactive<QueryParams>({
    pageNum: 1,
    pageSize: 5,
    keyword: undefined,
    senderPhone: undefined,
    receiverPhone: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined
})

const dateRange = ref<[string, string] | []>([])
const loading = ref(false)
const orderList = ref<Order[]>([])
const total = ref(0)
const detailDialogVisible = ref(false)
const currentOrder = ref<Partial<Order>>({})
const selectedId = ref('')
const mapDialogVisible = ref(false)

async function getList() {
    loading.value = true
    try {
        // 发送请求时使用数字类型的参数
        const response = await getCourierOrders({
            ...queryParams,
            status: queryParams.status !== undefined ? Number(queryParams.status) : undefined
        })
        console.log('API响应:', response) // 添加调试信息
        if (response) {
            orderList.value = response.records ?? []
            // 确保total是数字类型
            total.value = Number(response.total) || 0
            console.log('订单列表:', orderList.value) // 添加调试信息
            console.log('总数:', total.value) // 添加调试信息
            console.log('总数类型:', typeof total.value) // 添加调试信息
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
    getList()
}

function resetQuery() {
    queryParams.pageNum = 1
    queryParams.pageSize = 5
    queryParams.keyword = undefined
    queryParams.senderPhone = undefined
    queryParams.receiverPhone = undefined
    queryParams.status = undefined
    queryParams.startDate = undefined
    queryParams.endDate = undefined
    dateRange.value = []
    handleQuery()
}

function handleDateChange(value: [string, string] | null) {
    if (value && value.length === 2) {
        queryParams.startDate = value[0];
        queryParams.endDate = value[1];
    } else {
        queryParams.startDate = undefined;
        queryParams.endDate = undefined;
    }
}

function handleSizeChange(val: number) {
    queryParams.pageSize = val
    getList()
}

function handleCurrentChange(val: number) {
    queryParams.pageNum = val
    getList()
}


function handleUpdateStatus(row: Order) {
    selectedId.value = row.orderId;
    mapDialogVisible.value = true
}

function formatDate(dateString?: string) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString()
}

function getStatusTagType(status?: string) {
    const typeMap: Record<string, string> = {
        '已揽件': 'success',
        '待揽件': 'warning',
        '运输中': 'info',
        '派送中': '',
        '已签收': 'success'
    }
    return typeMap[status ?? ''] || ''
}

onMounted(() => {
    getList()
})
</script>

<style scoped>
.courier-order-container {
    flex: 1;
    padding: 25px;
    padding-bottom:0 ;
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
    min-height: 40px;
}

.no-data {
    text-align: center;
    color: #999;
    padding: 20px;
    font-size: 14px;
}

.text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>