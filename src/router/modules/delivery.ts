// @/router/frontRoutes.ts
import type { RouteRecordRaw } from 'vue-router'

const deliveryRoutes: Array<RouteRecordRaw> = [
    {
        path: '/delivery',
        name: 'delivery',
        component: () => import('@/views/delivery/HomeView.vue'),
        children: [
            {
                path: '', // 空路径，匹配 /
                redirect: '/delivery/board' 
            },
            {
                path: '/delivery/board',
                name:'board',
                component:()=>import('@/views/delivery/Board.vue')
            },
            {
                path: '/delivery/order-list',
                name:'order-list',
                component:()=>import('@/views/delivery/OrderList.vue')
            },
            {
                path: '/delivery/my-orders',
                name:'my-orders',
                component:()=>import('@/views/delivery/MyOrders.vue')
            },
            {
                path: '/delivery/user-info',
                name:'delivery-user-info',
                component:()=>import('@/views/frontend/UserInfo.vue')
            }

        ]
  },
]

export default deliveryRoutes