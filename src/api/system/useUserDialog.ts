import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { signup, updateUser } from './userManage'

// 用户表单数据接口
interface UserFormData {
  username: string;
  password?: string;  // 改为可选
  confirmPassword?: string;  // 改为可选
  realName: string;
  mobile: string;
  feiShuUserId: string;
  description: string;
}

// 用户对话框属性接口
interface UserDialogProps {
  visible: boolean;
  loading: boolean;
  isEdit: boolean;
  userData: Record<string, any>;
}

export function useUserDialog(props: UserDialogProps, emit: any) {
  // 表单引用
  const formRef = ref<FormInstance>();

  // 密码可见性
  const passwordVisible = ref(false);
  const confirmVisible = ref(false);

  // 提交状态
  const submitting = ref(false);

  // 表单数据
  const form = reactive<UserFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    mobile: '',
    feiShuUserId: '',
    description: ''
  });

  // 监听userData变化，用于编辑模式
  watch(() => props.userData, (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      Object.keys(form).forEach(key => {
        if (key !== 'password' && key !== 'confirmPassword') {
          // @ts-ignore
          form[key] = newVal[key] || '';
        }
      });
    }
  }, { immediate: true, deep: true });

  // 表单验证规则 - 分离创建和编辑的规则
  const createRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: Function) => {
          if (value !== form.password) {
            callback(new Error('两次输入的密码不一致'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ],
    realName: [
      { required: true, message: '请输入真实姓名', trigger: 'blur' }
    ],
    mobile: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
  };

  const editRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    realName: [
      { required: true, message: '请输入真实姓名', trigger: 'blur' }
    ],
    mobile: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
  };

  // 根据模式选择规则
  const rules = computed(() => props.isEdit ? editRules : createRules);

  // 取消
  const handleCancel = () => {
    emit('update:visible', false);
    emit('cancel');
    resetForm();
  };

  // 验证指定字段
  const validateFields = async (fields: string[]) => {
    if (!formRef.value) return false;
    
    try {
      await Promise.all(fields.map(field => 
        formRef.value!.validateField(field)
      ));
      return true;
    } catch (error) {
      return false;
    }
  };

  // 重置表单
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
    
    Object.keys(form).forEach(key => {
      // @ts-ignore
      form[key] = '';
    });
    
    passwordVisible.value = false;
    confirmVisible.value = false;
  };

  // 创建用户
  const handleCreate = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid, fields) => {
      if (valid) {
        submitting.value = true;
        try {
          // 确保包含所有必需的字段，包括confirmPassword
          const createData = {
            username: form.username,
            password: form.password || '',
            confirmPassword: form.confirmPassword || '',
            realName: form.realName,
            mobile: form.mobile,
            email: form.mobile ? `${form.mobile}@qq.com` : '', // 添加默认邮箱
            headerImg: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', // 添加默认头像
            feiShuUserId: form.feiShuUserId,
            description: form.description,
            authorityId: 2, // 默认为普通用户
            enable: 1 // 默认启用
          };
          
          // 创建用户
          const response = await signup(createData);
          
          if (response.data.code === 0) {
            ElMessage.success('用户创建成功');
            emit('success');
            emit('update:visible', false);
            resetForm();
          } else {
            ElMessage.error(response.data.msg || '创建用户失败');
          }
        } catch (error) {
          console.error('创建用户失败:', error);
          ElMessage.error('创建用户失败，请重试');
        } finally {
          submitting.value = false;
        }
      }
    });
  };

  // 更新用户
  const handleUpdate = async () => {
    if (!formRef.value) return;
    
    // 只验证编辑模式需要的字段
    const editFields = ['username', 'realName', 'mobile', 'feiShuUserId', 'description'];
    const editValid = await validateFields(editFields);
    
    if (editValid) {
      submitting.value = true;
      try {
        // 编辑用户时，创建新对象，字段名与后端一致
        const updateData = {
          user_id: props.userData.id,
          username: form.username,
          real_name: form.realName || props.userData.realName || '',
          mobile: form.mobile || props.userData.mobile || '',
          email: form.mobile ? `${form.mobile}@qq.com` : (props.userData.email || ''), // 添加邮箱
          header_img: props.userData.headerImg || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', // 保留头像
          fei_shu_user_id: form.feiShuUserId || props.userData.feiShuUserId || '',
          desc: form.description || props.userData.description || '',
          account_type: props.userData.accountType || props.userData.authorityId || 2,
          enable: props.userData.enable || 1
        };
        
        // 使用updateUser函数
        const response = await updateUser(updateData);
        
        if (response.data.code === 0) {
          ElMessage.success('用户更新成功');
          emit('success');
          emit('update:visible', false);
          resetForm();
        } else {
          ElMessage.error(response.data.msg || '更新用户失败');
        }
      } catch (error) {
        console.error('更新用户失败:', error);
        ElMessage.error('更新用户失败，请重试');
      } finally {
        submitting.value = false;
      }
    }
  };

  return {
    formRef,
    form,
    rules,
    passwordVisible,
    confirmVisible,
    submitting,
    handleCancel,
    handleCreate,
    handleUpdate
  };
}