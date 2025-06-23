<template>
    <div class="sidebar">
        <div class="menu">
            <ul>
                <li
                    :class="{ active: activeIndex === 0 }"
                    @click="activeIndex = 0"
                ><el-icon><Search /></el-icon>运单查询</li>
                <li
                    :class="{ active: activeIndex === 1 }"
                    @click="activeIndex = 1"
                ><el-icon><Position /></el-icon>我要寄件</li>
                <li
                    :class="{ active: activeIndex === 2 }"
                    @click="activeIndex = 2"
                ><el-icon><User /></el-icon>我的资料</li>
            </ul>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { ElIcon } from 'element-plus';
import { Search, Position, User } from '@element-plus/icons-vue';

const activeIndex = ref(0);
</script>
<style scoped lang="css">
.sidebar{
    width:275px;
    height: calc(100vh - 60px);
    background-color: #fff;
    font-weight: 500;
}
.sidebar .menu {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 20px;
    border-top: 1px solid #e8e8e8;
}
.sidebar .menu ul {
    width:100px;
    margin-top: 30px;
}
.sidebar .menu ul li{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 50px;
    line-height: 50px;
    cursor: pointer;
}
.sidebar .menu ul li:hover {
    color: #1A76F3;
}
.active {
    color: #1A76F3;
}
</style>