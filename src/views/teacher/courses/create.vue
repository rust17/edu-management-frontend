<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import request from '@/http/request'
import { courseEndpoints } from '@/http/endpoints/course'
import { studentEndpoints } from '@/http/endpoints/student'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => route.query.id)

interface CourseForm {
  name: string
  year_month: string
  fee: number | undefined
  student_ids: number[]
}

const formRef = ref<FormInstance>()
const loading = ref(false)

const courseForm = reactive<CourseForm>({
  name: '',
  year_month: '',
  fee: undefined,
  student_ids: []
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { max: 255, message: '课程名称最多 255 个字符', trigger: 'blur' }
  ],
  year_month: [
    { required: true, message: '请选择年月', trigger: 'change' },
    {
      pattern: /^\d{4}-\d{2}$/,
      message: '年月格式必须为YYYY-MM',
      trigger: 'change'
    }
  ],
  fee: [
    { required: true, message: '请输入课程费用', trigger: 'blur' },
    { type: 'number', min: 0, message: '费用不能小于0', trigger: 'blur' }
  ],
  student_ids: [
    { required: true, message: '请选择学生', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个学生', trigger: 'change' }
  ]
}

interface Student {
  id: number
  name: string
}

// 学生列表数据
const studentOptions = ref<Student[]>([])
const studentLoading = ref(false)

// 获取学生列表
const fetchStudents = async (keyword?: string) => {
  studentLoading.value = true
  try {
    const response = await request({
      url: studentEndpoints.list,
      method: 'get',
      params: { keyword }
    })

    studentOptions.value = response.data.data
  } catch (error) {
    console.error('获取学生列表失败:', error)
  } finally {
    studentLoading.value = false
  }
}

// 处理学生搜索
const handleStudentSearch = (query: string) => {
  if (query) {
    fetchStudents(query)
  }
}

// 处理表单提交
const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const requestConfig = {
          url: isEdit.value
            ? courseEndpoints.update(Number(route.query.id))
            : courseEndpoints.create,
          method: isEdit.value ? 'put' : 'post',
          data: {
            name: courseForm.name,
            year_month: courseForm.year_month,
            fee: courseForm.fee,
            student_ids: courseForm.student_ids
          }
        }

        await request(requestConfig)
        ElMessage.success(isEdit.value ? '课程更新成功' : '课程创建成功')
        router.push('/teacher/courses')
      } catch (error) {
        console.error(isEdit.value ? '更新课程失败:' : '创建课程失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 获取课程详情
const fetchCourseDetail = async (id: number) => {
  loading.value = true
  try {
    const response = await request({
      url: courseEndpoints.teacherDetail(id),
      method: 'get'
    })

    const { data } = response.data
    // 更新表单数据
    Object.assign(courseForm, {
      name: data.name,
      year_month: data.year_month,
      fee: Number(data.fee),
      student_ids: data.students.map((student: any) => student.id)
    })
  } catch (error) {
    console.error('获取课程信息失败:', error)
    // 获取失败时返回列表页
    router.push('/teacher/courses')
  } finally {
    loading.value = false
  }
}

// 处理取消
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  // 初始加载学生列表
  fetchStudents()

  // 如果是编辑模式，获取课程详情
  if (isEdit.value) {
    fetchCourseDetail(Number(route.query.id))
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
            maxlength="255"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="年月" prop="year_month">
          <el-date-picker
            v-model="courseForm.year_month"
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
            style="width: 200px"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="选择学生" prop="student_ids">
          <el-select
            v-model="courseForm.student_ids"
            multiple
            filterable
            remote
            :remote-method="handleStudentSearch"
            :loading="studentLoading"
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
