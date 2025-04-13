<template>
  <div class="api-container">
    <div class="api-header">
      <h2>API管理</h2>
      <div class="operation-bar">
        <!-- 搜索区域 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="API路径">
            <el-input v-model="searchForm.path" placeholder="请输入API路径" clearable />
          </el-form-item>
          <el-form-item label="请求方法">
            <el-select v-model="searchForm.method" placeholder="请选择请求方法" clearable>
              <el-option label="创建(POST)" value="POST" />
              <el-option label="查看(GET)" value="GET" />
              <el-option label="更新(PUT)" value="PUT" />
              <el-option label="删除(DELETE)" value="DELETE" />
            </el-select>
          </el-form-item>
          <el-form-item label="API分组">
            <el-input v-model="searchForm.apiGroup" placeholder="请输入API分组" clearable />
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
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>新增API
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- API列表 -->
    <el-table
      v-loading="loading"
      :data="apiList"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="ID" label="ID" width="80" />
      <!-- 移除name字段的列 -->
      <el-table-column prop="path" label="API路径" min-width="200" show-overflow-tooltip />
      <el-table-column prop="apiGroup" label="API分组" width="150" />
      <el-table-column prop="description" label="API简介" min-width="200" show-overflow-tooltip />
      <el-table-column prop="method" label="请求" width="120">
        <template #default="scope">
          <el-tag :type="getMethodType(scope.row.method)">
            {{ getMethodText(scope.row.method) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <!-- 操作列 -->
      <el-table-column label="操作" fixed="right" width="180">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button 
              type="primary" 
              link
              @click="openEditDialog(scope.row)"
            >
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button 
              type="danger" 
              link
              @click="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </div>
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
    
    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-loading="dialogLoading">
        <el-form :model="currentApi" label-width="100px">
          <!-- 移除name字段的输入框 -->
          <el-form-item label="API路径" required>
            <el-input v-model="currentApi.path" placeholder="请输入API路径，例如：/api/user/getUserInfo" />
          </el-form-item>
          <el-form-item label="请求方法" required>
            <el-select v-model="currentApi.method" placeholder="请选择请求方法">
              <el-option label="创建(POST)" value="POST" />
              <el-option label="查看(GET)" value="GET" />
              <el-option label="更新(PUT)" value="PUT" />
              <el-option label="删除(DELETE)" value="DELETE" />
            </el-select>
          </el-form-item>
          <el-form-item label="API分组" required>
            <el-input v-model="currentApi.apiGroup" placeholder="请输入API分组，例如：用户管理" />
          </el-form-item>
          <el-form-item label="API简介">
            <el-input v-model="currentApi.description" placeholder="请输入API简介" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="dialogLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useApi } from '../modules/api/useApi'

const {
  searchForm,
  apiList,
  loading,
  pagination,
  dialogVisible,
  dialogTitle,
  dialogLoading,
  currentApi,
  isEdit,
  
  fetchApiList,
  handleSearch,
  resetSearch,
  handlePageChange,
  handleSizeChange,
  openAddDialog,
  openEditDialog,
  closeDialog,
  submitForm,
  handleDelete,
  
  getMethodType
} = useApi()

// 获取请求方法的中文文本
const getMethodText = (method: string) => {
  switch (method.toUpperCase()) {
    case 'GET': return '查看(GET)'
    case 'POST': return '创建(POST)'
    case 'PUT': return '更新(PUT)'
    case 'DELETE': return '删除(DELETE)'
    default: return method
  }
}
</script>

<style scoped>
.api-container {
  padding: 20px;
}

.api-header {
  margin-bottom: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.search-form {
  flex: 1;
}

.button-group {
  display: flex;
  align-items: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.operation-buttons {
  display: flex;
  justify-content: space-around;
}
</style>