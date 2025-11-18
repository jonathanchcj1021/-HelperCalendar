# Firebase 配置指南

## 如何获取 Firebase 配置信息

### 步骤 1: 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 **"Add project"**（添加项目）
3. 输入项目名称（例如：`calendar-task-manager`）
4. 按照向导完成项目创建

### 步骤 2: 获取 Web 应用配置

1. 在 Firebase Console 中，点击项目设置图标（齿轮图标）或项目名称
2. 在左侧菜单中，点击 **"Project settings"**（项目设置）
3. 向下滚动到 **"Your apps"**（您的应用）部分
4. 如果没有 Web 应用，点击 **"</>"**（Web 图标）添加 Web 应用
5. 输入应用昵称（例如：`Calendar App`）
6. 点击 **"Register app"**（注册应用）

### 步骤 3: 复制配置信息

注册应用后，您会看到一个包含配置代码的页面，类似这样：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

### 步骤 4: 配置环境变量

在项目根目录创建 `.env.local` 文件，并将这些值填入：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

**注意：** 将 `your-project-id` 替换为您的实际项目 ID

### 步骤 5: 启用 Authentication

1. 在 Firebase Console 左侧菜单中，点击 **"Authentication"**（身份验证）
2. 点击 **"Get started"**（开始使用）
3. 点击 **"Sign-in method"**（登录方法）标签
4. 点击 **"Email/Password"**（电子邮件/密码）
5. 启用第一个开关（Email/Password）
6. 点击 **"Save"**（保存）

### 步骤 6: 创建 Firestore 数据库

1. 在 Firebase Console 左侧菜单中，点击 **"Firestore Database"**（Firestore 数据库）
2. 点击 **"Create database"**（创建数据库）
3. 选择 **"Start in test mode"**（以测试模式启动）或 **"Start in production mode"**（以生产模式启动）
   - **测试模式**：允许所有读写操作（仅用于开发）
   - **生产模式**：需要配置安全规则（推荐用于生产环境）
4. 选择数据库位置（选择离您最近的区域）
5. 点击 **"Enable"**（启用）

### 步骤 7: 配置 Firestore 安全规则（生产环境）

如果您选择生产模式，需要配置安全规则。在 Firestore Database 页面：

1. 点击 **"Rules"**（规则）标签
2. 使用以下规则（根据您的需求调整）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if request.auth != null && (
        resource.data.employerId == request.auth.uid ||
        resource.data.assignedTo == request.auth.uid
      );
      allow create: if request.auth != null && 
        request.resource.data.employerId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        resource.data.employerId == request.auth.uid;
    }
  }
}
```

3. 点击 **"Publish"**（发布）

### 步骤 8: 验证配置

1. 确保 `.env.local` 文件已创建并包含所有配置
2. 重启开发服务器：
   ```bash
   npm run dev
   ```
3. 访问应用并尝试注册/登录

## 常见问题

### Q: 找不到配置信息？
A: 确保您已创建 Web 应用。在 Project settings > Your apps 中查看。

### Q: 配置后仍然无法连接？
A: 检查：
- `.env.local` 文件是否在项目根目录
- 环境变量名称是否正确（必须以 `NEXT_PUBLIC_` 开头）
- 是否重启了开发服务器

### Q: 如何查看项目 ID？
A: 在 Project settings 页面的顶部可以看到项目 ID。

### Q: 测试模式和生产模式有什么区别？
A: 
- **测试模式**：允许所有读写操作，适合开发测试
- **生产模式**：需要配置安全规则，适合生产环境

## 安全提示

⚠️ **重要：** 
- 不要将 `.env.local` 文件提交到 Git
- 生产环境应该使用更严格的安全规则
- 定期检查和更新 Firebase 安全规则

