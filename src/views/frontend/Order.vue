<template>
    <div class="container">
        <div class="address-box">
            <AddressForm :logo="sendLogo" />
            <AddressForm :logo="receiveLogo" />
        </div>
        <div class="info-box">
            <h3 class="title">物品信息</h3>
            <el-form 
                :model="goodsForm" 
                ref="goodsFormRef" 
                class="goods-form" 
                label-width="80px"
            >
                <el-form-item 
                    label="货物名称" 
                    prop="name"
                    class="address-form-item"
                >
                    <el-input 
                        v-model="goodsForm.name" 
                        placeholder="请输入货物名称" 
                        class="input-box" 
                        clearable
                    />
                </el-form-item>
                <el-form-item 
                    label="货物重量" 
                    prop="weight"
                    class="address-form-item"
                >
                    <el-input
                        v-model.number="goodsForm.weight"
                        placeholder="请输入货物重量"
                        class="input-box"
                        type="number"
                        min="0.1"
                        step="0.1"
                        @change="handleWeightChange"
                    >
                        <template #append>kg</template>
                    </el-input>
                </el-form-item>
                <el-form-item 
                    label="货物数量" 
                    prop="quantity"
                    class="address-form-item"
                >
                    <el-input
                        v-model.number="goodsForm.quantity"
                        placeholder="请输入货物数量"
                        class="input-box"
                        type="number"
                        min="1"
                        clearable
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="info-box">
            <h3 class="title">备注</h3>
            <el-input  type="textarea" placeholder="请输入备注"></el-input>
        </div>
        <el-button type="primary" :model="remark" style="position: absolute;bottom:20px;right:60px">去下单</el-button>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'

const goodsForm = reactive({
    name: '',
    weight: 0.1, // 设置默认值为0.1
    quantity: 1
})
const remark = ref('')

const sendLogo = {
    title: '寄',
    color: '#1A76F3'
}

const receiveLogo = {
    title: '收',
    color: 'rgba(121,187,255,1)'
}

const goodsFormRef = ref<FormInstance>()

const handleWeightChange = (value: number) => {
    // 确保重量不小于最小值
    if (value < 0.1) {
        goodsForm.weight = 0.1
    } else {
        goodsForm.weight = parseFloat(value.toFixed(1)) // 保留一位小数
    }
}
</script>

<style scoped>
.container {
    flex:1;
    margin-left: 25px;
    padding-top: 20px;
    box-sizing: border-box;
}

.address-box {
    display: flex;
    width: 100%;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
}

.info-box {
    padding: 20px;
    margin-top: 15px;
    width: 100%;
    border-radius: 10px;
    background-color: #fff;
}

.title {
    margin-bottom: 20px;
    font-weight: 500;
    color: #333;
}

.input-box {
    width: 300px;
}

.address-form-item {
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .address-box {
        flex-direction: column;
    }
    
    .input-box {
        width: 100%;
    }
}
</style>