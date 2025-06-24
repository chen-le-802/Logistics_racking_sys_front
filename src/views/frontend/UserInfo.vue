<template>
    <div class="content">
        <TitleBox :title="title"></TitleBox>
        <div class="main-content">
            <div class="avatar"></div>
            
            <!-- 展示模式 -->
            <div v-if="!isEditing" class="info-display">
                <div class="info-item">
                    <span class="label">手机号码：</span>
                    <span class="value">{{ userInfo.phone || '未填写' }}</span>
                </div>
                <div class="info-item">
                    <span class="label">性别：</span>
                    <span class="value">{{ displayGender }}</span>
                </div>
                <el-button class="info-item" style="width:100px;" @click="showAddressBookModal">我的地址簿</el-button>
                <div style="margin-top:20px">
                    <el-button type="primary" @click="startEditing" style="width:100px;align-self: center;margin-top: 30px;margin-right: 30px;">修改信息</el-button>
                    <el-button type="danger" @click="confirmExitLogin" style="width:100px;align-self: center;margin-top: 30px;">退出登录</el-button>
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
                    label="性别" 
                    prop="gender"
                    class="form-item"
                >
                    <el-radio-group v-model="userInfo.gender">
                        <el-radio :label="1">男</el-radio>
                        <el-radio :label="2">女</el-radio>
                    </el-radio-group>
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
        <el-dialog v-model="modalVisible"   width="1000px" style="height: 600px;" center>
            <h2 style="margin-bottom: 20px;color:black">我的地址簿</h2>
            <AddressBook></AddressBook>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue';

const title = '我的信息';
const isEditing = ref(false);
const userInfoForm = ref();

const userInfo = reactive({
    phone: '13800138000',
    gender: 1
});

const displayGender = computed(() => {
    return userInfo.gender === 1 ? '男' : '女';
});

// 确认对话框状态
const confirmDialog = reactive({
    visible: false,
    title: '',
    content: '',
    action: '' as 'exit' | 'save' | ''
});

const startEditing = () => {
    isEditing.value = true;
};
const modalVisible = ref(false)

const cancelEditing = () => {
    isEditing.value = false;
};

const confirmExitLogin = () => {
    confirmDialog.title = '确认退出';
    confirmDialog.content = '确定要退出登录吗？';
    confirmDialog.action = 'exit';
    confirmDialog.visible = true;
};

const exitLogin = () => {
    localStorage.removeItem('token');
    // 可跳转到登录页
    // window.location.href = '/login';
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
const showAddressBookModal = () => {
    modalVisible.value = true
}
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