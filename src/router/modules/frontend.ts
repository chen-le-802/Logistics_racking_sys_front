// @/router/frontRoutes.ts
import type { RouteRecordRaw } from 'vue-router'

const frontRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/frontend/HomeView.vue'),
    children:[
      {
        path: '', // 空路径，匹配 /
        redirect: '/search' // 重定向到/search
      },
      {
       path: 'search',
       name: 'search',
      component: () => import('@/views/frontend/Search.vue')
      },
      {
       path: 'order',
       name: 'order',
      component: () => import('@/views/frontend/Order.vue')
      },
      {
        path:'user-info',
        name:'user-info',
        component:()=>import('@/views/frontend/UserInfo.vue')
      }
  ]
  },
]

export default frontRoutes