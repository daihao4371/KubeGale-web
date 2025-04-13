// 修改导入语句，添加 computed
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/api/system/service'
import { API_URLS } from '@/api/system/config'
import { createAuthority, updateAuthority, deleteAuthority, copyAuthority } from '@/api/system/roles/authority'

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
    'row-key': 'authorityId',
    'default-expand-all': false // 默认不展开所有行
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
        // 直接使用原始的层级结构数据
        roleList.value = res.data;
        
        // 添加一个顶级选项
        cascaderRoleOptions.value = [
          { authorityId: 0, authorityName: '无（顶级角色）', children: [] },
          ...processRolesForCascader(res.data)
        ];
        
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
  
  // 处理角色数据为级联选择器格式
  const processRolesForCascader = (roles: AuthorityData[]): any[] => {
    return roles.map(role => {
      const result: any = {
        authorityId: role.authorityId,
        authorityName: role.authorityName,
      };
      
      if (role.children && role.children.length > 0) {
        result.children = processRolesForCascader(role.children);
      }
      
      return result;
    });
  };
  
  // 级联选择器选项
  const cascaderRoleOptions = ref<any[]>([]);
  
  // 查看角色详情
  const viewRoleDetail = (row: AuthorityData) => {
    console.log('查看角色详情:', row)
    // 这里可以实现查看详情的逻辑，如打开详情对话框等
  }
  
  // 删除角色
  const deleteRole = (row: AuthorityData) => {
    ElMessageBox.confirm(
      `确定要删除角色 "${row.authorityName}" 吗？${row.children && row.children.length > 0 ? '该操作将同时删除所有子角色！' : ''}`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'role-delete-confirm'
      }
    ).then(async () => {
      try {
        const response = await deleteAuthority(row.authorityId)
        
        if (response.code === 0) {
          ElMessage.success(`角色 "${row.authorityName}" 已成功删除`)
          fetchRoleList() // 刷新角色列表
        } else {
          ElMessage.error(response.msg || `删除角色 "${row.authorityName}" 失败`)
        }
      } catch (error) {
        console.error('删除角色出错:', error)
        ElMessage.error(`删除角色失败，请检查网络连接`)
      }
    }).catch(() => {
      // 用户取消删除，不做任何操作
    })
  }
  
  // 新增子角色对话框可见性
  const addChildRoleDialogVisible = ref(false)
  
  // 新增子角色表单数据
  const addChildRoleForm = reactive({
    authorityId: 0,
    authorityName: '',
    parentId: 0,
    parentName: '' // 用于显示父级角色名称
  })
  
  // 新增子角色表单规则
  const addChildRoleRules = {
    authorityId: [
      { required: true, message: '请输入角色ID', trigger: 'blur' },
      { type: 'number', message: '角色ID必须为数字', trigger: 'blur' }
    ],
    authorityName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '角色名称长度应为2-20个字符', trigger: 'blur' }
    ]
  }
  
  // 打开新增子角色对话框
  const openAddChildRoleDialog = (parentRole: AuthorityData) => {
    // 重置表单
    addChildRoleForm.authorityId = 0
    addChildRoleForm.authorityName = ''
    addChildRoleForm.parentId = parentRole.authorityId
    addChildRoleForm.parentName = parentRole.authorityName
    
    // 显示对话框
    addChildRoleDialogVisible.value = true
  }
  
  // 关闭新增子角色对话框
  const closeAddChildRoleDialog = () => {
    addChildRoleDialogVisible.value = false
  }
  
  // 提交新增子角色
  const submitAddChildRole = async (formEl: any) => {
    if (!formEl) return
    
    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        try {
          const response = await createAuthority({
            authorityId: addChildRoleForm.authorityId,
            authorityName: addChildRoleForm.authorityName,
            parentId: addChildRoleForm.parentId
          })
          
          if (response.code === 0) {
            ElMessage.success('创建子角色成功')
            closeAddChildRoleDialog()
            fetchRoleList() // 刷新角色列表
          } else {
            ElMessage.error(response.msg || '创建子角色失败')
          }
        } catch (error) {
          console.error('创建子角色出错:', error)
          ElMessage.error('创建子角色失败，请检查网络连接')
        }
      }
    })
  }
  
  // 编辑角色对话框可见性
  const editRoleDialogVisible = ref(false)
  
  // 编辑角色表单数据
  const editRoleForm = reactive({
    authorityId: 0,
    authorityName: '',
    parentId: 0,
    originalParentId: 0, // 用于记录原始父级ID
    originalAuthorityId: 0 // 用于记录原始角色ID
  })
  
  // 编辑角色表单规则
  const editRoleRules = {
    authorityName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '角色名称长度应为2-20个字符', trigger: 'blur' }
    ],
    parentId: [
      { required: true, message: '请选择父级角色', trigger: 'change' }
    ]
  }
  
  // 打开编辑角色对话框
  const openEditRoleDialog = (row: AuthorityData) => {
    // 设置表单数据
    editRoleForm.authorityId = row.authorityId
    editRoleForm.authorityName = row.authorityName
    editRoleForm.parentId = row.parentId
    editRoleForm.originalParentId = row.parentId
    editRoleForm.originalAuthorityId = row.authorityId
    
    // 显示对话框
    editRoleDialogVisible.value = true
  }
  
  // 关闭编辑角色对话框
  const closeEditRoleDialog = () => {
    editRoleDialogVisible.value = false
  }
  
  // 提交编辑角色
  const submitEditRole = async (formEl: any) => {
    if (!formEl) return
    
    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        try {
          const response = await updateAuthority({
            authorityId: editRoleForm.authorityId,
            authorityName: editRoleForm.authorityName,
            parentId: editRoleForm.parentId
          })
          
          if (response.code === 0) {
            ElMessage.success('更新角色成功')
            closeEditRoleDialog()
            fetchRoleList() // 刷新角色列表
          } else {
            ElMessage.error(response.msg || '更新角色失败')
          }
        } catch (error) {
          console.error('更新角色出错:', error)
          ElMessage.error('更新角色失败，请检查网络连接')
        }
      }
    })
  }
  
  // 修改现有的编辑角色方法
  const editRole = (row: AuthorityData) => {
    openEditRoleDialog(row)
  }
  
  // 拷贝角色对话框可见性
  const copyRoleDialogVisible = ref(false)
  
  // 拷贝角色表单数据
  const copyRoleForm = reactive({
    authorityId: 0,
    authorityName: '',
    parentId: 0,
    oldAuthorityId: 0, // 原角色ID
    oldAuthorityName: '' // 用于显示原角色名称
  })
  
  // 拷贝角色表单规则
  const copyRoleRules = {
    authorityId: [
      { required: true, message: '请输入角色ID', trigger: 'blur' },
      { type: 'number', message: '角色ID必须为数字', trigger: 'blur' }
    ],
    authorityName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '角色名称长度应为2-20个字符', trigger: 'blur' }
    ],
    parentId: [
      { required: true, message: '请选择父级角色', trigger: 'change' }
    ]
  }
  
  // 打开拷贝角色对话框
  const openCopyRoleDialog = (row: AuthorityData) => {
    // 重置表单
    copyRoleForm.authorityId = 0
    copyRoleForm.authorityName = `${row.authorityName}_复制`
    copyRoleForm.parentId = row.parentId
    copyRoleForm.oldAuthorityId = row.authorityId
    copyRoleForm.oldAuthorityName = row.authorityName
    
    // 显示对话框
    copyRoleDialogVisible.value = true
  }
  
  // 关闭拷贝角色对话框
  const closeCopyRoleDialog = () => {
    copyRoleDialogVisible.value = false
  }
  
  // 提交拷贝角色
  const submitCopyRole = async (formEl: any) => {
    if (!formEl) return
    
    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        try {
          // 确保所有必要的字段都有值
          if (!copyRoleForm.authorityId) {
            ElMessage.error('角色ID不能为空')
            return
          }
          
          if (!copyRoleForm.authorityName) {
            ElMessage.error('角色名称不能为空')
            return
          }
          
          if (copyRoleForm.parentId === undefined || copyRoleForm.parentId === null) {
            ElMessage.error('父级角色不能为空')
            return
          }
          
          if (!copyRoleForm.oldAuthorityId) {
            ElMessage.error('原角色ID不能为空')
            return
          }
          
          const response = await copyAuthority({
            authority: {
              authorityId: copyRoleForm.authorityId,
              authorityName: copyRoleForm.authorityName,
              parentId: copyRoleForm.parentId,
              defaultRouter: "dashboard" // 默认使用dashboard作为默认路由
            },
            oldAuthorityId: copyRoleForm.oldAuthorityId
          })
          
          if (response.code === 0) {
            ElMessage.success('拷贝角色成功')
            closeCopyRoleDialog()
            fetchRoleList() // 刷新角色列表
          } else {
            ElMessage.error(response.msg || '拷贝角色失败')
          }
        } catch (error) {
          console.error('拷贝角色出错:', error)
          ElMessage.error('拷贝角色失败，请检查网络连接')
        }
      }
    })
  }
  
  // 设置权限对话框可见性
  const setPermissionDialogVisible = ref(false)
  
  // 当前选中的角色
  const currentRole = ref<AuthorityData | null>(null)
  
  // 当前激活的标签页
  const activePermissionTab = ref('资源权限')
  
  // 资源权限数据
  const resourcePermissions = ref<any[]>([])
  
  // 选中的资源权限
  const selectedResources = ref<number[]>([])
  
  // 打开设置权限对话框
  const openSetPermissionDialog = (row: AuthorityData) => {
    currentRole.value = row
    setPermissionDialogVisible.value = true
    activePermissionTab.value = '资源权限'
    
    // 获取资源权限数据
    fetchResourcePermissions(row.authorityId)
  }
  
  // 关闭设置权限对话框
  const closeSetPermissionDialog = () => {
    setPermissionDialogVisible.value = false
    currentRole.value = null
  }
  
  // 获取资源权限数据
  const fetchResourcePermissions = async (authorityId: number) => {
    try {
      const response = await service.post<ResponseData<any>>(
        `${API_URLS.getAuthorityList}`,
        {}
      )
      
      if (response.data.code === 0) {
        // 过滤掉当前角色自身
        resourcePermissions.value = response.data.data.filter((role: AuthorityData) => 
          role.authorityId !== authorityId
        ) || []
        
        // 获取当前角色的数据权限
        if (currentRole.value && currentRole.value.dataAuthorityId) {
          selectedResources.value = currentRole.value.dataAuthorityId.map(
            (auth: any) => auth.authorityId
          )
        } else {
          selectedResources.value = []
        }
      } else {
        ElMessage.error(response.data.msg || '获取资源权限失败')
      }
    } catch (error) {
      console.error('获取资源权限出错:', error)
      ElMessage.error('获取资源权限失败，请检查网络连接')
    }
  }
  
  // 提交资源权限设置
  const submitResourcePermissions = async () => {
    if (!currentRole.value) return
    
    try {
      const response = await service.post<ResponseData<any>>(
        API_URLS.setDataAuthority,
        {
          authorityId: currentRole.value.authorityId,
          dataAuthorityId: selectedResources.value
        }
      )
      
      if (response.data.code === 0) {
        ElMessage.success('资源权限设置成功')
        closeSetPermissionDialog()
        fetchRoleList() // 刷新角色列表
      } else {
        ElMessage.error(response.data.msg || '资源权限设置失败')
      }
    } catch (error) {
      console.error('设置资源权限出错:', error)
      ElMessage.error('设置资源权限失败，请检查网络连接')
    }
  }
  
  // 提交权限设置
  const submitPermissionSettings = () => {
    submitResourcePermissions()
  }
  
  // 全选资源权限
  const selectAllResources = () => {
    selectedResources.value = resourcePermissions.value.map(role => role.authorityId)
  }
  
  // 选择本角色资源权限
  const selectCurrentRoleResources = () => {
    if (!currentRole.value) return
    
    // 只选择当前角色
    selectedResources.value = [currentRole.value.authorityId]
  }
  
  // 选择本角色及子角色资源权限
  const selectCurrentAndChildrenResources = () => {
    if (!currentRole.value) return
    
    // 选择当前角色及其所有子角色
    const selectedIds = [currentRole.value.authorityId]
    
    const findChildrenIds = (roles: AuthorityData[], parentId: number) => {
      roles.forEach(role => {
        if (role.parentId === parentId) {
          selectedIds.push(role.authorityId)
          
          if (role.children && role.children.length > 0) {
            findChildrenIds(role.children, role.authorityId)
          }
        }
        
        if (role.children && role.children.length > 0) {
          findChildrenIds(role.children, parentId)
        }
      })
    }
    
    findChildrenIds(roleList.value, currentRole.value.authorityId)
    selectedResources.value = selectedIds
  }
  
  return {
    roleList,
    loading,
    tableConfig,
    fetchRoleList,
    editRole,
    deleteRole,
    cascaderRoleOptions,
    
    // 新增角色相关
    addRoleDialogVisible,
    addRoleForm,
    addRoleRules,
    openAddRoleDialog,
    closeAddRoleDialog,
    submitAddRole,
    
    // 新增子角色相关
    addChildRoleDialogVisible,
    addChildRoleForm,
    addChildRoleRules,
    openAddChildRoleDialog,
    closeAddChildRoleDialog,
    submitAddChildRole,
    
    // 编辑角色相关
    editRoleDialogVisible,
    editRoleForm,
    editRoleRules,
    openEditRoleDialog,
    closeEditRoleDialog,
    submitEditRole,
    
    // 拷贝角色相关
    copyRoleDialogVisible,
    copyRoleForm,
    copyRoleRules,
    openCopyRoleDialog,
    closeCopyRoleDialog,
    submitCopyRole,
    
    // 设置权限相关 - 只保留资源权限相关的导出
    setPermissionDialogVisible,
    currentRole,
    activePermissionTab,
    resourcePermissions,
    selectedResources,
    openSetPermissionDialog,
    closeSetPermissionDialog,
    submitPermissionSettings,
    selectAllResources,
    selectCurrentRoleResources,
    selectCurrentAndChildrenResources
  }
}