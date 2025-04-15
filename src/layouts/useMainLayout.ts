import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { usePasswordDialog } from '@/api/system/usePasswordDialog'

export function useMainLayout() {
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
  const store = useStore()

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
      // 处理个人信息 - 修改为跳转到用户页面并打开个人信息对话框
      if (route.path !== '/system/users') {
        router.push('/system/users').then(() => {
          // 等待路由跳转完成后，延迟执行以确保组件已挂载
          setTimeout(() => {
            // 使用全局事件总线或其他方式触发用户信息对话框
            const usersComponent = document.querySelector('.users-container')
            if (usersComponent) {
              // 使用自定义事件触发
              window.dispatchEvent(new CustomEvent('open-user-info-dialog'))
            } else {
              ElMessage.error('无法打开个人信息，请稍后再试')
            }
          }, 300)
        })
      } else {
        // 如果已经在用户页面，直接触发事件
        window.dispatchEvent(new CustomEvent('open-user-info-dialog'))
      }
    } else if (command === 'password') {
      // 修改为调用修改密码对话框
      openPasswordDialog()
    }
  }

  // 处理密码提交
  const handlePasswordSubmit = async () => {
    await submitChangePassword()
  }

  // 处理退出登录
  const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        // 使用Vuex中的logout action
        await store.dispatch('logout')
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

  return {
    isCollapse,
    activeMenu,
    passwordDialogVisible,
    passwordLoading,
    toggleSidebar,
    handleCommand,
    handleLogout,
    handlePasswordSubmit
  }
}