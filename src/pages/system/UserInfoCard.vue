<template>
  <div class="user-info-card" v-loading="loading">
    <div class="avatar-section">
      <el-avatar :size="100" :src="userInfo.headerImg">
        {{ userInfo.userName ? userInfo.userName.substring(0, 1).toUpperCase() : 'U' }}
      </el-avatar>
      <el-upload
        class="avatar-uploader"
        action="#"
        :http-request="uploadAvatar"
        :show-file-list="false"
        accept="image/*"
      >
        <el-button size="small" type="primary" plain>
          <el-icon><Upload /></el-icon>更换头像
        </el-button>
      </el-upload>
    </div>
    
    <el-divider />
    
    <div class="info-section">
      <el-form label-width="80px" label-position="left">
        <!-- 用户名 -->
        <el-form-item label="用户名">
          <div class="editable-item">
            <span v-if="!editingField.userName">{{ userInfo.userName || '-' }}</span>
            <el-input v-else v-model="editForm.userName" placeholder="请输入用户名" />
            
            <div class="edit-actions">
              <el-button v-if="!editingField.userName" type="primary" link @click="startEdit('userName')">
                <el-icon><Edit /></el-icon>
              </el-button>
              <template v-else>
                <el-button type="success" link @click="saveEdit('userName')">
                  <el-icon><Check /></el-icon>
                </el-button>
                <el-button type="danger" link @click="cancelEdit('userName')">
                  <el-icon><Close /></el-icon>
                </el-button>
              </template>
            </div>
          </div>
        </el-form-item>
        
        <!-- 昵称 -->
        <el-form-item label="昵称">
          <div class="editable-item">
            <span v-if="!editingField.nickName">{{ userInfo.nickName || '-' }}</span>
            <el-input v-else v-model="editForm.nickName" placeholder="请输入昵称" />
            
            <div class="edit-actions">
              <el-button v-if="!editingField.nickName" type="primary" link @click="startEdit('nickName')">
                <el-icon><Edit /></el-icon>
              </el-button>
              <template v-else>
                <el-button type="success" link @click="saveEdit('nickName')">
                  <el-icon><Check /></el-icon>
                </el-button>
                <el-button type="danger" link @click="cancelEdit('nickName')">
                  <el-icon><Close /></el-icon>
                </el-button>
              </template>
            </div>
          </div>
        </el-form-item>
        
        <!-- 手机号 -->
        <el-form-item label="手机号">
          <div class="editable-item">
            <span v-if="!editingField.phone">{{ userInfo.phone || '-' }}</span>
            <el-input v-else v-model="editForm.phone" placeholder="请输入手机号" />
            
            <div class="edit-actions">
              <el-button v-if="!editingField.phone" type="primary" link @click="startEdit('phone')">
                <el-icon><Edit /></el-icon>
              </el-button>
              <template v-else>
                <el-button type="success" link @click="saveEdit('phone')">
                  <el-icon><Check /></el-icon>
                </el-button>
                <el-button type="danger" link @click="cancelEdit('phone')">
                  <el-icon><Close /></el-icon>
                </el-button>
              </template>
            </div>
          </div>
        </el-form-item>
        
        <!-- 邮箱 -->
        <el-form-item label="邮箱">
          <div class="editable-item">
            <span v-if="!editingField.email">{{ userInfo.email || '-' }}</span>
            <el-input v-else v-model="editForm.email" placeholder="请输入邮箱" />
            
            <div class="edit-actions">
              <el-button v-if="!editingField.email" type="primary" link @click="startEdit('email')">
                <el-icon><Edit /></el-icon>
              </el-button>
              <template v-else>
                <el-button type="success" link @click="saveEdit('email')">
                  <el-icon><Check /></el-icon>
                </el-button>
                <el-button type="danger" link @click="cancelEdit('email')">
                  <el-icon><Close /></el-icon>
                </el-button>
              </template>
            </div>
          </div>
        </el-form-item>
        
        <!-- 移除用户角色展示 -->
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { Edit, Check, Close, Upload } from '@element-plus/icons-vue'
import { useUserInfoCard } from './modules/users/components/useUserInfoCard'

const props = defineProps({
  userId: {
    type: Number,
    default: undefined
  }
})

// 使用解耦后的逻辑
const {
  userInfo,
  loading,
  editForm,
  editingField,
  refreshUserInfo,
  startEdit,
  cancelEdit,
  saveEdit,
  uploadAvatar
} = useUserInfoCard(props.userId)

// 组件挂载时获取用户信息
onMounted(() => {
  refreshUserInfo()
})

// 暴露刷新方法给父组件
defineExpose({
  refreshUserInfo
})
</script>

<style lang="scss" scoped>
@import './modules/users/components/userInfoCard.scss';
</style>