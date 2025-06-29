<template>
    <div class="container">
        <div class="address-box">
            <AddressForm ref="senderForm" :logo="sendLogo" title="寄件人信息" />
            <AddressForm ref="receiverForm" :logo="receiveLogo" title="收件人信息" />
        </div>
        <div class="info-box">
            <h3 class="title">物品信息</h3>
            <el-form 
                :model="goodsForm" 
                ref="goodsFormRef" 
                :rules="goodsRules"
                class="goods-form" 
                label-width="80px"
            >
                <el-form-item 
                    label="货物类型" 
                    prop="type"
                    class="address-form-item"
                    required
                >
                    <el-select 
                        v-model="goodsForm.type" 
                        placeholder="请选择货物类型" 
                        class="input-box" 
                        clearable
                    >
                        <el-option label="文件" :value="1" />
                        <el-option label="包裹" :value="2" />
                        <el-option label="大件" :value="3" />
                    </el-select>
                </el-form-item>
                <el-form-item 
                    label="货物重量" 
                    prop="weight"
                    class="address-form-item"
                    required
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
            </el-form>
        </div>
        <div class="info-box">
            <h3 class="title">备注</h3>
            <el-input 
                v-model="remark"
                type="textarea" 
                placeholder="请输入备注（如：易碎品、特殊配送时间等）"
                :autosize="{ minRows: 3 }"
            ></el-input>
            <el-button 
            type="primary" 
            style="margin: 10px auto;align-self: flex-end;"
            @click="handleSubmit"
        >
            去下单
        </el-button>
        </div>
       
        <el-dialog v-model="confirmModalVisible" width="800px" margin-top="300px">
    <template #title>订单确认</template>
    <div v-if="orderData">
        <el-descriptions title="寄件人信息" :column="1" border>
            <el-descriptions-item label="姓名">{{ orderData.sender.name }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ orderData.sender.phone }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ orderData.sender.address }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="收件人信息" :column="1" border style="margin-top:16px;">
            <el-descriptions-item label="姓名">{{ orderData.receiver.name }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ orderData.receiver.phone }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ orderData.receiver.address }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="物品信息" :column="1" border style="margin-top:16px;">
            <el-descriptions-item label="类型">
                {{ goodsTypeLabel(orderData.goods.type) }}
            </el-descriptions-item>
            <el-descriptions-item label="重量">{{ orderData.goods.weight }} kg</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="备注" :column="1" border style="margin-top:16px;">
            <el-descriptions-item>{{ orderData.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
    </div>
    <template #footer>
        <div style="display: flex; justify-content: center;">
        价格：{{ fee }}元
        <el-button type="primary" style="margin:0 20px;" @click="submitOrder">确认下单</el-button>
        <el-button @click="confirmModalVisible = false">关闭</el-button>
    </div>
    </template>
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
                    <el-descriptions-item label="订单号">{{ orderId }}</el-descriptions-item>
                    <el-descriptions-item label="金额">
                        <span class="payment-amount">¥{{ fee.toFixed(2) }}</span>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
            
            <div class="payment-methods">
                <h3>选择支付方式</h3>
                <el-radio-group v-model="paymentMethod">
                    <el-radio label="wechat" border>
                        <img src="" alt="微信支付" class="payment-icon">
                        微信支付
                    </el-radio>
                    <el-radio label="alipay" border>
                        <img src="" alt="支付宝" class="payment-icon">
                        支付宝
                    </el-radio>
                </el-radio-group>
            </div>
            
            <div class="payment-tips" v-if="paymentStatus === 'pending'">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在生成支付二维码...</span>
            </div>
            
            <div class="payment-qrcode" v-if="paymentStatus === 'ready'">
                <img :src="qrcodeUrl" alt="支付二维码" class="qrcode-image">
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
                    type="primary" 
                    @click="handleConfirmPayment"
                    :loading="paymentStatus === 'processing'"
                >
                    我已支付
                </el-button>
            </div>
        </template>
    </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { orderApi } from '@/apis/modules'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { load } from '@amap/amap-jsapi-loader'

const goodsForm = reactive({
    type: null, // 货物类型：1-文件，2-包裹，3-大件
    weight: 0.1 // 设置默认值为0.1
})

const fee= ref(0)
const senderForm = ref()
const receiverForm = ref()
const goodsRules = {
    type: [
        { required: true, message: '请选择货物类型', trigger: 'change' }
    ],
    weight: [
        { required: true, message: '请输入货物重量', trigger: 'blur' },
        { type: 'number', min: 0.1, message: '重量不能小于0.1kg', trigger: 'blur' }
    ]
}

const remark = ref('')
const confirmModalVisible = ref(false)
const orderData = ref<any>(null)

// 支付相关状态
const payModalVisible = ref(false)
type PaymentStatus = 'pending' | 'ready' | 'processing' | 'success' | 'failed'
const paymentMethod = ref<'wechat' | 'alipay'>('wechat')
const paymentStatus = ref<PaymentStatus>('pending')
const qrcodeUrl = ref('')
const orderId = ref('')
const paymentTimer = ref<ReturnType<typeof setInterval> | null>(null)

const sendLogo = {
    title: '寄',
    color: '#1A76F3'
}

const receiveLogo = {
    title: '收',
    color: 'rgba(121,187,255,1)'
}
const goodsFormRef = ref<FormInstance>()
const router = useRouter()


const handleWeightChange = (value: number) => {
    if (value < 0.1) {
        goodsForm.weight = 0.1
    } else {
        goodsForm.weight = parseFloat(value.toFixed(1))
    }
}

const goodsTypeLabel = (type: number) => {
    switch (type) {
        case 1: return '文件'
        case 2: return '包裹'
        case 3: return '大件'
        default: return ''
    }
}

const handleSubmit = async () => {
    // 验证所有表单
    const [goodsValid, senderValid, receiverValid] = await Promise.all([
        goodsFormRef.value?.validate(),
        senderForm.value?.validate(),
        receiverForm.value?.validate()
    ])
    
    if (!goodsValid || !senderValid || !receiverValid) return

    // 获取表单数据并按照后端要求格式组织
    const senderData = senderForm.value.getFormData()
    const receiverData = receiverForm.value.getFormData()
    
    orderData.value = {
        sender: {
            name: senderData.name,
            phone: senderData.phone,
            address: senderData.address
        },
        receiver: {
            name: receiverData.name,
            phone: receiverData.phone,
            address: receiverData.address
        },
        goods: {
            type: goodsForm.type,
            weight: goodsForm.weight
        },
        remark: remark.value
    }
    confirmModalVisible.value = true
}

// 提交订单
const submitOrder = async () => {
    try {
        const body = {
            senderName: orderData.value.sender.name,
            senderPhone: orderData.value.sender.phone,
            senderAddr: orderData.value.sender.address,
            receiverName: orderData.value.receiver.name,
            receiverPhone: orderData.value.receiver.phone,
            receiverAddr: orderData.value.receiver.address,
            weight: orderData.value.goods.weight,
            type: orderData.value.goods.type
        }
        
        const response = await orderApi.addOrder(body)
        fee.value = response.fee
        orderId.value = String(response.orderId)
        
        confirmModalVisible.value = false
        payModalVisible.value = true
        startPaymentProcess()
        
    } catch (error) {
        ElMessage.error('下单失败，请重试')
        console.error('下单失败:', error)
    }
}
// 开始支付流程
const startPaymentProcess = () => {
    paymentStatus.value = 'pending'
    
    // 模拟生成支付二维码的过程
    setTimeout(() => {
        qrcodeUrl.value = paymentMethod.value === 'wechat' 
            ? 'https://example.com/wechat-qrcode' 
            : 'https://example.com/alipay-qrcode'
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
    }, 3000)
}

const changePayStatu = async () => {
    await orderApi.changePayStatus(BigInt(orderId.value),1)
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
    router.push('/order')
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
    display: flex;
    flex-direction: column;
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
    style .input-box {
        width: 100%;
    }
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
</style>
