<template>
  <div class="main-layout" :class="{ 'is-collapse': isCollapse }">
    <el-container>
      <el-aside width="220px" class="aside">
        <div class="logo">
          <h2>KubeGale</h2>
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
          <el-menu-item index="/dashboard">
            <el-icon><el-icon-odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <!-- 系统管理移到第二位 -->
          <el-sub-menu index="/system">
            <template #title>
              <el-icon><el-icon-setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/users">用户管理</el-menu-item>
            <el-menu-item index="/system/roles">角色管理</el-menu-item>
            <el-menu-item index="/system/permissions">权限管理</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/cmdb">
            <el-icon><el-icon-files /></el-icon>
            <span>CMDB配置管理</span>
          </el-menu-item>
          <el-menu-item index="/kubernetes">
            <el-icon><el-icon-connection /></el-icon>
            <span>Kubernetes管理</span>
          </el-menu-item>
          <el-menu-item index="/prometheus">
            <el-icon><el-icon-data-line /></el-icon>
            <span>Prometheus监控</span>
          </el-menu-item>
          <el-menu-item index="/cicd">
            <el-icon><el-icon-finished /></el-icon>
            <span>CICD管理</span>
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
              <span class="user-info">
                管理员 <el-icon><el-icon-arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="password">修改密码</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main :class="{ collapsed: isCollapse }">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 添加修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="password">
          <el-input
            v-model="passwordForm.password"
            placeholder="请输入原密码"
            :type="oldPasswordVisible ? 'text' : 'password'"
          >
            <template #suffix>
              <el-icon class="password-eye" @click="oldPasswordVisible = !oldPasswordVisible">
                <el-icon-view v-if="oldPasswordVisible"/>
                <el-icon-hide v-else/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            placeholder="请输入新密码"
            :type="newPasswordVisible ? 'text' : 'password'"
          >
            <template #suffix>
              <el-icon class="password-eye" @click="newPasswordVisible = !newPasswordVisible">
                <el-icon-view v-if="newPasswordVisible"/>
                <el-icon-hide v-else/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
            :type="confirmPasswordVisible ? 'text' : 'password'"
          >
            <template #suffix>
              <el-icon class="password-eye" @click="confirmPasswordVisible = !confirmPasswordVisible">
                <el-icon-view v-if="confirmPasswordVisible"/>
                <el-icon-hide v-else/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChangePassword" :loading="passwordLoading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
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
import { View as ElIconView, Hide as ElIconHide } from '@element-plus/icons-vue'

// 初始化修改密码相关功能
const {
  passwordDialogVisible,
  passwordLoading,
  passwordFormRef,
  oldPasswordVisible,
  newPasswordVisible,
  confirmPasswordVisible,
  passwordForm,
  passwordRules,
  openPasswordDialog,
  resetPasswordForm,
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
.main-layout {
  height: 100vh;
  display: flex;

  .aside {
    background-color: #1e1e1e;
    transition: width 0.3s;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #1e1e1e;

      h2 {
        color: #fff;
        margin: 0;
      }
    }

    .el-menu {
      border-right: none;
      height: calc(100vh - 60px);
      overflow-y: auto;

      // 添加菜单项选中时的样式
      :deep(.el-menu-item.is-active) {
        background-color: transparent !important;
        color: #409eff !important;
        font-weight: bold;

        // 添加左侧边框标识选中状态
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: #409eff;
        }
      }

      // 子菜单项选中样式
      :deep(.el-sub-menu.is-active .el-sub-menu__title) {
        color: #409eff !important;
      }
    }
  }

  .header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
    }

    .user-info {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
  }
}

.el-container {
  width: 100%;

  .el-main {
    margin-left: 220px;
    transition: margin-left 0.3s;

    &.collapsed {
      margin-left: 64px;
    }
  }
}

.is-collapse .el-main {
  margin-left: 64px;
}
</style>


<!-- 修改密码对话框中的表单项
<el-form-item label="原密码" prop="password">
  <el-input
      v-model="passwordForm.password"
      placeholder="请输入原密码"
      :type="oldPasswordVisible ? 'text' : 'password'"
  >
    <template #suffix>
      <el-icon class="password-eye" @click="oldPasswordVisible = !oldPasswordVisible">
        <el-icon-view v-if="oldPasswordVisible"/>
        <el-icon-hide v-else/>
      </el-icon>
    </template>
  </el-input>
</el-form-item>

// 添加密码输入框中眼睛图标的样式
.password-eye {
  cursor: pointer;
  color: #909399;
  
  &:hover {
    color: #409EFF;
  }
} -->


