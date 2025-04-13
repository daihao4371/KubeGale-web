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
          },
          // 修正角色管理页面路由的组件路径
          {
            path: 'roles',
            name: 'Roles',
            component: () => import('../pages/system/roles/RoleManagement.vue'),
            meta: { title: '角色管理' }
          },
          // 添加菜单管理页面路由
          {
            path: 'menus',
            name: 'Menus',
            component: () => import('../pages/system/menus/MenuManagement.vue'),
            meta: { title: '菜单管理' }
          },
          // 添加 API 管理页面路由
          {
            path: 'api',
            name: 'Api',
            component: () => import('../pages/system/api/api.vue'),
            meta: { title: 'API管理' }
          },
          // 添加操作记录页面路由
          {
            path: 'operation-logs',
            name: 'OperationLogs',
            component: () => import('../pages/system/operationRecord/operationRecord.vue'),
            meta: { title: '操作记录' }
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
