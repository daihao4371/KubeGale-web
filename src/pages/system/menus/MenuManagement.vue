<template>
  <div class="menu-management-container">
    <el-card class="menu-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">菜单管理</span>
          <el-button type="primary" @click="refreshMenuList">刷新</el-button>
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
        />
        
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
                @click="showDevelopingMessage('编辑菜单')"
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
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useMenuManagement } from '../modules/menus/useMenuManagement'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 使用菜单管理逻辑
const {
  menuList,
  loading,
  tableConfig,
  fetchMenuList,
  formatDate,
  handleDeleteMenu
} = useMenuManagement()

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