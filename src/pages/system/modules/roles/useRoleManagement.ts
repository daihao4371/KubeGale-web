import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/api/system/service'
import { API_URLS } from '@/api/system/config'
import { createAuthority, updateAuthority } from '@/api/system/roles/authority'

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
        // 将所有角色（包括子角色）平铺到一个数组中，并添加层级信息
        const flattenRoles = (roles: AuthorityData[], level = 0): (AuthorityData & { level: number })[] => {
          let result: (AuthorityData & { level: number })[] = [];
          roles.forEach(role => {
            // 添加层级信息
            const roleWithLevel = { ...role, level };
            result.push(roleWithLevel);
            if (role.children && role.children.length > 0) {
              // 子角色层级+1
              result = result.concat(flattenRoles(role.children, level + 1));
            }
          });
          return result;
        };
        
        // 保存原始的层级结构数据
        const hierarchicalRoles = res.data;
        // 创建平铺的角色列表（包含所有父级和子级角色以及层级信息）
        roleList.value = flattenRoles(hierarchicalRoles);
        
        // 添加一个顶级选项
        cascaderRoleOptions.value = [
          { authorityId: 0, authorityName: '无（顶级角色）', children: [] },
          ...processRolesForCascader(hierarchicalRoles)
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
  
  // 删除这个重复的editRole函数声明
  // 编辑角色
  // const editRole = (row: AuthorityData) => {
  //   console.log('编辑角色:', row)
  //   // 这里可以实现编辑角色的逻辑，如打开编辑对话框等
  // }
  
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
  
  return {
    roleList,
    loading,
    tableConfig,
    fetchRoleList,
    viewRoleDetail,
    editRole,
    deleteRole,
    cascaderRoleOptions, // 添加级联选择器选项
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
    submitEditRole
  }
}