<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => route.query.id)

interface CourseForm {
  name: string
  month: string
  fee: number | undefined
  students: number[]
}

const formRef = ref<FormInstance>()
const loading = ref(false)

const courseForm = reactive<CourseForm>({
  name: '',
  month: '',
  fee: undefined,
  students: []
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  month: [
    { required: true, message: '请选择年月', trigger: 'change' }
  ],
  fee: [
    { required: true, message: '请输入课程费用', trigger: 'blur' },
    { type: 'number', min: 0, message: '费用必须大于等于0', trigger: 'blur' }
  ],
  students: [
    { required: true, message: '请选择学生', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个学生', trigger: 'change' }
  ]
}

// 模拟学生列表数据
const studentOptions = ref([
  { id: 1, name: '李同学' },
  { id: 2, name: '王同学' },
  { id: 3, name: '张同学' }
])

// 处理表单提交
const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 这里应该调用创建/编辑课程的 API
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用

        ElMessage.success(isEdit.value ? '课程更新成功' : '课程创建成功')
        router.push('/teacher/courses')
      } catch (error) {
        ElMessage.error('操作失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 处理取消
const handleCancel = () => {
  router.back()
}

// 如果是编辑模式，获取课程详情
onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      // 这里应该调用获取课程详情的 API
      // 模拟数据
      const courseDetail = {
        name: '高中数学',
        month: '2024-03',
        fee: 500,
        students: [1, 2]
      }
      Object.assign(courseForm, courseDetail)
    } catch (error) {
      ElMessage.error('获取课程信息失败')
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <div class="course-form">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="handleCancel">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>{{ isEdit ? '编辑课程' : '创建课程' }}</h2>
      </div>
    </div>

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="courseForm"
        :rules="rules"
        label-position="top"
        :disabled="loading"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input
            v-model="courseForm.name"
            placeholder="请输入课程名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="年月" prop="month">
          <el-date-picker
            v-model="courseForm.month"
            type="month"
            placeholder="请选择年月"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>

        <el-form-item label="课程费用" prop="fee">
          <el-input-number
            v-model="courseForm.fee"
            :min="0"
            :precision="2"
            :step="100"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="选择学生" prop="students">
          <el-select
            v-model="courseForm.students"
            multiple
            placeholder="请选择学生"
            style="width: 100%"
          >
            <el-option
              v-for="student in studentOptions"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <div class="form-buttons">
            <el-button @click="handleCancel">取消</el-button>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleSubmit(formRef)"
            >
              {{ isEdit ? '保存' : '创建' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.course-form {
  .page-header {
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }
  }

  .form-card {
    max-width: 800px;

    .form-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .course-form {
    .form-card {
      .el-form-item {
        margin-bottom: 24px;
      }

      .form-buttons {
        flex-direction: column-reverse;
        gap: 12px;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
