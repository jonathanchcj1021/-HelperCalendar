# Firebase 故障排除指南

## 404 错误：Firebase Authentication API

如果您看到类似以下的错误：
```
https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=... 404
```

这表示 Firebase Authentication 服务没有正确配置。

## 解决步骤

### 1. 检查 Firebase Authentication 是否已启用

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择您的项目
3. 在左侧菜单中，点击 **"Authentication"**（身份验证）
4. 如果看到 "Get started" 按钮，点击它
5. 点击 **"Sign-in method"**（登录方法）标签
6. 找到 **"Email/Password"** 选项
7. 点击 **"Email/Password"**
8. **启用第一个开关**（Email/Password provider）
9. 点击 **"Save"**（保存）

### 2. 验证 API Key 是否正确

1. 在 Firebase Console 中，点击项目设置（齿轮图标）
2. 向下滚动到 **"Your apps"** 部分
3. 找到您的 Web 应用
4. 确认 API Key 与 `.env.local` 文件中的 `NEXT_PUBLIC_FIREBASE_API_KEY` 一致

### 3. 检查环境变量

确保 `.env.local` 文件在项目根目录，并且包含所有必需的变量：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:...
```

**重要：**
- 确保没有引号（不要用 `"` 或 `'` 包裹值）
- 确保没有多余的空格
- 确保所有值都是实际的值，不是占位符

### 4. 重启开发服务器

修改 `.env.local` 后，必须重启服务器：

1. 停止当前服务器（在终端按 `Ctrl + C`）
2. 重新运行：`npm run dev`

### 5. 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签
3. 应该看到：`✅ Firebase configuration loaded successfully`
4. 如果看到错误信息，按照提示修复

### 6. 验证 Firestore 数据库

确保 Firestore 数据库已创建：

1. 在 Firebase Console 中，点击 **"Firestore Database"**
2. 如果看到 "Create database" 按钮，点击它
3. 选择测试模式或生产模式
4. 选择数据库位置
5. 点击 "Enable"

## 常见错误代码

| 错误代码 | 含义 | 解决方法 |
|---------|------|---------|
| `auth/network-request-failed` | 网络错误 | 检查网络连接 |
| `auth/email-already-in-use` | 邮箱已注册 | 使用不同的邮箱或直接登录 |
| `auth/weak-password` | 密码太弱 | 使用至少 6 个字符的密码 |
| `auth/invalid-email` | 邮箱格式错误 | 检查邮箱格式 |
| `auth/user-not-found` | 用户不存在 | 先注册账户 |
| `auth/wrong-password` | 密码错误 | 检查密码是否正确 |
| 404 错误 | Authentication 未启用 | 在 Firebase Console 启用 Email/Password |

## 仍然无法解决？

1. **清除浏览器缓存**：按 `Ctrl + Shift + Delete`，清除缓存和 Cookie
2. **检查防火墙**：确保防火墙没有阻止对 Firebase 的访问
3. **检查 API 限制**：在 Firebase Console > Project Settings > API Keys 中检查是否有 API 限制
4. **重新创建项目**：如果问题持续，考虑创建一个新的 Firebase 项目

## 验证配置

在浏览器控制台中运行以下代码来验证配置：

```javascript
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing')
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing')
```

如果看到 "Missing"，说明环境变量没有正确加载。

