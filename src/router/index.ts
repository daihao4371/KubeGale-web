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
      {
        path: 'cmdb',
        name: 'CMDB',
        component: () => import('../pages/cmdb/index.vue'),
        meta: { title: 'CMDB配置管理' }
      },
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
          {
            path: 'roles',
            name: 'Roles',
            component: () => import('../pages/system/roles.vue'),
            meta: { title: '角色管理' }
          },
          {
            path: 'permissions',
            name: 'Permissions',
            component: () => import('../pages/system/permissions.vue'),
            meta: { title: '权限管理' }
          }
        ]
      },
      {
        path: 'kubernetes',
        name: 'Kubernetes',
        component: () => import('../pages/kubernetes/index.vue'),
        meta: { title: 'Kubernetes管理' }
      },
      {
        path: 'prometheus',
        name: 'Prometheus',
        component: () => import('../pages/prometheus/index.vue'),
        meta: { title: 'Prometheus监控' }
      },
      {
        path: 'cicd',
        name: 'CICD',
        component: () => import('../pages/cicd/index.vue'),
        meta: { title: 'CICD管理' }
      }
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
