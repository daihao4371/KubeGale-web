import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getSysOperationRecordList, 
  findSysOperationRecord,
  type SysOperationRecord, 
  type PageResponse,
  type User
} from '@/api/system/operationRecord/operationRecord'

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
          
          // 处理用户信息
          if (item.user) {
            record.user = {
              id: Number(item.user.ID || item.user.id || 0),
              username: String(item.user.userName || item.user.username || ''),
              nickname: String(item.user.nickName || item.user.nickname || ''),
              realName: String(item.user.realName || '')
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

  // 查看详情
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
          if (recordData.user) {
            currentRecord.value.user = {
              id: Number(recordData.user.ID || 0),
              username: String(recordData.user.userName || ''),
              nickname: String(recordData.user.nickName || ''),
              realName: String(recordData.user.realName || '')
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

  // 关闭详情对话框
  const closeDetailDialog = () => {
    detailDialogVisible.value = false
    currentRecord.value = null
  }

  // 删除单条记录 - 简化为显示开发中提示
  const handleDelete = () => {
    ElMessage.info('删除功能开发中')
  }

  // 批量删除记录 - 简化为显示开发中提示
  const handleBatchDelete = () => {
    ElMessage.info('批量删除功能开发中')
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

  // 格式化用户信息
  const formatUser = (user: User | undefined, record: SysOperationRecord) => {
    if (record.operator_name) {
      return record.operator_real_name || record.operator_name
    }
    
    if (user) {
      return user.realName || user.nickname || user.username || `用户ID: ${user.id}`
    }
    
    if (record.user_id === 0) {
      return '系统'
    }
    
    return `用户ID: ${record.user_id}`
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