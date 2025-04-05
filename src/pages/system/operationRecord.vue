<template>
  <div class="operation-record-container">
    <div class="operation-record-header">
      <h2>系统操作日志</h2>
      <div class="operation-bar">
        <!-- 搜索区域 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="请求路径">
            <el-input v-model="searchForm.path" placeholder="请输入请求路径" clearable />
          </el-form-item>
          <el-form-item label="请求方法">
            <el-select v-model="searchForm.method" placeholder="请选择请求方法" clearable>
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态码">
            <el-input v-model="searchForm.status" placeholder="请输入状态码" clearable />
          </el-form-item>
          <el-form-item label="IP地址">
            <el-input v-model="searchForm.ip" placeholder="请输入IP地址" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 操作按钮 -->
        <div class="button-group">
          <el-button 
            type="danger" 
            :disabled="selectedRecords.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 操作记录列表 -->
    <el-table
      v-loading="loading"
      :data="recordList"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="操作人" width="120">
        <template #default="scope">
          <span :class="{ 'system-user': scope.row.user_id === 0 }">
            {{ formatUser(scope.row.user, scope.row) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="日期" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态码" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="请求IP" width="140" />
      <el-table-column prop="method" label="请求方法" width="100">
        <template #default="scope">
          <el-tag :type="getMethodType(scope.row.method)">{{ scope.row.method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="请求路径" min-width="180" show-overflow-tooltip />
      <!-- 移除请求和响应的数据展示列 -->
      <el-table-column label="操作" fixed="right" width="180">
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            @click="handleViewDetail(scope.row.id)"
          >
            <el-icon><View /></el-icon>详情
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(scope.row)"
          >
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 详情对话框 -->
    <el-dialog
      title="操作记录详情"
      v-model="detailDialogVisible"
      width="70%"
      destroy-on-close
    >
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作人">
            {{ currentRecord ? formatUser(currentRecord.user, currentRecord) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ currentRecord ? formatDate(currentRecord.created_at) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="请求方法">
            <el-tag v-if="currentRecord && currentRecord.method" :type="getMethodType(currentRecord.method)">
              {{ currentRecord.method }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态码">
            <el-tag v-if="currentRecord && currentRecord.status !== undefined" :type="getStatusType(currentRecord.status)">
              {{ currentRecord.status }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="请求IP">
            {{ currentRecord?.ip || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="请求耗时">
            {{ currentRecord ? formatLatency(currentRecord.latency) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="请求路径" :span="2">
            {{ currentRecord?.path || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="请求内容" :span="2">
            <div class="json-content-wrapper">
              <div class="json-content">
                <pre>{{ currentRecord ? formatJson(currentRecord.body) : '-' }}</pre>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="响应内容" :span="2">
            <div class="json-content-wrapper">
              <div class="json-content">
                <pre>{{ currentRecord ? formatJson(currentRecord.resp) : '-' }}</pre>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord?.error_message" label="错误信息" :span="2">
            <div class="error-message">{{ currentRecord.error_message }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="closeDetailDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="SystemOperationRecord">
import { Search, Refresh, Delete, InfoFilled, View } from '@element-plus/icons-vue'
import { useOperationRecord } from './modules/operationRecord/useOperationRecord'

// 使用解耦后的逻辑
const {
  searchForm,
  recordList,
  loading,
  pagination,
  selectedRecords,
  currentRecord,
  detailDialogVisible,
  detailLoading,
  handleSearch,
  resetSearch,
  handlePageChange,
  handleSizeChange,
  handleSelectionChange,
  handleDelete,
  handleBatchDelete,
  handleViewDetail,
  closeDetailDialog,
  formatDate,
  formatLatency,
  getStatusType,
  getMethodType,
  formatJson,
  formatUser
} = useOperationRecord()
</script>

<style lang="scss" scoped>
@import './modules/operationRecord/operationRecord.scss';
</style>