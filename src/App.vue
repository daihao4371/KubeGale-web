<template>
  <router-view />
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    '微软雅黑', Arial, sans-serif;
  background-color: #f5f7fa;
}

#app {
  height: 100vh;
}

.el-card {
  border-radius: 4px;
  border: none;

  &.is-always-shadow {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
}

.el-menu-item.is-active {
  background-color: #1890ff !important;
}
</style>
