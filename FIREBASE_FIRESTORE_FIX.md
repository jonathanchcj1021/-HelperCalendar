# Firestore 数据库空白问题修复指南

## 问题：Authentication 账户已创建，但 Firestore 数据库是空白的

### 原因分析

1. **Firestore 数据库未创建**
2. **Firestore 安全规则阻止写入**
3. **数据库位置未选择**

## 解决步骤

### 步骤 1: 确认 Firestore 数据库已创建

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择您的项目
3. 在左侧菜单中，点击 **"Firestore Database"**（Firestore 数据库）
4. 如果看到 **"Create database"** 按钮，点击它
5. 选择数据库模式：
   - **测试模式**（推荐用于开发）：允许所有读写操作 30 天
   - **生产模式**：需要配置安全规则
6. 选择数据库位置（选择离您最近的区域，例如：`asia-east1` 或 `us-central1`）
7. 点击 **"Enable"**（启用）

### 步骤 2: 检查 Firestore 安全规则

#### 如果使用测试模式（Test Mode）

测试模式的安全规则应该是：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

这个规则允许所有读写操作（在 30 天内）。

#### 如果使用生产模式（Production Mode）

需要配置正确的安全规则。在 Firestore Database 页面：

1. 点击 **"Rules"**（规则）标签
2. 替换为以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - allow users to create and read their own data
    match /users/{userId} {
      // Allow read if authenticated and reading own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // Allow create if authenticated and creating own data
      allow create: if request.auth != null && request.auth.uid == userId;
      // Allow update if authenticated and updating own data
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      // Allow read if user is the employer or assigned helper
      allow read: if request.auth != null && (
        resource.data.employerId == request.auth.uid ||
        resource.data.assignedTo == request.auth.uid
      );
      // Allow create if user is the employer
      allow create: if request.auth != null && 
        request.resource.data.employerId == request.auth.uid;
      // Allow update/delete if user is the employer
      allow update, delete: if request.auth != null && 
        resource.data.employerId == request.auth.uid;
    }
  }
}
```

3. 点击 **"Publish"**（发布）

### 步骤 3: 验证数据库连接

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签
3. 注册新账户时，应该看到：
   - `✅ User data saved to Firestore: [user-id]`
4. 如果看到错误，检查错误信息

### 步骤 4: 手动检查数据库

1. 在 Firebase Console 中，打开 **Firestore Database**
2. 应该看到 **"users"** collection（集合）
3. 点击 **"users"** 应该看到用户文档
4. 每个文档应该包含：
   - `uid`
   - `email`
   - `displayName`
   - `role`
   - `createdAt`

### 步骤 5: 如果仍然空白

#### 选项 A: 使用测试模式（快速解决）

1. 在 Firestore Database 页面
2. 点击 **"Rules"** 标签
3. 如果规则很复杂，临时改为测试模式规则：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
4. 点击 **"Publish"**
5. ⚠️ **警告**：这个规则允许任何人读写，仅用于测试！

#### 选项 B: 检查浏览器控制台错误

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签
3. 尝试注册新账户
4. 查看是否有错误信息，特别是：
   - `permission-denied`
   - `Firestore permission denied`

### 步骤 6: 重新注册测试

1. 删除现有的 Authentication 账户（在 Firebase Console > Authentication > Users）
2. 清除浏览器缓存
3. 重新注册账户
4. 检查 Firestore 数据库是否出现数据

## 常见错误

### 错误：`permission-denied`

**原因**：Firestore 安全规则阻止写入

**解决**：
1. 检查 Firestore 安全规则
2. 确保规则允许已认证用户创建自己的文档
3. 参考步骤 2 中的规则配置

### 错误：`Firestore Database not found`

**原因**：Firestore 数据库未创建

**解决**：
1. 按照步骤 1 创建数据库
2. 确保选择了数据库位置

### 数据库位置选择

选择离您最近的区域：
- 香港/台湾：`asia-east1` 或 `asia-southeast1`
- 中国大陆：`asia-east1`
- 美国：`us-central1`

## 验证修复

注册新账户后，在 Firebase Console > Firestore Database 中应该看到：

1. **users** collection（集合）
2. 包含用户 ID 的文档
3. 文档中包含所有用户数据字段

如果仍然有问题，请检查浏览器控制台的错误信息。

