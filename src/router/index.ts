import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import frontRoutes from './modules/frontend'
import adminRoutes from './modules/admin'

const routes:Array<RouteRecordRaw> = [
  ...frontRoutes,
  ...adminRoutes
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
export default router
