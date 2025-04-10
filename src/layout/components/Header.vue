<template>
  <!-- ... 现有代码 ... -->
  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
  <!-- ... 现有代码 ... -->
</template>

<script lang="ts" setup>
import { logout } from '@/utils/logout'

// ... 现有代码 ...

// 处理退出登录
const handleLogout = () => {
  logout()
}

// ... 现有代码 ...
</script>