<template>
    <div class="content">
        <TitleBox :title="title"></TitleBox>
        <div class="main-content">
            <div class="avatar"></div>
            
            <!-- 展示模式 -->
            <div v-if="!isEditing" class="info-display">
                <div class="info-item">
                    <span class="label">姓名：</span>
                    <span class="value">{{ userInfo.name || '未填写' }}</span>
                </div>
                <div class="info-item">
                    <span class="label">手机号码：</span>
                    <span class="value">{{ userInfo.phone || '未填写' }}</span>
                </div>
                <div class="info-item">
                    <span class="label">邮箱：</span>
                    <span class="value">{{ userInfo.email || '未填写' }}</span>
                </div>
                <div class="info-item">
                    <span class="label">角色：</span>
                    <span class="value">{{ displayRole }}</span>
                </div>
                <div style="margin-top:20px; display: flex; flex-direction: column; align-items: center;">
                    <div style="display: flex; justify-content: center;">
                        <el-button type="primary" @click="startEditing" style="width:100px; margin: 30px 30px 0 0;">修改信息</el-button>
                        <el-button @click="openAddressDialog" style="width:100px; margin: 30px 0 0 0;">地址簿</el-button>
                    </div>
                    <el-button type="danger" @click="confirmExitLogin" style="width:100px; margin: 30px 0 0 0;">退出登录</el-button>
                </div>
            </div>
            
            <!-- 编辑模式 -->
            <el-form 
                v-else
                :model="userInfo" 
                ref="userInfoForm" 
                class="user-form" 
                label-width="80px"
            >
                <el-form-item 
                    label="姓名" 
                    prop="name"
                    class="form-item"
                >
                    <el-input 
                        v-model="userInfo.name" 
                        placeholder="请输入姓名" 
                        class="input-box" 
                        clearable
                    />
                </el-form-item>
                
                <el-form-item 
                    label="手机号码" 
                    prop="phone"
                    class="form-item"
                >
                    <el-input 
                        v-model="userInfo.phone" 
                        placeholder="请输入手机号码" 
                        class="input-box" 
                        clearable
                    />
                </el-form-item>
                
                <el-form-item 
                    label="邮箱" 
                    prop="email"
                    class="form-item"
                >
                    <el-input 
                        v-model="userInfo.email" 
                        placeholder="请输入邮箱" 
                        class="input-box" 
                        clearable
                    />
                </el-form-item>
                
                <el-form-item class="form-actions">
                    <el-button @click="cancelEditing" style="margin-right: 30px;">取消</el-button>
                    <el-button type="primary" @click="confirmSaveInfo">保存</el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 确认对话框 -->
        <el-dialog v-model="confirmDialog.visible" :title="confirmDialog.title" width="300px" center style="margin-top: 300px;">
            <span>{{ confirmDialog.content }}</span>
            <template #footer>
                <el-button @click="confirmDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="handleConfirmDialog">确定</el-button>
            </template>
        </el-dialog>
        <!-- 地址簿Dialog -->
        <el-dialog v-model="addressDialogVisible" title="地址簿" width="80%" center>
            <AddressBook />
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from 'vue';
import {userApi} from '@/apis/modules'
import AddressForm from '@/components/frontend/AddressForm.vue'

const title = '我的信息';
const isEditing = ref(false);
const userInfoForm = ref();
const userRole = ref('user')

const userInfo = reactive({
    name: '',
    phone: '',
    email: '',
    gender: 1,
    role: 0
});

const getUserRole = () => {
    userRole.value = localStorage.getItem('userRole') || 'user'
}

const displayRole = computed(() => {
    return userInfo.role === 1 ? '快递员' : '普通用户';
});

// 确认对话框状态
const confirmDialog = reactive({
    visible: false,
    title: '',
    content: '',
    action: '' as 'exit' | 'save' | ''
});

const addressDialogVisible = ref(false)

const startEditing = () => {
    isEditing.value = true;
};

const cancelEditing = () => {
    isEditing.value = false;
};

const confirmExitLogin = () => {
    confirmDialog.title = '确认退出';
    confirmDialog.content = '确定要退出登录吗？';
    confirmDialog.action = 'exit';
    confirmDialog.visible = true;
};

const exitLogin = async () => {
    await userApi.logout(localStorage.getItem('token') || '');
    localStorage.removeItem('token');
    window.location.reload()
    
};

const confirmSaveInfo = () => {
    confirmDialog.title = '确认保存';
    confirmDialog.content = '确定要保存修改的信息吗？';
    confirmDialog.action = 'save';
    confirmDialog.visible = true;
};

const saveInfo = () => {
    // 这里可以添加表单验证和保存逻辑
    console.log('保存信息:', userInfo);
    isEditing.value = false;
};

const handleConfirmDialog = () => {
    if (confirmDialog.action === 'exit') {
        exitLogin();
    } else if (confirmDialog.action === 'save') {
        saveInfo();
    }
    confirmDialog.visible = false;
};

const openAddressDialog = () => {
    addressDialogVisible.value = true;
}

const fetchUserInfo = async () => {
    const response = await userApi.getUserInfo();

        Object.assign(userInfo, response);
};

onMounted(() => {
    getUserRole();
    fetchUserInfo();
});
</script>

<style lang="css" scoped>
.content {
    flex: 1;
    margin-left: 25px;
}

.main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
    width: 100%;
    padding: 100px 300px;
    min-height:650px;
    border-radius: 10px;
    background-color: #fff;
}

.avatar {
    width: 70px;
    height: 70px;
    margin-bottom: 20px;
    border-radius: 50%;
    border: 1px solid #f5f5f5;
    background-image: url("../../assets/images/common/logo.png");
    background-repeat: no-repeat;
    background-size: contain;
}

.info-display {
    width:50%;
    margin: 0 auto;
    
}

.info-item {
    margin-top: 30px;
    font-size: 16px;
}

.label {
    color: #666;
    margin-right: 10px;
}

.value {
    color: #333;
    font-weight: 500;
}

.user-form {
    width: 100%;
    max-width: 400px;
}

.form-item {
    margin-top:30px
}

.form-actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.input-box {
    width: 100%;
}
</style>
