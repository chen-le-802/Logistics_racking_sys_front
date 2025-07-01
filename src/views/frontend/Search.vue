<template>
    <div class="content">
        <TitleBox :title="title"></TitleBox>
        <div class="main-content">
            <div class="result-box">
                <div class="table">
                    <SearchTable />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'


const title = '运单查询'
const searchLoading = ref(false)



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
