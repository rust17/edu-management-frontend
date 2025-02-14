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
    { required: true, message: 'Please enter the course name', trigger: 'blur' },
    { max: 255, message: 'Course name cannot exceed 255 characters', trigger: 'blur' }
  ],
  year_month: [
    { required: true, message: 'Please select year and month', trigger: 'change' },
    {
      pattern: /^\d{4}-\d{2}$/,
      message: 'Year and month format must be YYYY-MM',
      trigger: 'change'
    }
  ],
  fee: [
    { required: true, message: 'Please enter the course fee', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Fee cannot be less than 0', trigger: 'blur' }
  ],
  student_ids: [
    { required: true, message: 'Please select students', trigger: 'change' },
    { type: 'array', min: 1, message: 'Select at least one student', trigger: 'change' }
  ]
}

interface Student {
  id: number
  name: string
}

// Student list data
const studentOptions = ref<Student[]>([])
const studentLoading = ref(false)

// Get student list
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
    console.error('Failed to get student list:', error)
  } finally {
    studentLoading.value = false
  }
}

// Handle student search
const handleStudentSearch = (query: string) => {
  if (query) {
    fetchStudents(query)
  }
}

// Handle form submission
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
        ElMessage.success(isEdit.value ? 'Course updated successfully' : 'Course created successfully')
        router.push('/teacher/courses')
      } catch (error) {
        console.error(isEdit.value ? 'Failed to update course:' : 'Failed to create course:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// Get course details
const fetchCourseDetail = async (id: number) => {
  loading.value = true
  try {
    const response = await request({
      url: courseEndpoints.teacherDetail(id),
      method: 'get'
    })

    const { data } = response.data
    // Update form data
    Object.assign(courseForm, {
      name: data.name,
      year_month: data.year_month,
      fee: Number(data.fee),
      student_ids: data.students.map((student: any) => student.id)
    })
  } catch (error) {
    console.error('Failed to get course information:', error)
    // Redirect to list page if fetching fails
    router.push('/teacher/courses')
  } finally {
    loading.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  // Initial load student list
  fetchStudents()

  // If it is edit mode, get course details
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
          Back
        </el-button>
        <h2>{{ isEdit ? 'Edit Course' : 'Create Course' }}</h2>
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
        <el-form-item label="Course Name" prop="name">
          <el-input
            v-model="courseForm.name"
            placeholder="Please enter the course name"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Year/Month" prop="year_month">
          <el-date-picker
            v-model="courseForm.year_month"
            type="month"
            placeholder="Please select year and month"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>

        <el-form-item label="Course Fee" prop="fee">
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

        <el-form-item label="Select Students" prop="student_ids">
          <el-select
            v-model="courseForm.student_ids"
            multiple
            filterable
            remote
            :remote-method="handleStudentSearch"
            :loading="studentLoading"
            placeholder="Please select students"
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
            <el-button @click="handleCancel">Cancel</el-button>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleSubmit(formRef)"
            >
              {{ isEdit ? 'Save' : 'Create' }}
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

// Responsive design
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
