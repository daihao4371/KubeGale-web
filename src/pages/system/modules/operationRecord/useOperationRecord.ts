import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getSysOperationRecordList, 
  findSysOperationRecord,
  deleteSysOperationRecord,
  batchDeleteSysOperationRecord,
  type SysOperationRecord, 
  type PageResponse,
  type User
} from '@/api/system/operationRecord/operationRecord'
// 导入用户API
import service from '@/api/system/service'
import { API_URLS } from '@/api/system/config'

export function useOperationRecord() {
  // 搜索表单
  const searchForm = reactive({
    path: '',
    method: '',
    status: undefined,
    ip: '',
    userId: undefined,
    startTime: '',
    endTime: ''
  })

  // 操作记录列表数据
  const recordList = ref<SysOperationRecord[]>([])
  const loading = ref(false)
  
  // 分页配置
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // 选中的记录
  const selectedRecords = ref<SysOperationRecord[]>([])
  
  // 详情对话框相关
  const detailDialogVisible = ref(false)
  const detailLoading = ref(false)
  const currentRecord = ref<SysOperationRecord | null>(null)

  // 获取操作记录列表
  const fetchRecordList = async () => {
    loading.value = true
    try {
      // 构建请求参数
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchForm
      }
      
      // 调用API获取操作记录列表
      const response = await getSysOperationRecordList(params)
      
      if (response.data.code === 0) {
        // 请求成功
        const responseData = response.data.data as PageResponse<any>
        
        // 处理返回的数据，确保字段名称正确
        recordList.value = (responseData.list || []).map(item => {
          // 确保必要字段存在
          const record: SysOperationRecord = {
            id: item.id || item.ID || 0,
            created_at: item.created_at || item.CreatedAt || '',
            updated_at: item.updated_at || item.UpdatedAt || '',
            ip: item.ip || '',
            method: item.method || '',
            path: item.path || '',
            status: item.status || 0,
            latency: item.latency || '',
            agent: item.agent || '',
            error_message: item.error_message || '',
            body: item.body || '',
            resp: item.resp || '',
            user_id: item.user_id || 0,
            user: {
              id: 0,
              username: ''
            }
          }
          
          // 处理用户信息，不再使用realName
          if (item.user) {
            record.user = {
              id: Number(item.user.ID || item.user.id || 0),
              username: String(item.user.userName || item.user.username || ''),
              nickname: String(item.user.nickName || item.user.nickname || '')
            }
          }
          
          return record
        })
        
        pagination.total = responseData.total
      } else {
        // 请求失败
        ElMessage.error(response.data.msg || '获取操作记录列表失败')
      }
    } catch (error) {
      console.error('获取操作记录列表失败:', error)
      ElMessage.error('获取操作记录列表失败，请重试')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.page = 1 // 重置到第一页
    fetchRecordList()
  }

  // 重置搜索
  const resetSearch = () => {
    // 重置搜索表单
    searchForm.path = ''
    searchForm.method = ''
    searchForm.status = undefined
    searchForm.ip = ''
    searchForm.userId = undefined
    searchForm.startTime = ''
    searchForm.endTime = ''
    
    pagination.page = 1 // 重置到第一页
    fetchRecordList()
  }

  // 处理分页变化
  const handlePageChange = (page: number) => {
    pagination.page = page
    fetchRecordList()
  }

  // 处理每页条数变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.page = 1 // 重置到第一页
    fetchRecordList()
  }

  // 处理选择变化
  const handleSelectionChange = (selection: SysOperationRecord[]) => {
    selectedRecords.value = selection
  }

  // 修改为使用getUserInfo API获取用户信息
  const getSystemUsers = async (userId: number) => {
    if (!userId) return []
    
    try {
      // 尝试使用getUserInfo API获取用户信息，不需要传入用户ID
      const response = await service({
        url: API_URLS.getUserInfo,
        method: 'get'
      })
      
      if (response.data.code === 0 && response.data.data) {
        // 从userInfo中获取用户数据
        const userData = response.data.data.userInfo || response.data.data;
        
        // 检查获取到的用户ID是否与需要的用户ID匹配
        if (userData.ID === userId || userData.id === userId) {
          return [{
            id: Number(userData.ID || userData.id || 0),
            username: String(userData.userName || userData.username || ''),
            nickname: String(userData.nickName || userData.nickname || '')
          }];
        } else {
          // 如果当前登录用户不是我们需要的用户，尝试使用getUserList
          const listResponse = await service({
            url: API_URLS.getUserList,
            method: 'get',
            params: {
              page: 1,
              pageSize: 100 // 增加数量以提高找到目标用户的概率
            }
          })
          
          if (listResponse.data.code === 0) {
            const users = listResponse.data.data.list || []
            // 过滤出指定ID的用户
            return users
              .filter((user: any) => user.ID === userId || user.id === userId)
              .map((user: any) => ({
                id: Number(user.ID || user.id || 0),
                username: String(user.userName || user.username || ''),
                nickname: String(user.nickName || user.nickname || '')
              }))
          }
        }
      } else {
        // 如果getUserInfo失败，尝试使用getUserList
        const listResponse = await service({
          url: API_URLS.getUserList,
          method: 'get',
          params: {
            page: 1,
            pageSize: 100 // 增加数量以提高找到目标用户的概率
          }
        })
        
        if (listResponse.data.code === 0) {
          const users = listResponse.data.data.list || []
          // 过滤出指定ID的用户
          return users
            .filter((user: any) => user.ID === userId || user.id === userId)
            .map((user: any) => ({
              id: Number(user.ID || user.id || 0),
              username: String(user.userName || user.username || ''),
              nickname: String(user.nickName || user.nickname || '')
            }))
        }
      }
      return []
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return []
    }
  }

  // 保留这个formatUser函数，删除后面重复的函数
  // 修改formatUser函数，移除硬编码逻辑
  // 修改formatUser函数，确保正确显示用户信息
  const formatUser = (user: User | undefined, record: SysOperationRecord) => {
  // 优先使用操作人字段
  if (record.operator_real_name) {
  return record.operator_real_name;
  }
  
  if (record.operator_name) {
  return record.operator_name;
  }
  
  // 其次使用user对象
  if (user) {
  if (user.nickname) return user.nickname;
  if (user.username) return user.username;
  }
  
  // 最后使用用户ID
  return `用户ID: ${record.user_id || 0}`;
  }

  // 关闭详情对话框
  const closeDetailDialog = () => {
    detailDialogVisible.value = false
    currentRecord.value = null
  }

  // 删除单条记录 - 实现删除功能
  const handleDelete = (record: SysOperationRecord) => {
    if (!record || !record.id) {
      ElMessage.error('无效的记录ID')
      return
    }

    ElMessageBox.confirm(
      '确定要删除该操作记录吗？此操作不可恢复',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        const response = await deleteSysOperationRecord({ ID: record.id })
        
        if (response.data.code === 0) {
          ElMessage.success('删除成功')
          // 刷新列表
          fetchRecordList()
        } else {
          ElMessage.error(response.data.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除操作记录失败:', error)
        ElMessage.error('删除操作记录失败，请重试')
      }
    }).catch(() => {
      // 用户取消删除，不做任何操作
    })
  }

  // 批量删除记录 - 实现批量删除功能
  const handleBatchDelete = () => {
    if (selectedRecords.value.length === 0) {
      ElMessage.warning('请先选择要删除的记录')
      return
    }

    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRecords.value.length} 条操作记录吗？此操作不可恢复`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        // 提取所有选中记录的ID
        const ids = selectedRecords.value.map(record => record.id)
        
        const response = await batchDeleteSysOperationRecord({ IDs: ids })
        
        if (response.data.code === 0) {
          ElMessage.success('批量删除成功')
          // 清空选中记录
          selectedRecords.value = []
          // 刷新列表
          fetchRecordList()
        } else {
          ElMessage.error(response.data.msg || '批量删除失败')
        }
      } catch (error) {
        console.error('批量删除操作记录失败:', error)
        ElMessage.error('批量删除操作记录失败，请重试')
      }
    }).catch(() => {
      // 用户取消删除，不做任何操作
    })
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  // 格式化延迟时间
  const formatLatency = (latency: string | number) => {
    if (!latency) return '-'
    
    // 如果是数字，转换为更友好的格式（纳秒转为毫秒）
    if (typeof latency === 'number') {
      return `${(latency / 1000000).toFixed(2)} ms`
    }
    
    return latency
  }

  // 获取状态码类型
  const getStatusType = (status: number) => {
    if (status >= 200 && status < 300) return 'success'
    if (status >= 300 && status < 400) return 'warning'
    if (status >= 400) return 'danger'
    return 'info'
  }

  // 获取请求方法类型
  const getMethodType = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'success'
      case 'POST': return 'primary'
      case 'PUT': return 'warning'
      case 'DELETE': return 'danger'
      default: return 'info'
    }
  }

  // 格式化JSON
  const formatJson = (jsonStr: string) => {
    if (!jsonStr) return '-'
    try {
      const obj = JSON.parse(jsonStr)
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      return jsonStr
    }
  }

  // 添加查看详情函数
  const handleViewDetail = async (id: number) => {
    // 添加ID有效性检查
    if (!id || isNaN(Number(id))) {
      ElMessage.error('无效的记录ID')
      return
    }
    
    detailDialogVisible.value = true
    detailLoading.value = true
    
    try {
      const response = await findSysOperationRecord(id)
      
      if (response.data.code === 0) {
        // 处理后端返回的数据结构
        const recordData = response.data.data.reSysOperationRecord
        if (recordData) {
          // 转换字段名称为前端使用的格式
          currentRecord.value = {
            id: recordData.ID || 0,
            created_at: recordData.CreatedAt || '',
            updated_at: recordData.UpdatedAt || '',
            ip: recordData.ip || '',
            method: recordData.method || '',
            path: recordData.path || '',
            status: recordData.status || 0,
            latency: recordData.latency || '',
            agent: recordData.agent || '',
            error_message: recordData.error_message || '',
            body: recordData.body || '',
            resp: recordData.resp || '',
            user_id: recordData.user_id || 0,
            user: {
              id: 0,
              username: ''
            }
          }
          
          // 处理用户信息
          if (recordData.user && (recordData.user.userName || recordData.user.username)) {
            // 从后端返回的user对象中提取用户信息
            currentRecord.value.user = {
              id: Number(recordData.user.ID || recordData.user.id || 0),
              username: String(recordData.user.userName || recordData.user.username || ''),
              nickname: String(recordData.user.nickName || recordData.user.nickname || '')
            }
            
            // 添加操作人信息
            currentRecord.value.operator_name = recordData.user.userName || recordData.user.username || '';
            currentRecord.value.operator_real_name = recordData.user.nickName || recordData.user.nickname || '';
          } else if (recordData.user_id) {
            // 如果没有user对象或user信息不完整，尝试通过user_id获取用户信息
            const systemUsers = await getSystemUsers(recordData.user_id);
            if (systemUsers && systemUsers.length > 0) {
              const user = systemUsers[0];
              currentRecord.value.user = {
                id: user.id,
                username: user.username,
                nickname: user.nickname
              };
              currentRecord.value.operator_name = user.username;
              currentRecord.value.operator_real_name = user.nickname;
            }
          }
        } else {
          ElMessage.error('获取操作记录详情失败：数据结构异常')
          closeDetailDialog()
        }
      } else {
        ElMessage.error(response.data.msg || '获取操作记录详情失败')
        closeDetailDialog()
      }
    } catch (error) {
      console.error('获取操作记录详情失败:', error)
      ElMessage.error('获取操作记录详情失败，请重试')
      closeDetailDialog()
    } finally {
      detailLoading.value = false
    }
  }

  // 在组件挂载时获取操作记录列表
  onMounted(() => {
    fetchRecordList()
  })

  return {
    // 数据
    searchForm,
    recordList,
    loading,
    pagination,
    selectedRecords,
    detailDialogVisible,
    detailLoading,
    currentRecord,
    
    // 方法
    fetchRecordList,
    handleSearch,
    resetSearch,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleDelete,
    handleBatchDelete,
    handleViewDetail,
    closeDetailDialog,
    
    // 辅助函数
    formatDate,
    formatLatency,
    formatUser,
    getStatusType,
    getMethodType,
    formatJson
  }
}