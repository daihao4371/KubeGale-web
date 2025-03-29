<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h2>欢迎回来，管理员！</h2>
      <p class="time">当前时间: {{ currentTime }}</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="card-title">机器数量</div>
            <div class="card-value">42</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="card-title">在线应用</div>
            <div class="card-value">128</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="card-title">告警数量</div>
            <div class="card-value">7</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="card-title">构建工单</div>
            <div class="card-value">5</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="section-title">最近上线用户</div>
    <el-card shadow="hover" class="user-list">
      <div v-for="(user, index) in recentUsers" :key="index" class="user-item">
        <div class="user-avatar">
          <el-avatar :size="40">{{ user.name.charAt(0) }}</el-avatar>
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-dept">{{ user.department }} · {{ user.time }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup name="DashboardIndex">
import { ref, onMounted } from 'vue'

const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})

const recentUsers = [
  { name: '周小明', department: '技术部门', time: '2023-09-18 10:25' },
  { name: '陈小红', department: '运维部门', time: '2023-09-18 13:05:15' },
  { name: '刘小军', department: '研发部门', time: '2023-09-18 14:32:30' }
]
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .welcome-section {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .time {
      color: #909399;
      font-size: 14px;
    }
  }

  .el-row {
    margin-bottom: 20px;
  }

  .card-content {
    text-align: center;
    padding: 10px 0;

    .card-title {
      font-size: 16px;
      color: #606266;
      margin-bottom: 10px;
    }

    .card-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
    }
  }

  .section-title {
    font-size: 18px;
    font-weight: 500;
    margin: 20px 0 15px 0;
  }

  .user-list {
    margin-bottom: 20px;

    .user-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .user-avatar {
        margin-right: 12px;
      }

      .user-info {
        .user-name {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .user-dept {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
