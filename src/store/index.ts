import { createStore } from 'vuex'
import { getToken, setToken, removeToken } from '@/utils/auth'
import service from '@/api/system/service'
import { API_URLS } from '@/api/system/config'
import { ElMessage } from 'element-plus'

export default createStore({
  state: {
    token: getToken() || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  },
  getters: {
    token: state => state.token,
    userInfo: state => state.userInfo
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    CLEAR_USER_INFO(state) {
      state.token = ''
      state.userInfo = {}
      removeToken()
      localStorage.removeItem('userInfo')
    }
  },
  actions: {
    // 登录
    login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        service.post(API_URLS.login, userInfo)
          .then(response => {
            const { data } = response
            if (data.code === 0) {
              commit('SET_TOKEN', data.data.token)
              setToken(data.data.token)
              resolve(data)
            } else {
              reject(data.msg || '登录失败')
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    
    // 退出登录
    logout({ commit }) {
      return new Promise((resolve, reject) => {
        service.post(API_URLS.logout)
          .then(response => {
            const { data } = response
            if (data.code === 0) {
              commit('CLEAR_USER_INFO')
              ElMessage.success(data.msg || 'JWT作废成功')
              resolve(data)
            } else {
              reject(data.msg || '退出失败')
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  },
  modules: {}
})
