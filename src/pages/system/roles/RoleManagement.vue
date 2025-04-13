<template>
  <div class="role-management-container">
    <el-card class="role-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">角色管理</span>
          <el-button type="primary" @click="openAddRoleDialog">
            <el-icon><Plus /></el-icon>新增角色
          </el-button>
        </div>
      </template>
      
      <!-- 角色列表表格 -->
      <el-table
        v-loading="loading"
        :data="roleList"
        v-bind="tableConfig"
        row-key="authorityId"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="role-table"
      >
        <!-- 角色ID列 -->
        <el-table-column
          prop="authorityId"
          label="角色ID"
          min-width="100"
        />
        
        <!-- 角色名称列 -->
        <el-table-column
          prop="authorityName"
          label="角色名称"
          min-width="150"
        />
        
        <!-- 创建时间列 -->
        <el-table-column
          prop="CreatedAt"
          label="创建时间"
          min-width="180"
        >
          <template #default="scope">
            {{ formatDate(scope.row.CreatedAt) }}
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column
          label="操作"
          min-width="380"
          fixed="right"
        >
          <template #default="scope">
            <div class="operation-buttons">
              <!-- 移除了查看按钮 -->
              
              <el-button
                type="primary"
                link
                @click="editRole(scope.row)"
              >
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              
              <!-- 修改设置权限按钮的点击事件 -->
              <el-button
                type="primary"
                link
                @click="openSetPermissionDialog(scope.row)"
              >
                <el-icon><Setting /></el-icon>设置权限
              </el-button>
              
              <!-- 修改新增子角色按钮的点击事件 -->
              <el-button
                type="primary"
                link
                @click="openAddChildRoleDialog(scope.row)"
              >
                <el-icon><Plus /></el-icon>新增子角色
              </el-button>
              
              <!-- 新增的拷贝按钮 -->
              <el-button
                type="primary"
                link
                @click="openCopyRoleDialog(scope.row)"
              >
                <el-icon><CopyDocument /></el-icon>拷贝
              </el-button>
              
              <el-button
                type="danger"
                link
                @click="deleteRole(scope.row)"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 新增角色对话框 -->
    <el-dialog
      v-model="addRoleDialogVisible"
      title="新增角色"
      width="500px"
      class="role-edit-dialog"
    >
      <el-form
        ref="addRoleFormRef"
        :model="addRoleForm"
        :rules="addRoleRules"
        label-width="100px"
      >
        <el-form-item label="父级角色" prop="parentId">
          <el-cascader
            v-model="addRoleForm.parentId"
            :options="cascaderRoleOptions"
            :props="{
              checkStrictly: true,
              value: 'authorityId',
              label: 'authorityName',
              emitPath: false
            }"
            placeholder="请选择父级角色"
            clearable
            class="w-full"
          >
            <template #default="{ node, data }">
              <span>{{ data.authorityName }}</span>
            </template>
          </el-cascader>
        </el-form-item>
        
        <el-form-item label="角色ID" prop="authorityId">
          <el-input-number
            v-model="addRoleForm.authorityId"
            :min="1"
            :max="9999"
            class="w-full"
            placeholder="请输入角色ID"
          />
        </el-form-item>
        
        <el-form-item label="角色名称" prop="authorityName">
          <el-input
            v-model="addRoleForm.authorityName"
            placeholder="请输入角色名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAddRoleDialog">取消</el-button>
          <el-button type="primary" @click="submitAddRole(addRoleFormRef)">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 新增子角色对话框 -->
    <el-dialog
      v-model="addChildRoleDialogVisible"
      title="新增子角色"
      width="500px"
      class="role-edit-dialog"
    >
      <el-form
        ref="addChildRoleFormRef"
        :model="addChildRoleForm"
        :rules="addChildRoleRules"
        label-width="100px"
      >
        <el-form-item label="父级角色">
          <el-input v-model="addChildRoleForm.parentName" disabled />
        </el-form-item>
        
        <el-form-item label="角色ID" prop="authorityId">
          <el-input-number
            v-model="addChildRoleForm.authorityId"
            :min="1"
            :max="9999"
            class="w-full"
            placeholder="请输入角色ID"
          />
        </el-form-item>
        
        <el-form-item label="角色名称" prop="authorityName">
          <el-input
            v-model="addChildRoleForm.authorityName"
            placeholder="请输入角色名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAddChildRoleDialog">取消</el-button>
          <el-button type="primary" @click="submitAddChildRole(addChildRoleFormRef)">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 编辑角色对话框 -->
    <el-dialog
      v-model="editRoleDialogVisible"
      title="编辑角色"
      width="500px"
      class="role-edit-dialog"
    >
      <el-form
        ref="editRoleFormRef"
        :model="editRoleForm"
        :rules="editRoleRules"
        label-width="100px"
      >
        <el-form-item label="父级角色" prop="parentId">
          <el-cascader
            v-model="editRoleForm.parentId"
            :options="cascaderRoleOptions"
            :props="{
              checkStrictly: true,
              value: 'authorityId',
              label: 'authorityName',
              emitPath: false,
              disabled: (data: any) => data.authorityId === editRoleForm.authorityId
            }"
            placeholder="请选择父级角色"
            :clearable="true"
            class="w-full"
          >
            <template #default="{ node, data }">
              <span>{{ data.authorityName }}</span>
            </template>
          </el-cascader>
        </el-form-item>
        
        <el-form-item label="角色ID">
          <el-input-number
            v-model="editRoleForm.authorityId"
            :min="1"
            :max="9999"
            class="w-full"
            disabled
          />
        </el-form-item>
        
        <el-form-item label="角色名称" prop="authorityName">
          <el-input
            v-model="editRoleForm.authorityName"
            placeholder="请输入角色名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeEditRoleDialog">取消</el-button>
          <el-button type="primary" @click="submitEditRole(editRoleFormRef)">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 拷贝角色对话框 -->
    <el-dialog
      v-model="copyRoleDialogVisible"
      title="拷贝角色"
      width="500px"
      class="role-edit-dialog"
    >
      <el-form
        ref="copyRoleFormRef"
        :model="copyRoleForm"
        :rules="copyRoleRules"
        label-width="100px"
      >
        <el-form-item label="原角色">
          <el-input v-model="copyRoleForm.oldAuthorityName" disabled />
        </el-form-item>
        
        <el-form-item label="父级角色" prop="parentId">
          <el-cascader
            v-model="copyRoleForm.parentId"
            :options="cascaderRoleOptions"
            :props="{
              checkStrictly: true,
              value: 'authorityId',
              label: 'authorityName',
              emitPath: false,
              disabled: (data: any) => data.authorityId === copyRoleForm.oldAuthorityId
            }"
            placeholder="请选择父级角色"
            clearable
            class="w-full"
          >
            <template #default="{ node, data }">
              <span>{{ data.authorityName }}</span>
            </template>
          </el-cascader>
        </el-form-item>
        
        <el-form-item label="角色ID" prop="authorityId">
          <el-input-number
            v-model="copyRoleForm.authorityId"
            :min="1"
            :max="9999"
            class="w-full"
            placeholder="请输入角色ID"
          />
        </el-form-item>
        
        <el-form-item label="角色名称" prop="authorityName">
          <el-input
            v-model="copyRoleForm.authorityName"
            placeholder="请输入角色名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeCopyRoleDialog">取消</el-button>
          <el-button type="primary" @click="submitCopyRole(copyRoleFormRef)">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 添加设置权限对话框 -->
    <el-dialog
      v-model="setPermissionDialogVisible"
      :title="`设置权限 - ${currentRole?.authorityName || ''}`"
      width="700px"
      class="role-permission-dialog"
      @closed="closeSetPermissionDialog"
    >
      <el-tabs v-model="activePermissionTab" class="permission-tabs">
        <!-- 资源权限标签页 -->
        <el-tab-pane label="资源权限" name="资源权限">
          <div class="resource-notice">
            <el-alert
              title="资源权限用于控制角色可访问的数据范围"
              type="info"
              :closable="false"
              show-icon
            />
          </div>
          
          <div class="resource-buttons">
            <el-button type="primary" @click="selectAllResources">全选</el-button>
            <el-button type="primary" @click="selectCurrentRoleResources">本角色</el-button>
            <el-button type="primary" @click="selectCurrentAndChildrenResources">本角色及子角色</el-button>
            <el-button type="primary" class="confirm-btn" @click="submitPermissionSettings">确定</el-button>
          </div>
          
          <div class="resource-list">
            <el-checkbox
              v-for="item in resourcePermissions"
              :key="item.authorityId"
              v-model="item.checked"
              :label="item.authorityName"
              @change="(checked: boolean) => handleResourceCheckChange(item, checked)"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="角色菜单" name="角色菜单">
          <div class="menu-search">
            <el-input 
              v-model="menuSearchKeyword" 
              placeholder="筛选" 
              clearable 
              class="search-input" 
            />
            <el-button 
              type="primary" 
              class="confirm-btn"
              @click="submitPermissionSettings"
            >
              确定
            </el-button>
          </div>
          
          <!-- 角色菜单树 -->
          <el-tree
            ref="menuTreeRef"
            :data="filteredMenuPermissions"
            show-checkbox
            node-key="id"
            :default-checked-keys="selectedMenus"
            :props="{ children: 'children', label: 'label' }"
            class="permission-tree"
            @check="handleMenuTreeCheck"
          >
            <template #default="{ node, data }">
              <span>{{ data.label }}</span>
              <span v-if="data.path" class="menu-path">{{ data.path }}</span>
            </template>
          </el-tree>
        </el-tab-pane>
        
        <el-tab-pane label="角色api" name="角色api">
          <div class="api-search">
            <el-input 
              v-model="apiNameSearchKeyword" 
              placeholder="筛选名字" 
              clearable 
              class="search-input" 
            />
            <el-input 
              v-model="apiPathSearchKeyword" 
              placeholder="筛选路径" 
              clearable 
              class="search-input" 
            />
            <el-button 
              type="primary" 
              class="confirm-btn"
              @click="submitPermissionSettings"
            >
              确定
            </el-button>
          </div>
          
          <el-tree
            ref="apiTreeRef"
            :data="filteredApiPermissions"
            show-checkbox
            node-key="id"
            :default-checked-keys="selectedApis"
            :props="{ children: 'children', label: 'label' }"
            class="permission-tree"
            @check="handleApiTreeCheck"
          >
            <template #default="{ node, data }">
              <span v-if="!data.path">{{ data.label }}</span>
              <div v-else class="api-node">
                <span>{{ data.label }}</span>
                <span class="api-path">{{ data.path }}</span>
                <el-tag v-if="data.method" size="small" :type="getMethodType(data.method)">
                  {{ data.method }}
                </el-tag>
              </div>
            </template>
          </el-tree>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Plus, Edit, Delete, Setting, CopyDocument } from '@element-plus/icons-vue'
