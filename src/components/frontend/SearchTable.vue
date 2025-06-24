<template>
    <el-empty description="您还没有快递哦~" v-if="tableData === null"/>
    <div v-else class="logistics-table">
        <el-table
            :data="tableData"
            style="width: 100%"
            border
            stripe
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="trackingNumber" label="快递单号" width="180" />
            <el-table-column prop="phone" label="联系电话" width="150" />
            <el-table-column prop="contact" label="联系人" width="120" />
            <el-table-column prop="createTime" label="创建时间" width="180" sortable />
            <el-table-column prop="status" label="状态" width="120">
                <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)" effect="light">
                        {{ row.status }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="260">
                <template #default="{ row }">
                    <el-button
                        size="small"
                        @click="openDialog('confirm', row)"
                    >
                        详情
                    </el-button>
                    <el-button
                        v-if="row.status !== '已签收'"
                        type="success"
                        size="small"
                        @click="openDialog('confirm', row)"
                    >
                        确认收货
                    </el-button>
                    <el-button
                        type="danger"
                        size="small"
                        @click="openDialog('delete', row)"
                    >
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- Dialog -->
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
    </div>
</template>

<script setup>
import { ref } from 'vue'

// 表格数据
const tableData = ref([
    {
        trackingNumber: 'YT123456789',
        phone: '13800138000',
        contact: '张三',
        createTime: '2023-12-15 08:30:22',
        status: '已发货'
    },
    {
        trackingNumber: 'SF987654321',
        phone: '13900139000',
        contact: '李四',
        createTime: '2023-12-16 14:15:33',
        status: '运输中'
    },
    {
        trackingNumber: 'JD456123789',
        phone: '13700137000',
        contact: '王五',
        createTime: '2023-12-17 09:45:12',
        status: '未发货'
    },
    {
        trackingNumber: 'ST789456123',
        phone: '13600136000',
        contact: '赵六',
        createTime: '2023-12-18 11:20:45',
        status: '已签收'
    }
])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogContent = ref('')
const dialogType = ref('')
const currentRow = ref(null)

const openDialog = (type, row) => {
    dialogType.value = type
    currentRow.value = row
    dialogVisible.value = true
    if (type === 'confirm') {
        dialogTitle.value = '确认收货'
        dialogContent.value = `确认快递单号 ${row.trackingNumber} 已收货?`
    } else if (type === 'delete') {
        dialogTitle.value = '删除确认'
        dialogContent.value = `确定要删除快递单号 ${row.trackingNumber} 的记录吗?`
    }
}

const resetDialog = () => {
    dialogType.value = ''
    currentRow.value = null
    dialogTitle.value = ''
    dialogContent.value = ''
}

const confirmReceipt = () => {
    if (currentRow.value) {
        currentRow.value.status = '已签收'
    }
    dialogVisible.value = false
    resetDialog()
}

const deleteRow = () => {
    if (currentRow.value) {
        const index = tableData.value.findIndex(item => item.trackingNumber === currentRow.value.trackingNumber)
        if (index !== -1) {
            tableData.value.splice(index, 1)
        }
    }
    dialogVisible.value = false
    resetDialog()
}

// 多选处理
const handleSelectionChange = (selection) => {
    console.log('选中项:', selection)
}

// 获取状态标签类型
const getStatusType = (status) => {
    const typeMap = {
        '未发货': 'info',
        '已发货': '',
        '运输中': 'warning',
        '已签收': 'success'
    }
    return typeMap[status] || ''
}
</script>

<style scoped>
.logistics-table {
 
    background-color: #fff;
   
}

.el-table {
    margin-top: 20px;
}

.el-button + .el-button {
    margin-left: 8px;
}
</style>