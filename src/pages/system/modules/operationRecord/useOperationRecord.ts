import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getSysOperationRecordList, 
  deleteSysOperationRecord,
  batchDeleteSysOperationRecord,
  // 添加新API导入
  findSysOperationRecord,
  type SysOperationRecord, 
  type ApiResponse,
  type PageResponse,
  type User
} from '@/api/system/operationRecord'

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
        const responseData = response.data.data as PageResponse<SysOperationRecord>
        recordList.value = responseData.list || []
        pagination.total = responseData.total
        console.log('操作记录列表数据:', recordList.value)
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

  // 删除单条记录
  const handleDelete = (row: SysOperationRecord) => {
    ElMessageBox.confirm(`确定要删除该操作记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      loading.value = true
      try {
        // 调用修改后的API，传递ID
        const response = await deleteSysOperationRecord(row.id)
        
        if (response.data.code === 0) {
          ElMessage.success(response.data.msg || '删除成功')
          fetchRecordList() // 刷新列表
          // 如果当前有打开的详情对话框且是当前删除的记录，则关闭对话框
          if (detailDialogVisible.value && currentRecord.value?.id === row.id) {
            closeDetailDialog()
          }
        } else {
          ElMessage.error(response.data.msg || '删除操作记录失败')
        }
      } catch (error) {
        console.error('删除操作记录失败:', error)
        ElMessage.error('删除操作记录失败，请重试')
      } finally {
        loading.value = false
      }
    }).catch(() => {
      // 取消删除
    })
  }

  // 批量删除记录
  const handleBatchDelete = () => {
    if (selectedRecords.value.length === 0) {
      ElMessage.warning('请选择要删除的记录')
      return
    }
  
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRecords.value.length} 条操作记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      loading.value = true
      try {
        const ids = selectedRecords.value.map(record => record.id)
        const response = await batchDeleteSysOperationRecord(ids)
        
        if (response.data.code === 0) {
          ElMessage.success(response.data.msg || '批量删除成功')
          fetchRecordList() // 刷新列表
          // 如果当前有打开的详情对话框且是当前删除的记录之一，则关闭对话框
          if (detailDialogVisible.value && currentRecord.value && 
              ids.includes(currentRecord.value.id)) {
            closeDetailDialog()
          }
        } else {
          ElMessage.error(response.data.msg || '批量删除操作记录失败')
        }
      } catch (error) {
        console.error('批量删除操作记录失败:', error)
        ElMessage.error('批量删除操作记录失败，请重试')
      } finally {
        loading.value = false
      }
    }).catch(() => {
      // 取消删除
    })
  }

  // 格式化日期
  const formatDate = (timestamp: string) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 格式化延迟时间
  const formatLatency = (latency: string) => {
    if (!latency) return '-'
    // 假设延迟是纳秒格式
    const ns = parseInt(latency)
    if (isNaN(ns)) return latency
    
    if (ns < 1000) {
      return `${ns}ns`
    } else if (ns < 1000000) {
      return `${(ns / 1000).toFixed(2)}µs`
    } else if (ns < 1000000000) {
      return `${(ns / 1000000).toFixed(2)}ms`
    } else {
      return `${(ns / 1000000000).toFixed(2)}s`
    }
  }

  // 获取请求方法标签类型
  const getMethodType = (method: string | undefined) => {
    // 添加空值检查
    if (!method) return 'info'
    
    switch (method.toUpperCase()) {
      case 'GET':
        return 'success'
      case 'POST':
        return 'primary'
      case 'PUT':
        return 'warning'
      case 'DELETE':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 获取状态标签类型
  const getStatusType = (status: number | undefined) => {
    // 添加空值检查
    if (status === undefined || status === null) return ''
    
    if (status < 200) return ''
    if (status < 300) return 'success'
    if (status < 400) return 'warning'
    return 'danger'
  }

  // 格式化JSON字符串
  const formatJson = (jsonString: string) => {
    if (!jsonString) return '-';
    try {
      const obj = JSON.parse(jsonString);
      // 限制JSON字符串的长度，避免过长导致性能问题
      const formatted = JSON.stringify(obj, null, 2);
      // 如果JSON太长，可以考虑截断
      // return formatted.length > 5000 ? formatted.substring(0, 5000) + '...' : formatted;
      return formatted;
    } catch (e) {
      return jsonString;
    }
  };

  // 格式化用户信息
  const formatUser = (user: User | undefined, record?: SysOperationRecord) => {
    // 优先使用新增的操作人字段
    if (record?.operator_real_name && record?.operator_name) {
      return `${record.operator_name}(${record.operator_real_name})`;
    }
    
    if (record?.operator_name) {
      return record.operator_name;
    }
    
    // 如果是系统用户(user_id为0)但有操作人信息，则显示操作人信息
    if (record?.user_id === 0 && record?.user?.username === '') {
      // 尝试从其他字段获取操作人信息
      const agentInfo = record.agent || '';
      if (agentInfo.includes('User-Agent')) {
        // 从User-Agent中提取可能的用户信息
        return '系统操作';
      }
      return '系统';
    }
    
    // 兼容旧版本，使用user对象
    if (!user) return '-';
    if (user.realName) {
      return `${user.username}(${user.realName})`;
    }
    return user.username || '-';
  };

  // 组件挂载时加载数据
  onMounted(() => {
    fetchRecordList()
  })

  // 添加查看详情相关的状态变量
  const currentRecord = ref<SysOperationRecord | null>(null)
  const detailDialogVisible = ref(false)
  const detailLoading = ref(false)
  
  // 添加查看详情的方法
  const handleViewDetail = async (id: number) => {
    detailLoading.value = true
    detailDialogVisible.value = true
    
    try {
      const response = await findSysOperationRecord(id)
      
      if (response.data.code === 0) {
        // 修改这里，从 reSysOperationRecord 字段中获取数据
        currentRecord.value = response.data.data.reSysOperationRecord
      } else {
        ElMessage.error(response.data.msg || '获取操作记录详情失败')
      }
    } catch (error) {
      console.error('获取操作记录详情失败:', error)
      ElMessage.error('获取操作记录详情失败，请重试')
    } finally {
      detailLoading.value = false
    }
  }
  
  // 添加关闭详情对话框的方法
  const closeDetailDialog = () => {
    detailDialogVisible.value = false
    currentRecord.value = null
  }

  return {
    searchForm,
    recordList,
    loading,
    pagination,
    selectedRecords,
    fetchRecordList,
    handleSearch,
    resetSearch,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleDelete,
    handleBatchDelete,
    formatDate,
    formatLatency,
    getStatusType,
    getMethodType,
    formatJson,
    formatUser,  // 确保更新后的formatUser函数被正确导出
    // 添加新的返回值
    currentRecord,
    detailDialogVisible,
    detailLoading,
    handleViewDetail,
    closeDetailDialog,
  }
}