<template>
  <div class="menu-management-container">
    <el-card class="menu-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">菜单管理</span>
          <div>
            <el-button type="primary" @click="openAddMenuDialog">
              <el-icon><Plus /></el-icon>新增根菜单
            </el-button>
            <el-button type="primary" @click="refreshMenuList">刷新</el-button>
          </div>
        </div>
      </template>
      
      <!-- 菜单列表表格 -->
      <el-table
        v-loading="loading"
        :data="menuList"
        row-key="ID"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="menu-table"
        v-bind="tableConfig"
      >
        <el-table-column align="left" label="ID" min-width="100" prop="ID" />
        
        <el-table-column
          align="left"
          label="展示名称"
          min-width="120"
        >
          <template #default="scope">
            <span>{{ scope.row.meta?.title || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          align="left"
          label="图标"
          min-width="140"
        >
          <template #default="scope">
            <div v-if="scope.row.meta?.icon" class="icon-column">
              <el-icon>
                <component :is="scope.row.meta.icon" />
              </el-icon>
              <span>{{ scope.row.meta.icon }}</span>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <!-- 修改路由Name和路由Path的标签，与数据展示保持一致 -->
        <el-table-column
          align="left"
          label="路由Name"
          show-overflow-tooltip
          min-width="160"
          prop="name"
        />
        
        <el-table-column
          align="left"
          label="路由Path"
          show-overflow-tooltip
          min-width="160"
          prop="path"
        />
        
        <el-table-column
          align="left"
          label="是否隐藏"
          min-width="100"
          prop="hidden"
        >
          <template #default="scope">
            <el-tag :type="scope.row.hidden ? 'info' : 'success'">
              {{ scope.row.hidden ? '隐藏' : '显示' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          align="left"
          label="父节点"
          min-width="90"
          prop="parentId"
        >
          <template #default="scope">
            <div class="parent-node-cell">
              <span v-if="scope.row.parentId !== 0">{{ scope.row.parentId }}</span>
              <el-tag v-else size="small" class="parent-tag">根目录</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column 
          align="left" 
          label="排序" 
          min-width="70" 
          prop="sort" 
        />
        
        <el-table-column
          align="left"
          label="文件路径"
          min-width="360"
          prop="component"
        />
        
        <!-- 替换创建时间列为操作列 -->
        <el-table-column
          label="操作"
          min-width="280"
          fixed="right"
        >
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                type="primary"
                link
                @click="showDevelopingMessage('添加子菜单')"
              >
                <el-icon><Plus /></el-icon>添加子菜单
              </el-button>
              
              <el-button
                type="primary"
                link
                @click="openEditMenuDialog(scope.row)"
              >
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              
              <el-button
                type="danger"
                link
                @click="handleDeleteMenu(scope.row)"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加菜单对话框 -->
    <el-dialog
      v-model="addMenuDialogVisible"
      title="新增根菜单"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="menuFormRules"
        label-width="100px"
      >
        <el-form-item label="路由Path" prop="path">
          <el-input v-model="menuForm.path" placeholder="请输入路由路径，如: dashboard" />
        </el-form-item>
        
        <el-form-item label="路由Name" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入路由名称，如: Dashboard" />
        </el-form-item>
        
        <el-form-item label="显示名称" prop="meta.title">
          <el-input v-model="menuForm.meta.title" placeholder="请输入显示名称，如: 仪表盘" />
        </el-form-item>
        
        <el-form-item label="父节点ID">
          <el-select v-model="menuForm.parentId" disabled class="parent-select">
            <el-option :value="0" label="根目录" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="图标" prop="meta.icon">
          <div class="icon-selector-input">
            <el-input v-model="menuForm.meta.icon" placeholder="请选择或输入图标名称">
              <template #prepend>
                <el-icon v-if="menuForm.meta.icon">
                  <component :is="menuForm.meta.icon" />
                </el-icon>
                <span v-else>无</span>
              </template>
              <template #append>
                <el-button @click="openIconSelector">选择图标</el-button>
              </template>
            </el-input>
          </div>
        </el-form-item>
        
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="menuForm.component" placeholder="请输入组件路径，如: view/dashboard/index.vue" />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="menuForm.sort" :min="0" :max="999" />
        </el-form-item>
        
        <el-form-item label="是否隐藏" prop="hidden">
          <el-switch v-model="menuForm.hidden" />
        </el-form-item>
        
        <el-form-item label="是否缓存" prop="meta.keepAlive">
          <el-switch v-model="menuForm.meta.keepAlive" />
        </el-form-item>
        
        <el-form-item label="是否关闭标签" prop="meta.closeTab">
          <el-switch v-model="menuForm.meta.closeTab" />
        </el-form-item>
        
        <el-form-item label="是否基础页面" prop="meta.defaultMenu">
          <el-switch v-model="menuForm.meta.defaultMenu" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addMenuDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMenuForm(menuFormRef)" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 图标选择器对话框 -->
    <el-dialog
      v-model="iconSelectorVisible"
      title="选择图标"
      width="800px"
      append-to-body
    >
      <div class="icon-selector-container">
        <div class="icon-search-bar">
          <el-input v-model="iconSearchText" placeholder="搜索图标" clearable class="icon-search">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-radio-group v-model="selectedCategory" size="small" class="category-selector">
            <el-radio-button label="全部">全部</el-radio-button>
            <el-radio-button v-for="category in iconCategories" :key="category" :label="category">
              {{ category }}
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="icon-list">
          <div
            v-for="icon in filteredIcons"
            :key="icon.name"
            class="icon-item"
            :class="{ 'is-selected': selectedIcon === icon.name }"
            @click="selectIcon(icon.name)"
          >
            <el-icon>
              <component :is="icon.name" />
            </el-icon>
            <span class="icon-name">{{ icon.name }}</span>
            <span class="icon-label">{{ icon.label }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="iconSelectorVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmIconSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 添加编辑菜单对话框 -->
    <el-dialog
      v-model="editMenuDialogVisible"
      title="编辑菜单"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="editMenuFormRef"
        :model="menuForm"
        :rules="menuFormRules"
        label-width="100px"
      >
        <el-form-item label="路由Path" prop="path">
          <el-input v-model="menuForm.path" placeholder="请输入路由路径，如: dashboard" />
        </el-form-item>
        
        <el-form-item label="路由Name" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入路由名称，如: Dashboard" />
        </el-form-item>
        
        <el-form-item label="显示名称" prop="meta.title">
          <el-input v-model="menuForm.meta.title" placeholder="请输入显示名称，如: 仪表盘" />
        </el-form-item>
        
        <el-form-item label="父节点ID">
          <el-select v-model="menuForm.parentId" disabled class="parent-select">
            <el-option :value="0" label="根目录" />
            <!-- 如果需要支持编辑子菜单，这里可以添加其他菜单项作为父节点 -->
          </el-select>
        </el-form-item>
        
        <el-form-item label="图标" prop="meta.icon">
          <div class="icon-selector-input">
            <el-input v-model="menuForm.meta.icon" placeholder="请选择或输入图标名称">
              <template #prepend>
                <el-icon v-if="menuForm.meta.icon">
                  <component :is="menuForm.meta.icon" />
                </el-icon>
                <span v-else>无</span>
              </template>
              <template #append>
                <el-button @click="openIconSelector">选择图标</el-button>
              </template>
            </el-input>
          </div>
        </el-form-item>
        
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="menuForm.component" placeholder="请输入组件路径，如: view/dashboard/index.vue" />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="menuForm.sort" :min="0" :max="999" />
        </el-form-item>
        
        <el-form-item label="是否隐藏" prop="hidden">
          <el-switch v-model="menuForm.hidden" />
        </el-form-item>
        
        <el-form-item label="是否缓存" prop="meta.keepAlive">
          <el-switch v-model="menuForm.meta.keepAlive" />
        </el-form-item>
        
        <el-form-item label="是否关闭标签" prop="meta.closeTab">
          <el-switch v-model="menuForm.meta.closeTab" />
        </el-form-item>
        
        <el-form-item label="是否基础页面" prop="meta.defaultMenu">
          <el-switch v-model="menuForm.meta.defaultMenu" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editMenuDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditMenuForm(editMenuFormRef)" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { useMenuManagement } from '../modules/menus/useMenuManagement'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { IconItem } from '../modules/menus/icons/iconList'

// 表单引用
const menuFormRef = ref()
const editMenuFormRef = ref() // 新增编辑表单引用

// 图标搜索文本
const iconSearchText = ref('')

// 使用菜单管理逻辑
const {
  menuList,
  loading,
  tableConfig,
  fetchMenuList,
  formatDate,
  handleDeleteMenu,
  addMenuDialogVisible,
  editMenuDialogVisible, // 新增
  menuForm,
  menuFormRules,
  openAddMenuDialog,
  openEditMenuDialog, // 新增
  submitMenuForm,
  submitEditMenuForm, // 新增
  commonIcons,
  iconSelectorVisible,
  selectedIcon,
  openIconSelector,
  selectIcon,
  confirmIconSelection,
  iconCategories,
  selectedCategory,
  selectCategory,
  getIconsByCategory
} = useMenuManagement()

// 过滤图标列表
const filteredIcons = computed(() => {
  // 先按分类筛选
  let icons = selectedCategory.value === '全部' 
    ? commonIcons.value 
    : getIconsByCategory(selectedCategory.value);
  
  // 再按搜索文本筛选
  if (iconSearchText.value) {
    const searchText = iconSearchText.value.toLowerCase()
    icons = icons.filter((icon: IconItem) => 
      icon.name.toLowerCase().includes(searchText) || 
      icon.label.toLowerCase().includes(searchText)
    )
  }
  
  return icons
})

// 刷新菜单列表
const refreshMenuList = () => {
  fetchMenuList()
}

// 显示功能开发中的消息
const showDevelopingMessage = (feature: string) => {
  ElMessage({
    message: `${feature}功能正在开发中，敬请期待！`,
    type: 'info'
  })
}

// 组件挂载时获取菜单列表
onMounted(() => {
  fetchMenuList()
})
</script>

<style lang="scss">
@import '../modules/menus/styles/menuManagement.scss';
</style>