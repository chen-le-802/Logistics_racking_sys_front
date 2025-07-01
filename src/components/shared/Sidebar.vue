<template>
    <div class="sidebar" :class="theme">
        <div class="menu">
            <ul>
                <li
                    v-for="item in navList"
                    :key="item.path"
                    :class="{ active: $route.path === item.path }"
                    @click="$router.push(item.path)"
                >
                    <el-icon style="width:15px;margin-right: 15px;">
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
import { Search, Position, User, PieChart,Tickets  } from '@element-plus/icons-vue'
import { defineProps,ref } from 'vue'


const props = defineProps<{
    navList: Array<{
        lable: string,
        path: string,
        icon: string
    }>,
    theme:string
}>()

const icons: Record<string, any> = {
    Search,
    Position,
    User,
    PieChart,
    Tickets 
}
</script>

<style scoped lang="css">
.sidebar{
    width:275px;
    height: calc(100vh - 60px);
    overflow: auto;
    font-weight: 500;
    background-color: #fff;
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
    width:100%;
    margin-top: 30px;
}
.sidebar .menu ul li{
    display: flex;
    align-items: center;
    justify-content:flex-start;
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