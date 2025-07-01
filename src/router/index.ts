import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import frontRoutes from './modules/frontend'
import deliveryRoutes from './modules/delivery'

const routes:Array<RouteRecordRaw> = [
  ...frontRoutes,
  ...deliveryRoutes
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
export default router
