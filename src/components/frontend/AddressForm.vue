<template>
    <div class="send">
        <div class="title">
            <div class="logo" :style="{backgroundColor: logo.color}">{{ logo.title }}</div>
            <el-button class="addressBook" @click="showAddressBookModal">地址簿</el-button>
        </div>
        <el-form :model="addressForm" ref="addressForm" class="address-form">
            <template v-for="item in formItems" :key="item.prop">
                <el-form-item :prop="item.prop" class="address-form-item">
                    <label class="form-label">{{ item.label }}</label>
                    <el-input
                        v-model="addressForm[item.prop]"
                        :placeholder="item.placeholder"
                        :readonly="readonly[item.prop]"
                        @focus="removeReadonly(item.prop)"
                        class="elInput"
                    />
                </el-form-item>
            </template>
        </el-form>
        <el-dialog v-model="modalVisible"   width="1000px" style="height: 600px;" center>
            <h2 style="margin-bottom: 20px;color:black">我的地址簿</h2>
            <AddressBook></AddressBook>
        </el-dialog>
    </div>
    
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import AddressBook from './AddressBook.vue';
defineProps<{
  logo: {
    title: string;
    color: string;
  }
}>();
const modalVisible = ref(false)
const showAddressBookModal = () => {
    modalVisible.value = true
}
const addressForm = reactive({
    name: '',
    phone: '',
    province: '',
    detail: ''
});
const readonly = reactive({
    name: true,
    phone: true,
    province: true,
    detail: true
});

type AddressFormKeys = keyof typeof addressForm;

interface FormItem {
    prop: AddressFormKeys;
    label: string;
    placeholder: string;
}
const formItems: FormItem[] = [
    { prop: 'name', label: '姓名', placeholder: '请填写真实姓名' },
    { prop: 'phone', label: '联系方式', placeholder: '请填写联系方式' },
    { prop: 'province', label: '省市区', placeholder: '请选择省市区' },
    { prop: 'detail', label: '详细地址', placeholder: '请填写详细地址（例如xx街xx号）' }
];

function removeReadonly(field: keyof typeof readonly) {
    readonly[field] = false;
}
</script>

<style lang="css" scoped>
.send,
.receive {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 520px;
    background-color: #fff;
    border-radius: 10px;
    padding: 20px;
}
.send .title {
    display: flex;
    width: 100%;
    justify-content: space-between;
}
.logo {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    color: #fff;
}
.address-form {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    margin-top: 15px;
}
.address-form-item {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 25px;
}
.form-label {
    margin-right: 10px;
    min-width: 70px;
    text-align: right;
}
.elInput {
    width: 380px;
}
</style>