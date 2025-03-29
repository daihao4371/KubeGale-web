<!-- eslint-disable -->
<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <div class="login-illustration">
          <img src="@/assets/login-illustration.svg" alt="登录插图" />
          <h3>开箱即用的大型平台管理系统</h3>
          <p>智能化的运维管理</p>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-container">
          <h2>欢迎回来 👋</h2>
          <p class="login-subtitle">请输入您的账号和密码登录系统</p>
          
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名" :prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="密码"
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
              >
                <template #suffix>
                  <el-icon 
                    class="password-eye" 
                    @click="passwordVisible = !passwordVisible"
                  >
                    <component :is="passwordVisible ? 'View' : 'Hide'" />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <a href="javascript:void(0)" class="forgot-password">忘记密码?</a>
            </div>
            <el-form-item>
              <el-button
                type="primary"
                class="login-button"
                @click="handleLogin"
                :loading="loading"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
          
          <!-- 移除了其他登录方式部分 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="LoginPage">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { login } from '@/api/user'  // 确保这个路径正确
import { setToken } from '@/utils/auth'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)
const passwordVisible = ref(false)  // 添加密码可见性状态

const loginForm = reactive({
  username: 'admin',  // 默认填充用户名为admin
  password: '123456'  // 默认填充密码为123456
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        console.log('开始登录请求...')
        console.log('登录参数:', {
          username: loginForm.username,
          password: loginForm.password
        })
        
        // 使用新的API服务
        const result = await login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        console.log('登录响应数据:', result)
        
        // 根据实际后端返回的数据结构调整
        if (result && result.data) {
          // 处理后端返回的标准格式 {code: 0, data: {...}, msg: '登录成功'}
          if (result.data.code === 0 && result.data.data) {
            const userData = result.data.data;
            // 使用accessToken作为token
            handleLoginSuccess(userData.accessToken, userData.username, userData.realName)
          }
          // 兼容其他可能的数据结构
          else if (result.data.token) {
            handleLoginSuccess(result.data.token, loginForm.username, loginForm.username)
          } 
          else if (result.data.data && result.data.data.token) {
            handleLoginSuccess(result.data.data.token, loginForm.username, loginForm.username)
          }
          else if (result.data.system) {
            const { accessToken, username, realName } = result.data.system
            handleLoginSuccess(accessToken, username, realName)
          }
          else {
            console.error('无法从响应中提取token:', result.data)
            ElMessage.error('登录响应数据格式不正确')
          }
        } 
        else {
          ElMessage.error('登录响应数据格式不正确')
          console.error('无效的响应数据结构:', result)
        }
      } catch (error) {
        console.error('登录请求失败:', error)
        ElMessage.error('登录失败，请检查网络连接或服务器状态')
      } finally {
        loading.value = false
      }
    }
  })
}

// 提取登录成功处理逻辑为单独函数
const handleLoginSuccess = (accessToken: string, username: string, realName: string) => {
  // 保存token到cookie
  setToken(accessToken)
  
  // 保存用户信息到localStorage
  localStorage.setItem(
    'userInfo',
    JSON.stringify({
      username,
      realName
    })
  )
  
  ElMessage.success('登录成功')
  router.push('/')
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #e6f7ff 0%, #e0f2f1 100%);
  
  .login-content {
    display: flex;
    width: 900px;
    height: 600px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    
    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 40px;
      
      .login-illustration {
        text-align: center;
        
        img {
          width: 240px;
          margin-bottom: 30px;
        }
        
        h3 {
          font-size: 24px;
          margin-bottom: 16px;
          font-weight: 500;
        }
        
        p {
          font-size: 14px;
          opacity: 0.8;
        }
      }
    }
    
    .login-right {
      flex: 1;
      background-color: white;
      padding: 40px;
      display: flex;
      align-items: center;
      
      .login-form-container {
        width: 100%;
        
        h2 {
          font-size: 28px;
          margin-bottom: 8px;
          color: #333;
        }
        
        .login-subtitle {
          color: #999;
          margin-bottom: 30px;
        }
        
        .login-form {
          margin-bottom: 20px;
          
          .form-options {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            
            .forgot-password {
              color: #1890ff;
              text-decoration: none;
              
              &:hover {
                text-decoration: underline;
              }
            }
          }
          
          .login-button {
            width: 100%;
            height: 40px;
            font-size: 16px;
          }
        }
      }
    }
  }
}

.password-eye {
  cursor: pointer;
  color: #909399;
  
  &:hover {
    color: #409EFF;
  }
}
</style>@/api/system/user