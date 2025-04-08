<template>
  <div class="main-layout" :class="{ 'is-collapse': isCollapse }">
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
        <div class="logo">
          <!-- Logo 图片 -->
          <img src="@/assets/kubegale.png" alt="KubeGale Logo" class="logo-image" />
          <!-- 只在非折叠状态显示文字 -->
          <h2 v-show="!isCollapse">KubeGale</h2>
        </div>
        
        <!-- 添加用户信息到菜单顶部 -->
        <div class="user-profile">
          <el-avatar size="small">管</el-avatar>
          <span class="username" v-if="!isCollapse">管理员</span>
        </div>
        
        <!-- 其余部分保持不变 -->
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
            <!-- 调整菜单管理位置到角色管理前面 -->
            <el-menu-item index="/system/menus">
              <el-icon><el-icon-menu /></el-icon>
              <span>菜单管理</span>
            </el-menu-item>
            <el-menu-item index="/system/roles">
              <el-icon><el-icon-key /></el-icon>
              <span>角色管理</span>
            </el-menu-item>
            <el-menu-item index="/system/permissions">
              <el-icon><el-icon-lock /></el-icon>
              <span>权限管理</span>
            </el-menu-item>
            <!-- 添加操作记录菜单项 -->
            <el-menu-item index="/system/operation-logs">
              <el-icon><el-icon-document /></el-icon>
              <span>操作记录</span>
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
        
        <!-- 添加面包屑导航，并在其中添加折叠按钮 -->
        <Breadcrumb :class="{ collapsed: isCollapse }">
          <!-- 在面包屑组件内添加折叠按钮插槽 -->
          <template #prefix>
            <el-icon class="collapse-btn" @click="toggleSidebar">
              <el-icon-fold v-if="!isCollapse" />
              <el-icon-expand v-else />
            </el-icon>
          </template>
        </Breadcrumb>
        
        <el-main :class="{ collapsed: isCollapse }">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 使用密码对话框组件 -->
    <PasswordDialog 
      v-model:visible="passwordDialogVisible"
      :loading="passwordLoading"
    />
  </div>
</template>

<script lang="ts" setup>
// 导入组件
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
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
  Menu as ElIconMenu,
  SwitchButton as ElIconSwitchButton,
  Document as ElIconDocument  // 添加文档图标用于操作记录
} from '@element-plus/icons-vue'

// 导入拆分出去的逻辑
import { useMainLayout } from './useMainLayout'

// 使用拆分出去的逻辑
const {
  isCollapse,
  activeMenu,
  passwordDialogVisible,
  passwordLoading,
  toggleSidebar,
  handleCommand,
  handleLogout,
} = useMainLayout()
</script>

<style lang="scss" scoped>
@import './MainLayout.scss';
</style>


