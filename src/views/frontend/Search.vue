<template>
    <div class="content">
        <TitleBox :title="title"></TitleBox>
        <div class="main-content">
            <div class="search-box">
                <el-input
                    v-model="input"
                    style="width: 100%;height:100%"
                    placeholder="请输入运单号查询"
                />
                <el-button style="width:170px;margin-left:20px;height:100%;background-color: #1A76F3;color:#fff">查询</el-button>
            </div>
            <div class="result-box">
                <nav class="nav">
                    <div :class="{ active: selected === 'send' }" @click="selectNav('send')">我寄的</div>
                    <div :class="{ active: selected === 'receive' }" @click="selectNav('receive')">我收的</div>
                </nav>
                <div class="table">
                    <SearchTable></SearchTable>
                    <!-- <MapContainner></MapContainner> -->
                </div>
            </div>
        </div>
    </div>
    
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const input = ref('')
const selected = ref('send')
const title='运单查询'

function selectNav(type: 'send' | 'receive') {
    selected.value = type
}
</script>
<style scoped lang="css">
.content{
    flex:1;
    margin-left: 25px;
}

.main-content{
    height: 640px;
    margin-top: 25px;
    background-color: #fff;
    border-radius:10px;
    overflow: auto;
    /* 隐藏滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
}
.main-content::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}
.search-box{
    display: flex;
    padding:20px;
    margin-top: 10px;
    height: 80px;
}
.result-box{
    height: 300px;
    padding:20px;

}
.result-box .nav{
    display: flex;
    width:100%;
    border-bottom: 1px solid #EBEDEE;
    font-size:18px;
}
.result-box .nav div{
    margin-right: 60px;
    cursor:pointer;
}
.active{
    color:#1A76F3;
    border-bottom: 2px solid #1A76F3;
}
.table{
    margin-top: 30px;
}
</style>