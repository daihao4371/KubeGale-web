import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/api/system/service'
import { API_URLS } from '@/api/system/config'
import { createAuthority } from '@/api/system/roles/authority'

// 角色数据接口定义
export interface AuthorityData {
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: null | string
  authorityId: number
  authorityName: string
  parentId: number
  dataAuthorityId: AuthorityData[] | null
  children: AuthorityData[] | null
  menus: any | null
  defaultRouter: string
}

// 接口返回数据类型
interface ResponseData<T> {
  code: number
  data: T
  msg: string
}

export const useRoleManagement = () => {
  // 角色列表数据
  const roleList = ref<AuthorityData[]>([])
  
  // 加载状态
  const loading = ref(false)
  
  // 表格配置
  const tableConfig = reactive({
    stripe: true,
    border: true,
    'highlight-current-row': true,
    'row-key': 'authorityId'
  })
  
  // 新增角色对话框可见性
  const addRoleDialogVisible = ref(false)
  
  // 新增角色表单数据
  const addRoleForm = reactive({
    authorityId: 0,
    authorityName: '',
    parentId: 0
  })
  
  // 新增角色表单规则
  const addRoleRules = {
    authorityId: [
      { required: true, message: '请输入角色ID', trigger: 'blur' },
      { type: 'number', message: '角色ID必须为数字', trigger: 'blur' }
    ],
    authorityName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '角色名称长度应为2-20个字符', trigger: 'blur' }
    ]
  }
  
  // 打开新增角色对话框
  const openAddRoleDialog = () => {
    // 重置表单
    addRoleForm.authorityId = 0
    addRoleForm.authorityName = ''
    addRoleForm.parentId = 0
    
    // 显示对话框
    addRoleDialogVisible.value = true
  }
  
  // 关闭新增角色对话框
  const closeAddRoleDialog = () => {
    addRoleDialogVisible.value = false
  }
  
  // 提交新增角色
  const submitAddRole = async (formEl: any) => {
    if (!formEl) return
    
    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        try {
          const response = await createAuthority({
            authorityId: addRoleForm.authorityId,
            authorityName: addRoleForm.authorityName,
            parentId: addRoleForm.parentId
          })
          
          if (response.code === 0) {
            ElMessage.success('创建角色成功')
            closeAddRoleDialog()
            fetchRoleList() // 刷新角色列表
          } else {
            ElMessage.error(response.msg || '创建角色失败')
          }
        } catch (error) {
          console.error('创建角色出错:', error)
          ElMessage.error('创建角色失败，请检查网络连接')
        }
      }
    })
  }
  
  // 获取角色列表
  const fetchRoleList = async () => {
    loading.value = true
    try {
      const response = await service.post<ResponseData<AuthorityData[]>>(
        API_URLS.getAuthorityList
      )
      const res = response.data
      if (res.code === 0) {
        roleList.value = res.data
        ElMessage.success(res.msg || '获取角色列表成功')
      } else {
        ElMessage.error(res.msg || '获取角色列表失败')
      }
    } catch (error) {
      console.error('获取角色列表出错:', error)
      ElMessage.error('获取角色列表失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  }
  
  // 查看角色详情
  const viewRoleDetail = (row: AuthorityData) => {
    console.log('查看角色详情:', row)
    // 这里可以实现查看详情的逻辑，如打开详情对话框等
  }
  
  // 编辑角色
  const editRole = (row: AuthorityData) => {
    console.log('编辑角色:', row)
    // 这里可以实现编辑角色的逻辑，如打开编辑对话框等
  }
  
  // 删除角色
  const deleteRole = (row: AuthorityData) => {
    ElMessageBox.confirm(
      `确定要删除角色 "${row.authorityName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      console.log('删除角色:', row)
      // 这里可以实现删除角色的API调用
      ElMessage.success(`角色 "${row.authorityName}" 已删除`)
    }).catch(() => {
      // 取消删除
    })
  }
  
  return {
    roleList,
    loading,
    tableConfig,
    fetchRoleList,
    viewRoleDetail,
    editRole,
    deleteRole,
    // 新增角色相关
    addRoleDialogVisible,
    addRoleForm,
    addRoleRules,
    openAddRoleDialog,
    closeAddRoleDialog,
    submitAddRole
  }
}