<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>页面不存在</h2>
    <el-button type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>

<script lang="ts" setup name="NotFoundPage">
import { useRouter } from 'vue-router'

// 获取路由实例
const router = useRouter()

// 返回首页方法
const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;

  h1 {
    font-size: 120px;
    margin: 0;
    color: #409eff;
  }

  h2 {
    margin: 20px 0 40px;
  }
}
</style>
