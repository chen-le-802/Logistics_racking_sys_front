// @/router/frontRoutes.ts
import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: Array<RouteRecordRaw> = [
    {
        path: '/admin',
        name: 'admin',
        component: () => import('@/views/admin/HomeView.vue'),
        children: [
            {
                path: '/', // 空路径，匹配 /
                redirect: '/admin/board' 
            },
            {
                path: '/admin/board',
                name:'board',
                component:()=>import('@/views/admin/Board.vue')
            },
            {
                path: '/admin/order-list',
                name:'order-list',
                component:()=>import('@/views/admin/OrderList.vue')
            },
            {
                path: '/admin/user-manage',
                name:'user-manage',
                component:()=>import('@/views/admin/UserManage.vue')
            },
            {
                path: '/admin/delivery-manage',
                name:'deivery-manage',
                component:()=>import('@/views/admin/DeliveryManage.vue')
            },
            {
                path: '/admin/user-info',
                name:'admin-user-info',
                component:()=>import('@/views/frontend/UserInfo.vue')
            }

        ]
  },
]

export default adminRoutes