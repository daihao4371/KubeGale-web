import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMenuList, MenuData, deleteMenu } from '@/api/system/menus/menu'
import { API_URLS } from '@/api/system/config' // 导入 API_URLS

export const useMenuManagement = () => {
  // 菜单列表数据
  const menuList = ref<MenuData[]>([])
  
  // 加载状态
  const loading = ref(false)
  
  // 表格配置
  const tableConfig = reactive({
    stripe: true,
    border: true,
    'highlight-current-row': true,
    'row-key': 'ID',
    'default-expand-all': true
  })
  
  // 获取菜单列表
  const fetchMenuList = async () => {
    loading.value = true
    try {
      console.log('正在请求菜单列表API:', API_URLS.getMenuList)
      const response = await getMenuList()
      console.log('菜单列表响应:', response)
      
      // 检查响应结构
      if (response.data) {
        // 直接从响应中提取数据，适应不同的后端返回结构
        let menus: MenuData[] = [];
        
        // 情况1: response.data.data.menus 结构
        if (response.data.data && response.data.data.menus) {
          menus = response.data.data.menus;
        } 
        // 情况2: response.data.menus 结构
        else if (response.data.menus) {
          menus = response.data.menus;
        }
        // 情况3: response.data 本身就是菜单数组
        else if (Array.isArray(response.data)) {
          menus = response.data;
        }
        // 情况4: response.data.data 本身就是菜单数组
        else if (response.data.data && Array.isArray(response.data.data)) {
          menus = response.data.data;
        }
        
        console.log('提取的菜单数据:', menus)
        
        // 处理返回的菜单数据，确保每个菜单项都有必要的字段
        const processMenuData = (menus: any[]): MenuData[] => {
          if (!menus || !Array.isArray(menus)) {
            console.log('菜单数据不是数组:', menus)
            return []
          }
          
          return menus.map(menu => {
            // 确保 ID 字段存在
            if (!menu.ID && menu.id) {
              menu.ID = menu.id;
            }
            
            // 如果后端没有直接返回 menuId，则使用 ID 作为 menuId
            if (!menu.menuId) {
              menu.menuId = menu.ID;
            }
            
            // 确保 meta 对象存在
            if (!menu.meta) {
              menu.meta = {
                title: menu.title || '',
                icon: menu.icon || '',
                keepAlive: false,
                defaultMenu: false,
                closeTab: false,
                activeName: ''
              }
            }
            
            // 递归处理子菜单
            if (menu.children && menu.children.length > 0) {
              menu.children = processMenuData(menu.children)
            }
            
            return menu
          })
        }
        
        menuList.value = processMenuData(menus)
        console.log('处理后的菜单数据:', menuList.value)
        
        ElMessage.success('菜单列表获取成功')
      } else {
        ElMessage.error('获取菜单列表失败: 响应数据格式不正确')
      }
    } catch (error: any) {
      console.error('获取菜单列表出错:', error)
      if (error.response) {
        console.error('错误状态码:', error.response.status)
        console.error('错误数据:', error.response.data)
      } else if (error.request) {
        console.error('未收到响应，请求信息:', error.request)
      } else {
        console.error('错误信息:', error.message)
      }
      ElMessage.error('获取菜单列表失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  }
  
  // 删除菜单
  const handleDeleteMenu = async (menu: MenuData) => {
    try {
      // 显示确认对话框
      await ElMessageBox.confirm(
        `确定要删除菜单 "${menu.meta?.title || menu.name}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      // 在 handleDeleteMenu 方法中
      loading.value = true
      // 使用 menu.ts 中的 deleteMenu 方法，而不是直接引用 API_URLS
      console.log('正在请求删除菜单API:', '/api/menu/deleteBaseMenu')
      console.log('删除菜单参数:', { ID: menu.ID })
      
      // 调用删除菜单API
      const response = await deleteMenu(menu.ID)
      console.log('删除菜单响应:', response)
      
      if (response.data && response.data.code === 0) {
        ElMessage.success('删除菜单成功')
        // 重新获取菜单列表
        await fetchMenuList()
      } else {
        ElMessage.error(response.data?.msg || '删除菜单失败')
      }
    } catch (error: any) {
      // 如果是用户取消操作，不显示错误
      if (error === 'cancel' || error.toString().includes('cancel')) {
        return
      }
      
      console.error('删除菜单出错:', error)
      if (error.response) {
        console.error('错误状态码:', error.response.status)
        console.error('错误数据:', error.response.data)
      } else if (error.request) {
        console.error('未收到响应，请求信息:', error.request)
      } else {
        console.error('错误信息:', error.message)
      }
      ElMessage.error('删除菜单失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  }
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 默认表单结构
  const defaultForm = {
    ID: 0,
    path: '',
    name: '',
    hidden: false,
    parentId: 0,
    component: '',
    meta: {
      activeName: '',
      title: '',
      icon: '',
      defaultMenu: false,
      closeTab: false,
      keepAlive: false
    },
    parameters: [],
    menuBtn: []
  }
  
  return {
    menuList,
    loading,
    tableConfig,
    fetchMenuList,
    formatDate,
    defaultForm,
    handleDeleteMenu // 导出删除菜单方法
  }
}