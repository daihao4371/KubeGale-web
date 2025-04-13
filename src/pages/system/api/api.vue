<template>
  <div class="api-container">
    <div class="api-header">
      <h2>API管理</h2>
      <div class="operation-bar">
        <!-- 搜索区域 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="API名称">
            <el-input v-model="searchForm.name" placeholder="请输入API名称" clearable />
          </el-form-item>
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
          <!-- API分组选择器 -->
          <el-form-item label="API分组">
            <el-select 
              v-model="searchForm.apiGroup" 
              placeholder="请选择API分组" 
              clearable 
              class="api-group-select"
              filterable
              popper-class="api-group-dropdown"
            >
              <el-option 
                v-for="group in apiGroups" 
                :key="group" 
                :label="group" 
                :value="group" 
              />
            </el-select>
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
          <el-button type="danger" @click="handleBatchDelete" :disabled="multipleSelection.length === 0">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
          <el-button type="success" @click="handleRefreshCasbin">
            <el-icon><Refresh /></el-icon>刷新缓存
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="ID" label="ID" width="80" />
      <el-table-column prop="name" label="API名称" width="150" show-overflow-tooltip />
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
      <el-table-column label="操作" fixed="right" width="240">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button 
              type="info" 
              link
              @click="handleViewDetail(scope.row)"
            >
              <el-icon><View /></el-icon>详情
            </el-button>
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
          <el-form-item label="API名称" required>
            <el-input v-model="currentApi.name" placeholder="请输入API名称" />
          </el-form-item>
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
          <!-- API分组选择器 -->
          <el-form-item label="API分组" required>
            <el-select 
              v-model="currentApi.apiGroup" 
              placeholder="请选择API分组" 
              filterable 
              allow-create
              default-first-option
              class="api-group-select"
              popper-class="api-group-dropdown"
            >
              <el-option 
                v-for="group in apiGroups" 
                :key="group" 
                :label="group" 
                :value="group" 
              />
            </el-select>
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
import { Search, Refresh, Plus, Edit, Delete, View } from '@element-plus/icons-vue'
import { useApi } from '../modules/api/useApi'
import { ElMessageBox } from 'element-plus'
import type { ApiInfo } from '@/api/system/api/api' // 导入 ApiInfo 类型

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
  apiGroups,
  multipleSelection,
  
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
  handleRefreshCasbin,
  handleSelectionChange,
  handleBatchDelete,
  viewApiDetail,
  
  getMethodType
} = useApi()

// 查看API详情 - 添加类型注解
const handleViewDetail = async (api: ApiInfo) => {
  const apiDetail = await viewApiDetail(api.ID)
  if (apiDetail) {
    // 格式化创建时间和更新时间
    const createdAt = new Date(apiDetail.CreatedAt).toLocaleString()
    const updatedAt = new Date(apiDetail.UpdatedAt).toLocaleString()
    
    // 使用对话框展示详情
    ElMessageBox.alert(
      `<div class="api-detail">
        <p><strong>ID:</strong> ${apiDetail.ID}</p>
        <p><strong>API名称:</strong> ${apiDetail.name || '无'}</p>
        <p><strong>API路径:</strong> ${apiDetail.path}</p>
        <p><strong>请求方法:</strong> ${apiDetail.method}</p>
        <p><strong>API分组:</strong> ${apiDetail.apiGroup}</p>
        <p><strong>API简介:</strong> ${apiDetail.description || '无'}</p>
        <p><strong>创建时间:</strong> ${createdAt}</p>
        <p><strong>更新时间:</strong> ${updatedAt}</p>
      </div>`,
      'API详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭'
      }
    )
  }
}

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

<style lang="scss">
@import '../modules/api/api.scss';
</style>