import { useRoleManagement } from '../modules/roles/useRoleManagement'
import { useRolePermission } from '../modules/roles/useRolePermission'
import { AuthorityData } from '@/api/system/roles/authority'
import { ElMessage } from 'element-plus'

// 导入 ResourceAuthorityItem 类型或在此定义
interface ResourceAuthorityItem extends AuthorityData {
  checked?: boolean
}

// 表单引用
const addRoleFormRef = ref()
const addChildRoleFormRef = ref()
const editRoleFormRef = ref()
const copyRoleFormRef = ref()
// 删除这行，因为我们将使用从 useRolePermission 中获取的 menuTreeRef
// const menuTreeRef = ref<any>(null) // 添加菜单树的引用

// 使用角色管理逻辑
const {
  roleList,
  loading,
  tableConfig,
  fetchRoleList,
  editRole,
  deleteRole,
  cascaderRoleOptions,
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
  submitEditRole,
  // 拷贝角色相关
  copyRoleDialogVisible,
  copyRoleForm,
  copyRoleRules,
  openCopyRoleDialog,
  closeCopyRoleDialog,
  submitCopyRole,
} = useRoleManagement()

// 使用角色权限管理逻辑
const {
  setPermissionDialogVisible,
  currentRole,
  activePermissionTab,
  menuPermissions,
  resourcePermissions,
  selectedMenus,
  selectedResources,
  menuSearchKeyword,
  apiPermissions,
  selectedApis,
  apiNameSearchKeyword,
  apiPathSearchKeyword,
  filteredMenuPermissions,
  filteredApiPermissions,
  openSetPermissionDialog,
  closeSetPermissionDialog,
  submitPermissionSettings,
  selectAllResources,
  selectCurrentRoleResources,
  selectCurrentAndChildrenResources,
  getMethodType,
  menuTreeRef // 从 useRolePermission 中获取 menuTreeRef
} = useRolePermission(roleList as any) // 使用类型断言解决类型不兼容问题

