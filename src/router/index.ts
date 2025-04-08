import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { getToken } from '@/utils/auth' // 导入获取token的方法

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../pages/dashboard/index.vue'),
        meta: { title: '仪表盘' }
      },
      // 保留系统管理模块，但只保留用户管理页面
      {
        path: 'system',
        name: 'System',
        redirect: '/system/users',
        meta: { title: '系统管理' },
        children: [
          {
            path: 'users',
            name: 'Users',
            component: () => import('../pages/system/users.vue'),
            meta: { title: '用户管理' }
          }
          // 移除其他不存在的页面路由
        ]
      }
      // 移除其他不存在的模块路由
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  },
  {
    path: '/404',
    component: () => import('../pages/error-page/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 白名单：不需要登录就可以访问的路由
const whiteList = ['/login', '/404']

// 路由拦截
router.beforeEach((to, from, next) => {
  // 获取token
  const hasToken = getToken()
  // 判断是否有token
  if (hasToken) {
    // 已登录状态下访问登录页，重定向到首页
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 已登录，允许访问
      next()
    }
  } else {
    // 未登录状态
    if (whiteList.includes(to.path)) {
      // 在白名单中，允许访问
      next()
    } else {
      // 不在白名单中，重定向到登录页
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
