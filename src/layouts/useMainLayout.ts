import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { logout } from '@/api/user'
import { removeToken } from '@/utils/auth'
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
        // 调用退出登录函数（现在只在前端处理）
        await logout()
        
        // 清除token
        removeToken()
        
        // 清除localStorage中的用户信息
        localStorage.removeItem('userInfo')
        
        // 清除其他可能存在的用户相关数据
        localStorage.removeItem('rememberMe')
        sessionStorage.clear()
        
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

  return {
    isCollapse,
    activeMenu,
    passwordDialogVisible,
    passwordLoading,
    toggleSidebar,
    handleCommand,
    handleLogout,
    submitChangePassword
  }
}