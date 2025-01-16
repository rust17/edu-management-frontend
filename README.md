# 教务管理系统前端

这是一个基于 Vue 3 + TypeScript 开发的教务管理系统前端项目，主要用于管理教师和学生的课程及付款信息。

## 技术栈

- **核心框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 框架**: Element Plus
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **支付集成**: Opn Payments (原 Omise)
- **代码规范**: ESLint + EditorConfig
- **样式预处理**: SASS

## 主要功能

- 🔐 用户认证（教师/学生）
- 📚 课程管理
  - 教师：创建、编辑课程
  - 学生：查看课程列表和详情
- 💰 支付管理
  - 集成 Opn Payments 支付系统
  - 支持信用卡支付
- 📊 数据统计
  - 教师：课程数、账单总数
  - 学生：课程数、待支付账单数

## 项目结构
```
edu-management-frontend/
├── src/
│ ├── assets/ # 静态资源
│ ├── components/ # 公共组件
│ ├── helpers/ # 工具函数
│ ├── http/ # API 请求相关
│ ├── router/ # 路由配置
│ ├── stores/ # Pinia 状态管理
│ └── views/ # 页面组件
```

## 开发指南

### 环境要求

- Node.js >= 18
- npm >= 9

### 本地开发

1. 克隆项目并安装依赖：

```bash
git clone <repository-url>
cd edu-management-frontend
npm install
```

2. 配置环境变量：

```bash
cp .env.example .env

编辑 .env 文件，设置必要的环境变量：
- VITE_API_BASE_URL: API 接口地址
- VITE_OMISE_PUBLIC_KEY: Opn Payments 公钥
```

3. 启动开发服务器：

```bash
npm run dev
```

### 生产部署

1. 构建生产版本：

```bash
npm run build
```

2. 部署 `dist` 目录下的文件到你的 Web 服务器

## 注意事项

### 开发注意事项

1. **TypeScript**: 确保所有新代码都使用 TypeScript 编写，并包含适当的类型定义

2. **API 集成**:
   - 所有 API 端点定义在 `src/http/endpoints/` 目录下
   - 使用 `request` 实例进行 API 调用

3. **支付集成**:
   - 使用 `OpnPaymentButton` 组件处理支付
   - 确保正确配置 Opn Payments 公钥

### 部署注意事项

1. **环境变量**:
   - 确保生产环境正确配置所有必要的环境变量
   - 不要在代码中硬编码敏感信息

2. **跨域配置**:
   - 确保 API 服务器配置了正确的 CORS 策略
   - 前端部署域名需要在后端白名单中

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/xxx`
3. 提交改动：`git commit -am 'feat: add xxx'`
4. 推送分支：`git push origin feature/xxx`
5. 提交 Pull Request

## 许可证

MIT
