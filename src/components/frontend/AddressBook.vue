<template>
    <div class="address-book">
        <!-- 操作栏 -->
        <div class="action-bar">
            <el-input
                v-model="searchQuery"
                placeholder="请输入联系人/地址/电话查询"
                class="search-input"
                clearable
                @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="primary" @click="showAddDialog">新增地址</el-button>
        </div>

        <!-- 地址列表 -->
        <el-table 
            :data="pagedAddresses" 
            border 
            style="width: 100%"
            @row-click="handleRowClick"
        >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="联系人" width="120" />
            <el-table-column prop="phone" label="联系方式" width="150" />
            <el-table-column prop="address" label="地址" />
            <el-table-column label="操作" width="150">
                <template #default="{ row }">
                    <el-button size="small" @click.stop="handleEdit(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click.stop="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
            <el-pagination
                small
                layout="prev, pager, next"
                :total="total"
                :page-size="pageSize"
                v-model:current-page="currentPage"
            />
        </div>

        <!-- 新增/编辑对话框 -->
        <el-dialog center v-model="dialogVisible" :title="dialogTitle" width="50%" style="margin-top: 280px;"> 
            <el-form :model="currentAddress" label-width="80px">
                <el-form-item label="联系人" required>
                    <el-input v-model="currentAddress.name" placeholder="请输入联系人姓名" />
                </el-form-item>
                <el-form-item label="联系方式" required>
                    <el-input v-model="currentAddress.phone" placeholder="请输入电话号码" />
                </el-form-item>
                <el-form-item label="地址" required>
                    <el-input v-model="currentAddress.address" placeholder="请输入详细地址" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleConfirm">确认</el-button>
                </span>
            </template>
        </el-dialog>
        
        <el-dialog
            v-model="deleteDialogVisible"
            title="确认删除"
            width="30%"
            style="margin-top: 300px;"
            center
        >
            <span>确定要删除该地址吗？</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancelDelete">取消</el-button>
                    <el-button type="danger" @click="confirmDelete">删除</el-button>
                </span>
            </template>
        </el-dialog>
        
        <!-- 添加确认选择按钮 -->
        <div class="selection-actions" v-if="showSelection">
            <el-button type="primary" @click="confirmSelection">确认选择</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Address {
    id: number
    name: string
    phone: string
    address: string
}
// 定义props和emits
const props = defineProps({
    showSelection: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select', 'update:modelValue'])

// 模拟数据
const mockAddresses: Address[] = [
    { id: 1, name: '陈女士', phone: '13800000001', address: '贵州省毕节市大方镇路塘村二组顺丰速运县医院速运营业点' },
    { id: 2, name: '陈女士', phone: '13800000002', address: '浙江省杭州市浦沿街道彩虹城26栋1902号' },
    { id: 3, name: '陈女士', phone: '13800000001', address: '贵州省毕节市大方镇路塘村二组顺丰速运县医院速运营业点' },
    { id: 4, name: '陈女士', phone: '13800000002', address: '浙江省杭州市浦沿街道彩虹城26栋1902号' },
    { id: 5, name: '陈女士', phone: '13800000001', address: '贵州省毕节市大方镇路塘村二组顺丰速运县医院速运营业点' },
    { id: 6, name: '陈女士', phone: '13800000002', address: '浙江省杭州市浦沿街道彩虹城26栋1902号' },
    { id: 7, name: '陈女士', phone: '13800000001', address: '贵州省毕节市大方镇路塘村二组顺丰速运县医院速运营业点' },
    { id: 8, name: '陈女士', phone: '13800000002', address: '浙江省杭州市浦沿街道彩虹城26栋1902号' },
    { id: 9, name: '陈女士', phone: '13800000001', address: '贵州省毕节市大方镇路塘村二组顺丰速运县医院速运营业点' },
    { id: 10, name: '陈女士', phone: '13800000002', address: '浙江省杭州市浦沿街道彩虹城26栋1902号' },
]

// 状态管理
const addresses = ref<Address[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
const dialogVisible = ref(false)
const currentAddress = ref<Address>({ id: 0, name: '', phone: '', address: '' })
const isEditing = ref(false)
//删除对话框相关状态
const deleteDialogVisible = ref(false)
const addressToDelete = ref<Address | null>(null)
const selectedAddress = ref<Address | null>(null) // 新增：选中的地址

// 行点击事件
const handleRowClick = (row: Address) => {
    if (props.showSelection) {
        selectedAddress.value = row
    }
}

// 确认选择
const confirmSelection = () => {
    if (selectedAddress.value) {
        emit('select', selectedAddress.value)
        emit('update:modelValue', selectedAddress.value)
    }
}

// 计算属性
const filteredAddresses = computed(() => {
    if (!searchQuery.value) {
        return addresses.value
    }
    const query = searchQuery.value.toLowerCase()
    return addresses.value.filter(
        item =>
            item.name.toLowerCase().includes(query) ||
            item.phone.toLowerCase().includes(query) ||
            item.address.toLowerCase().includes(query)
    )
})

// 分页后的地址
const pagedAddresses = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredAddresses.value.slice(start, end)
})

// 保证分页总数正确
watch(filteredAddresses, (newVal) => {
    total.value = newVal.length
    if ((currentPage.value - 1) * pageSize.value >= total.value && currentPage.value > 1) {
        currentPage.value = 1
    }
})

// 初始化数据
onMounted(() => {
    addresses.value = mockAddresses
    total.value = mockAddresses.length
})

// 搜索处理
const handleSearch = () => {
    currentPage.value = 1
}

// 显示添加对话框
const showAddDialog = () => {
    currentAddress.value = { id: 0, name: '', phone: '', address: '' }
    isEditing.value = false
    dialogVisible.value = true
}

// 显示编辑对话框
const handleEdit = (row: Address) => {
    currentAddress.value = { ...row }
    isEditing.value = true
    dialogVisible.value = true
}

// 修改删除按钮事件
const handleDelete = (row: Address) => {
    addressToDelete.value = row
    deleteDialogVisible.value = true
}

// 删除确认
const confirmDelete = () => {
    if (addressToDelete.value) {
        addresses.value = addresses.value.filter(item => item.id !== addressToDelete.value!.id)
        total.value = addresses.value.length
        deleteDialogVisible.value = false
        addressToDelete.value = null
    }
}

// 取消删除
const cancelDelete = () => {
    deleteDialogVisible.value = false
    addressToDelete.value = null
}
// 确认添加/编辑
const handleConfirm = () => {
    if (!currentAddress.value.name || !currentAddress.value.phone || !currentAddress.value.address) {
        return
    }

    if (isEditing.value) {
        // 更新现有地址
        const index = addresses.value.findIndex(item => item.id === currentAddress.value.id)
        if (index !== -1) {
            addresses.value[index] = { ...currentAddress.value }
        }
    } else {
        // 添加新地址
        const newId = Math.max(...addresses.value.map(item => item.id), 0) + 1
        addresses.value.push({
            id: newId,
            name: currentAddress.value.name,
            phone: currentAddress.value.phone,
            address: currentAddress.value.address
        })
        total.value = addresses.value.length
    }

    dialogVisible.value = false
}

// 对话框标题
const dialogTitle = computed(() => {
    return isEditing.value ? '编辑地址' : '新增地址'
})
</script>

<style scoped>
.address-book {
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.action-bar {
    display: flex;
    margin-bottom: 20px;
}

.search-input {
    width: 300px;
    margin-right: 10px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
</style>