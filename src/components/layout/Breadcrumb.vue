<template>
  <div class="breadcrumb-container">
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 添加标签页 -->
    <div class="tabs-container">
      <el-tag
        v-for="tag in visitedTags"
        :key="tag.path"
        :type="isActive(tag) ? '' : 'info'"
        :effect="isActive(tag) ? 'dark' : 'plain'"
        class="tab-item"
        @click="handleTabClick(tag)"
        closable
        @close.stop="closeTab(tag)"
      >
        {{ tag.title }}
      </el-tag>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 定义面包屑项的类型
interface BreadcrumbItem {
  title: string
  path: string
}

// 获取当前路由和路由器
const route = useRoute()
const router = useRouter()

// 面包屑数据
const breadcrumbList = ref<BreadcrumbItem[]>([])

// 访问过的标签页
const visitedTags = ref<BreadcrumbItem[]>([
  { title: '欢迎页', path: '/dashboard' }
])

// 更新面包屑
const updateBreadcrumb = () => {
  // 获取路由匹配的所有路由记录，并过滤出有标题的路由
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 将路由记录转换为面包屑项
  breadcrumbList.value = matched.map(item => {
    return {
      title: item.meta.title as string,
      path: item.path
    }
  })
  
  // 更新标签页
  const currentRoute = {
    title: route.meta.title as string || '未命名页面',
    path: route.path
  }
  
  // 如果当前路由不在标签页中，添加它
  const isExist = visitedTags.value.some(tag => tag.path === currentRoute.path)
  if (!isExist && currentRoute.title) {
    visitedTags.value.push(currentRoute)
  }
}

// 判断标签是否激活
const isActive = (tag: {path: string}) => {
  return tag.path === route.path
}

// 点击标签页
const handleTabClick = (tag: {path: string}) => {
  router.push(tag.path)
}

// 关闭标签页
const closeTab = (tag: {path: string}) => {
  // 不允许关闭首页
  if (tag.path === '/dashboard') {
    return
  }
  
  // 移除标签
  const index = visitedTags.value.findIndex(item => item.path === tag.path)
  if (index !== -1) {
    visitedTags.value.splice(index, 1)
  }
  
  // 如果关闭的是当前激活的标签，则跳转到最后一个标签
  if (isActive(tag) && visitedTags.value.length) {
    const latestTag = visitedTags.value[visitedTags.value.length - 1]
    router.push(latestTag.path)
  }
}

// 监听路由变化，更新面包屑
watch(() => route.path, () => {
  updateBreadcrumb()
}, { immediate: true })
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  padding: 0;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  
  .breadcrumb-wrapper {
    padding: 8px 16px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
  }
  
  // 标签页样式
  .tabs-container {
    padding: 8px 16px;
    display: flex;
    flex-wrap: wrap;
    
    .tab-item {
      margin-right: 5px;
      margin-bottom: 5px;
      cursor: pointer;
      user-select: none;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>