// 处理资源权限选中状态变化
const handleResourceCheckChange = (item: ResourceAuthorityItem, checked: boolean) => {
  if (checked) {
    if (!selectedResources.value.includes(item.authorityId)) {
      selectedResources.value.push(item.authorityId)
    }
  } else {
    selectedResources.value = selectedResources.value.filter(id => id !== item.authorityId)
  }
}

// 处理API树选中状态变化
const handleApiTreeCheck = (data: any, checkedNodes: { checkedKeys: (string | number)[] }) => {
  selectedApis.value = checkedNodes.checkedKeys
}

// 处理菜单树选中状态变化
const handleMenuTreeCheck = (data: any, checkedNodes: any) => {
  // 确保我们获取所有选中的节点ID（包括半选中的父节点）
  if (checkedNodes && checkedNodes.checkedKeys) {
    selectedMenus.value = checkedNodes.checkedKeys
  } else if (checkedNodes && Array.isArray(checkedNodes)) {
    // 兼容不同版本的Element Plus
    selectedMenus.value = checkedNodes
  }
}

// 获取完整菜单节点信息的方法
const getSelectedMenuNodes = () => {
  if (!menuTreeRef.value) return [];
  
  // 获取所有选中的节点（包括半选中的节点）
  const checkedNodes = menuTreeRef.value.getCheckedNodes(true);
  const halfCheckedNodes = menuTreeRef.value.getHalfCheckedNodes();
  
  // 合并所有选中的节点，确保每个节点都有path属性
  return [...checkedNodes, ...halfCheckedNodes].map(node => ({
    id: node.id,
    label: node.label,
    path: node.path || '/', // 确保path不为空，默认使用根路径
    parentId: node.parentId,
    children: node.children
  }));
}

// 判断是否为子角色（防止选择自己的子角色作为父级）
const isChildRole = (role: AuthorityData, parentId: number): boolean => {
  if (role.parentId === parentId) {
    return true
  }
  
  // 递归检查子角色
  if (role.children && role.children.length > 0) {
    return role.children.some(child => isChildRole(child, parentId))
  }
  
  return false
}

// 判断是否为当前角色本身
const isChildRoleOrSelf = (role: AuthorityData, currentRoleId: number): boolean => {
  // 只禁用当前角色本身
  return role.authorityId === currentRoleId;
}

// 显示功能开发中的消息
const showDevelopingMessage = (feature: string) => {
  ElMessage({
    message: `${feature}功能正在开发中，敬请期待！`,
    type: 'info'
  })
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时获取角色列表
onMounted(() => {
  fetchRoleList()
})
</script>

<style lang="scss">
@import '../modules/roles/styles/roleStyles.scss';
@import '../modules/roles/styles/permissionStyles.scss'; // 添加权限样式导入
</style>