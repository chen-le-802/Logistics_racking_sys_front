// @/router/frontRoutes.ts
import type { RouteRecordRaw } from 'vue-router'

const frontRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/frontend/HomeView.vue')
  },
]

export default frontRoutes