<template>
    <div class="sidebar">
        <div class="menu">
            <ul>
                <li
                    v-for="item in navList"
                    :key="item.path"
                    :class="{ active: $route.path === item.path }"
                    @click="$router.push(item.path)"
                >
                    <el-icon style="width:15px">
                        <component :is="icons[item.icon]" />
                    </el-icon>
                    {{ item.lable }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ElIcon } from 'element-plus'
import { Search, Position, User } from '@element-plus/icons-vue'
import { defineProps } from 'vue'

const props = defineProps<{
    navList: Array<{
        lable: string,
        path: string,
        icon: string
    }>
}>()

const icons: Record<string, any> = {
    Search,
    Position,
    User
}
</script>

<style scoped lang="css">
.sidebar{
    width:275px;
    height: calc(100vh - 60px);
    overflow: auto;
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