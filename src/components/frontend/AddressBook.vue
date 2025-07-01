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
            @selection-change="handleSelectionChange"
            :row-class-name="rowClassName"
            v-loading="loading"
        >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="联系人" width="120" />
            <el-table-column prop="phone" label="联系方式" width="150" />
            <el-table-column prop="address" label="地址" />
            <el-table-column label="默认地址" width="100">
                <template #default="{ row }">
                    <el-tag v-if="row.isDefault === 1" type="success" size="small">默认</el-tag>
                    <el-button v-else size="small" @click.stop="setDefaultAddress(row)">设为默认</el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template #default="{ row }">
                    <el-button size="small" @click.stop="handleEdit(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click.stop="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
            <el-pagination
                background
                layout="prev, pager, next, jumper"
                :current-page="currentPage"
                :page-size="pageSize"
                :total="filteredAddresses.length"
                @current-change="handlePageChange"
            />
        </div>

        <!-- 新增/编辑对话框 -->
        <el-dialog center v-model="dialogVisible" :title="dialogTitle" width="50%" style="margin-top: 280px;"> 
            <el-form :model="currentAddress" label-width="80px" :rules="rules" ref="formRef">
                <el-form-item label="联系人" prop="name" required>
                    <el-input v-model="currentAddress.name" placeholder="请输入联系人姓名" />
                </el-form-item>
                <el-form-item label="联系方式" prop="phone" required>
                    <el-input v-model="currentAddress.phone" placeholder="请输入电话号码" />
                </el-form-item>
                <el-form-item label="地址" prop="address" required>
                    <el-input v-model="currentAddress.address" placeholder="请输入详细地址" />
                </el-form-item>
                <el-form-item label="默认地址">
                    <el-switch v-model="currentAddress.isDefault" :active-value="1" :inactive-value="0" />
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
import { ref, computed, onMounted } from 'vue'
import { getAddressBook, addAddressBook, updateAddressBook, deleteAddressBook } from '@/apis/modules/order'
import { ElMessage } from 'element-plus'
import type { AddressBookRecord, AddressBookRequest, UpdateAddressBookRequest } from '@/apis/modules/order/types'

// 定义props和emits
const props = defineProps({
    showSelection: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select', 'update:modelValue'])

// 状态管理
const addresses = ref<AddressBookRecord[]>([])
const searchQuery = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const currentAddress = ref<AddressBookRequest>({ name: '', phone: '', address: '', isDefault: 0 })
const isEditing = ref(false)
const addressId = ref(0)
//删除对话框相关状态
const deleteDialogVisible = ref(false)
const addressToDelete = ref<AddressBookRecord | null>(null)
const selectedAddress = ref<AddressBookRecord | null>(null) // 新增：选中的地址
const formRef = ref()
const currentPage = ref(1)
const pageSize = 10

// 表单验证规则
const rules = {
    name: [
        { required: true, message: '请输入联系人姓名', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入电话号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    address: [
        { required: true, message: '请输入详细地址', trigger: 'blur' }
    ]
}

// 行点击事件
const handleRowClick = (row: AddressBookRecord) => {
    if (props.showSelection) {
        selectedAddress.value = row
        console.log('选中行:', row)
    }
}

const handleSelectionChange = (selection: AddressBookRecord[]) => {
    if (props.showSelection && selection.length > 0) {
        selectedAddress.value = selection[selection.length - 1]
        console.log('多选选中:', selectedAddress.value)
    }
}

const rowClassName = ({ row }: { row: AddressBookRecord }) => {
    return selectedAddress.value && row.addressId === selectedAddress.value.addressId ? 'selected-row' : ''
}

// 确认选择
const confirmSelection = () => {
    if (selectedAddress.value) {
        console.log('确认选择', selectedAddress.value)
        emit('select', {
            id: selectedAddress.value.addressId,
            name: selectedAddress.value.name,
            phone: selectedAddress.value.phone,
            address: selectedAddress.value.address,
            isDefault: selectedAddress.value.isDefault
        })
        emit('update:modelValue', selectedAddress.value)
    }
}

// 计算属性 - 过滤后的地址列表
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

const pagedAddresses = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return filteredAddresses.value.slice(start, end)
})

// 获取地址簿列表
const fetchAddressBook = async () => {
    loading.value = true
    try {
        const response = await getAddressBook();
    if (response) {
        addresses.value = response;
    }
    } catch (error) {
        console.error('获取地址簿失败:', error)
        ElMessage.error('获取地址簿失败')
    } finally {
        loading.value = false
    }
}

// 初始化数据
onMounted(() => {
    fetchAddressBook()
})

// 搜索处理
const handleSearch = () => {
    // 搜索功能通过计算属性自动过滤，无需额外处理
}

// 显示添加对话框
const showAddDialog = () => {
    currentAddress.value = { name: '', phone: '', address: '', isDefault: 0 }
    isEditing.value = false
    addressId.value = 0
    dialogVisible.value = true
}

// 显示编辑对话框
const handleEdit = (row: AddressBookRecord) => {
    currentAddress.value = { 
        name: row.name, 
        phone: row.phone, 
        address: row.address, 
        isDefault: row.isDefault 
    }
    addressId.value = row.addressId
    isEditing.value = true
    dialogVisible.value = true
}

// 修改删除按钮事件
const handleDelete = (row: AddressBookRecord) => {
    addressToDelete.value = row
    deleteDialogVisible.value = true
}

// 删除确认
const confirmDelete = async () => {
    if (addressToDelete.value) {
        try {
            await deleteAddressBook(addressToDelete.value.addressId)
            ElMessage.success('删除成功')
            deleteDialogVisible.value = false
            addressToDelete.value = null
            await fetchAddressBook()
        } catch (error) {
            console.error('删除失败:', error)
            ElMessage.error('删除失败，请稍后重试')
        }
    }
}

// 取消删除
const cancelDelete = () => {
    deleteDialogVisible.value = false
    addressToDelete.value = null
}

// 设置默认地址
const setDefaultAddress = async (row: AddressBookRecord) => {
    try {
        await updateAddressBook({
            addressId: row.addressId,
            name: row.name,
            phone: row.phone,
            address: row.address,
            isDefault: 1
        })
        ElMessage.success('设置默认地址成功')
        await fetchAddressBook()
    } catch (error) {
        console.error('设置默认地址失败:', error)
        ElMessage.error('设置默认地址失败，请稍后重试')
    }
}

// 确认添加/编辑
const handleConfirm = async () => {
    if (!formRef.value) return
    
    try {
        await formRef.value.validate()
        
        if (isEditing.value) {
            // 更新现有地址
            await updateAddressBook({
                addressId: addressId.value,
                ...currentAddress.value
            })
            ElMessage.success('更新成功')
        } else {
            // 添加新地址
            await addAddressBook(currentAddress.value)
            ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
        await fetchAddressBook()
    } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败，请稍后重试')
    }
}

// 对话框标题
const dialogTitle = computed(() => {
    return isEditing.value ? '编辑地址' : '新增地址'
})

const handlePageChange = (page: number) => {
    currentPage.value = page
}
</script>

<style scoped>
.address-book {
    padding: 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #e9e9f3 100%);
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

.selection-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.selected-row {
    background-color: #e6f7ff !important;
}
</style>