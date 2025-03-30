<template>
  <div class="main-layout" :class="{ 'is-collapse': isCollapse }">
    <el-container>
      <el-aside width="220px" class="aside">
        <div class="logo">
          <!-- 添加 Logo 图片 -->
          <img src="@/assets/kubegale.png" alt="KubeGale Logo" class="logo-image" />
          <h2 v-if="!isCollapse">KubeGale</h2>
        </div>
        
        <!-- 添加用户信息到菜单顶部 -->
        <div class="user-profile">
          <el-avatar size="small">管</el-avatar>
          <span class="username" v-if="!isCollapse">管理员</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#1e1e1e"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :collapse="isCollapse"
          router
        >
          <!-- 仪表盘菜单项 -->
          <el-menu-item index="/dashboard">
            <el-icon><el-icon-odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          
          <!-- 系统管理菜单项 -->
          <el-sub-menu index="/system">
            <template #title>
              <el-icon><el-icon-setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/users">
              <el-icon><el-icon-user /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/system/roles">
              <el-icon><el-icon-key /></el-icon>
              <span>角色管理</span>
            </el-menu-item>
            <el-menu-item index="/system/permissions">
              <el-icon><el-icon-lock /></el-icon>
              <span>权限管理</span>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- CMDB配置管理菜单项 -->
          <el-menu-item index="/cmdb">
            <el-icon><el-icon-files /></el-icon>
            <span>CMDB配置管理</span>
          </el-menu-item>
          
          <!-- Kubernetes管理菜单项 -->
          <el-menu-item index="/kubernetes">
            <el-icon><el-icon-connection /></el-icon>
            <span>Kubernetes管理</span>
          </el-menu-item>
          
          <!-- Prometheus监控菜单项 -->
          <el-menu-item index="/prometheus">
            <el-icon><el-icon-data-line /></el-icon>
            <span>Prometheus监控</span>
          </el-menu-item>
          
          <!-- CICD管理菜单项 -->
          <el-menu-item index="/cicd">
            <el-icon><el-icon-finished /></el-icon>
            <span>CICD管理</span>
          </el-menu-item>
          
          <!-- 退出登录菜单项 -->
          <el-menu-item @click="handleLogout" class="logout-item">
            <el-icon><el-icon-switch-button /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleSidebar">
              <el-icon-fold v-if="!isCollapse" />
              <el-icon-expand v-else />
            </el-icon>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="action-icon">
                <el-icon><el-icon-setting /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="password">修改密码</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 添加面包屑导航 -->
        <Breadcrumb :class="{ collapsed: isCollapse }" />
        
        <el-main :class="{ collapsed: isCollapse }">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 使用密码对话框组件 -->
    <PasswordDialog 
      v-model:visible="passwordDialogVisible"
      :loading="passwordLoading"
      @submit="submitChangePassword"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { logout } from '@/api/user'
import { removeToken } from '@/utils/auth'
// 导入修改密码相关功能
import { usePasswordDialog } from '@/api/system/usePasswordDialog'
// 导入组件
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
// 修改导入路径
import PasswordDialog from '@/pages/system/PasswordDialog.vue'
// 导入需要的图标组件
import {
  Odometer as ElIconOdometer,
  Setting as ElIconSetting,
  Files as ElIconFiles,
  Connection as ElIconConnection,
  DataLine as ElIconDataLine,
  Finished as ElIconFinished,
  Fold as ElIconFold,
  Expand as ElIconExpand,
  ArrowDown as ElIconArrowDown,
  User as ElIconUser,
  Key as ElIconKey,
  Lock as ElIconLock,
  SwitchButton as ElIconSwitchButton
} from '@element-plus/icons-vue'

// 初始化修改密码相关功能
const {
  passwordDialogVisible,
  passwordLoading,
  openPasswordDialog,
  submitChangePassword
} = usePasswordDialog()

const isCollapse = ref(false)
const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  return route.path
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'profile') {
    // 处理个人信息
    ElMessage.info('个人信息功能开发中')
  } else if (command === 'password') {
    // 修改为调用修改密码对话框
    openPasswordDialog()
  }
}

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用退出登录API
      const res = await logout()
      console.log('退出登录响应:', res)
      
      // 清除token
      removeToken()
      
      // 清除localStorage中的用户信息
      localStorage.removeItem('userInfo')
      
      // 提示用户
      ElMessage.success('退出登录成功')
      
      // 跳转到登录页
      router.push('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      ElMessage.error('退出登录失败，请重试')
    }
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style lang="scss" scoped>
@import './MainLayout.scss';
</style>


