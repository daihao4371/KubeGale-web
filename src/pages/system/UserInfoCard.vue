<template>
  <el-card class="user-info-card" shadow="hover">
    <template #header v-if="showHeader">
      <div class="card-header">
        <span>用户信息</span>
        <el-button type="primary" size="small" @click="refreshUserInfo">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </template>
    
    <div v-loading="loading" class="user-info-content">
      <div v-if="userInfo" class="user-profile">
        <div class="user-avatar">
          <el-avatar :size="100" :src="userInfo.headerImg">
            {{ userInfo.userName ? userInfo.userName.substring(0, 1).toUpperCase() : 'U' }}
          </el-avatar>
        </div>
        
        <div class="user-details">
          <div class="detail-item">
            <span class="label">用户名：</span>
            <span class="value">{{ userInfo.userName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">昵称：</span>
            <span class="value">{{ userInfo.nickName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">手机号：</span>
            <span class="value">{{ userInfo.phone || '未设置' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">邮箱：</span>
            <span class="value">{{ userInfo.email || '未设置' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">角色：</span>
            <div class="value roles">
              <el-tag 
                v-for="(authority, index) in userInfo.authorities" 
                :key="authority.authorityId"
                :type="getRoleTagType(authority.authorityId)"
                size="small" 
                effect="plain"
                style="margin-right: 4px; margin-bottom: 4px;"
              >
                {{ authority.authorityName }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无用户信息" />
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { defineProps, defineExpose } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useUserInfoCard } from './modules/users/components/useUserInfoCard'

const props = defineProps({
  userId: {
    type: Number,
    default: undefined
  },
  showHeader: {
    type: Boolean,
    default: true
  }
})

const { loading, userInfo, refreshUserInfo, getRoleTagType } = useUserInfoCard(props.userId)

defineExpose({
  refreshUserInfo
})
</script>

<style lang="scss" scoped>
@import './modules/users/components/userInfoCard.scss';
</style>