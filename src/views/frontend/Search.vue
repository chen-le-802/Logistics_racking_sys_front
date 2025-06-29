<template>
    <div class="content">
        <TitleBox :title="title"></TitleBox>
        <div class="main-content">
            <div class="search-box">
                <el-input
                    v-model="trackingNumber"
                    style="width: 100%;height:100%"
                    placeholder="请输入运单号查询"
                    @keyup.enter="handleSearch"
                />
                <el-button 
                    style="width:170px;margin-left:20px;height:100%;background-color: #1A76F3;color:#fff"
                    @click="handleSearch"
                >
                    查询
                </el-button>
                <el-button @click="handleClear" style="height:100%">重置</el-button>
            </div>
            <div class="result-box">
                <div class="table">
                    <SearchTable 
                        ref="searchTableRef"
                        :tracking-number="trackingNumber"
                        @search-complete="handleSearchComplete"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const trackingNumber = ref('')
const title = '运单查询'
const searchLoading = ref(false)
const searchTableRef = ref()

// 处理搜索
const handleSearch = () => {
    if (!trackingNumber.value.trim()) {
        return
    }
    searchLoading.value = true
    // 调用子组件的搜索方法
    searchTableRef.value?.searchByTrackingNumber(trackingNumber.value)
}

// 处理搜索完成
const handleSearchComplete = (success: boolean) => {
    searchLoading.value = false
    if (!success) {
        // 可以在这里添加错误提示
    }
}
const handleClear = () => {
    searchLoading.value = true
    searchTableRef.value?.fetchOrderList()
}
</script>

<style scoped lang="css">
.content {
    flex: 1;
    margin-left: 25px;
}

.main-content {
    height: 640px;
    margin-top: 25px;
    background-color: #fff;
    border-radius: 10px;
    overflow: auto;
    /* 隐藏滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
}

.main-content::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.search-box {
    display: flex;
    padding: 20px;
    margin-top: 10px;
    height: 80px;
}

.result-box {
    height: 300px;
    padding: 20px;
    padding-top: 0px;
}

.table {
    margin-top: 30px;
}
</style>
