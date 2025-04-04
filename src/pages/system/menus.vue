<template>
  <div class="menus-container">
    <div class="menus-header">
      <h2>菜单管理</h2>
      <div class="operation-bar">
        <!-- 搜索区域 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="菜单名称">
            <el-input v-model="searchForm.name" placeholder="请输入菜单名称" clearable />
          </el-form-item>
          <el-form-item label="菜单路径">
            <el-input v-model="searchForm.path" placeholder="请输入菜单路径" clearable />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>添加菜单
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 菜单列表 -->
    <el-table
      v-loading="loading"
      :data="menuList"
      border
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      style="width: 100%"
    >
      <el-table-column prop="id" label="菜单ID" width="80" />
      <el-table-column prop="name" label="菜单名称" width="150" />
      <el-table-column prop="path" label="菜单路径" min-width="150" />
      <el-table-column prop="component" label="组件路径" min-width="150" />
      <el-table-column prop="icon" label="图标" width="100">
        <template #default="scope">
          <el-icon v-if="scope.row.icon">
            <component :is="scope.row.icon" />
          </el-icon>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column prop="hidden" label="是否隐藏" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.hidden === 0 ? 'success' : 'info'">
            {{ scope.row.hidden === 0 ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180">
        <template #default="scope">
          {{ scope.row.create_time ? formatDate(scope.row.create_time) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">
            <el-icon><Edit /></el-icon>编辑
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
    
    <!-- 菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="上级菜单" prop="parent_id">
          <el-select v-model="form.parent_id" placeholder="请选择上级菜单">
            <el-option label="顶级菜单" :value="0" />
            <el-option 
              v-for="item in parentMenuOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        
        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入菜单路径" />
        </el-form-item>
        
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="请输入组件路径" />
        </el-form-item>
        
        <el-form-item label="图标" prop="icon">
          <div class="icon-selector">
            <el-input v-model="form.icon" placeholder="请输入图标名称">
              <template #append>
                <el-popover
                  placement="bottom"
                  :width="400"
                  trigger="click"
                >
                  <template #reference>
                    <el-button>选择图标</el-button>
                  </template>
                  <div class="icon-list">
                    <div 
                      v-for="icon in iconList" 
                      :key="icon" 
                      class="icon-item"
                      @click="selectIcon(icon)"
                    >
                      <el-icon>
                        <component :is="icon" />
                      </el-icon>
                      <span class="icon-name">{{ icon }}</span>
                    </div>
                  </div>
                </el-popover>
              </template>
            </el-input>
            <div class="icon-preview" v-if="form.icon">
              <el-icon>
                <component :is="form.icon" />
              </el-icon>
              <span>预览</span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        
        <el-form-item label="路由名称" prop="route_name">
          <el-input v-model="form.route_name" placeholder="请输入路由名称" />
        </el-form-item>
        
        <el-form-item label="是否隐藏" prop="hidden">
          <el-radio-group v-model="form.hidden">
            <el-radio :label="0">显示</el-radio>
            <el-radio :label="1">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="重定向路径" prop="redirect">
          <el-input v-model="form.redirect" placeholder="请输入重定向路径" />
        </el-form-item>
        
        <el-form-item label="菜单标题" prop="meta.title">
          <el-input v-model="form.meta.title" placeholder="请输入菜单标题" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="SystemMenus">
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useMenus } from './modules/menus/useMenus'

// 使用解耦后的逻辑
const {
  searchForm,
  menuList,
  loading,
  dialogVisible,
  isEdit,
  form,
  rules,
  formRef,
  parentMenuOptions,
  iconList,
  selectIcon,
  formatDate,
  handleSearch,
  resetSearch,
  handleAdd,
  handleEdit,
  handleSubmit,
  handleDelete
} = useMenus()
</script>

<style lang="scss" scoped>
@import './modules/menus/menus.scss';

/* 为按钮图标添加右侧间距 */
.el-button .el-icon {
  margin-right: 4px;
}
</style>