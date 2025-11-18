# 部署指南 - 便宜的 Web Server 选项

## 推荐方案（按优先级排序）

### 1. **Vercel** ⭐ 最推荐（Next.js 官方平台）

**价格**：免费套餐非常慷慨
- ✅ 完全免费（个人项目）
- ✅ Next.js 官方平台，完美支持
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（连接 GitHub 自动部署）
- ✅ 无限带宽（免费套餐）
- ✅ 100GB 带宽/月
- ✅ 服务器端渲染支持

**限制**：
- 免费套餐：100GB 带宽/月
- 适合个人项目和小型应用

**部署步骤**：
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择您的 GitHub 仓库
5. 添加环境变量（Firebase 配置）
6. 点击 "Deploy"

**环境变量设置**：
在 Vercel 项目设置中添加：
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**优点**：
- 部署最简单
- 专为 Next.js 优化
- 免费套餐足够使用
- 自动 CI/CD

---

### 2. **Netlify**

**价格**：免费套餐
- ✅ 100GB 带宽/月
- ✅ 300 分钟构建时间/月
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 支持 Next.js

**部署步骤**：
1. 访问 [netlify.com](https://netlify.com)
2. 连接 GitHub 仓库
3. 构建命令：`npm run build`
4. 发布目录：`.next`
5. 添加环境变量

**优点**：
- 免费套餐不错
- 部署简单
- 支持表单和函数

---

### 3. **Railway**

**价格**：$5/月起（有免费试用）
- ✅ 简单易用
- ✅ 自动部署
- ✅ 支持数据库
- ✅ 适合全栈应用

**免费试用**：$5 免费额度（用完即止）

---

### 4. **Render**

**价格**：免费套餐
- ✅ 免费静态网站托管
- ✅ 自动 HTTPS
- ✅ 自动部署
- ⚠️ 免费套餐有休眠（15分钟无活动后休眠）

**适合**：小型项目

---

### 5. **Firebase Hosting**（因为您已在使用 Firebase）

**价格**：免费套餐
- ✅ 10GB 存储
- ✅ 360MB/天 传输
- ✅ 与 Firebase 服务集成好
- ✅ 自动 HTTPS

**限制**：
- 免费套餐传输量较小
- 需要配置 Firebase CLI

**部署步骤**：
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 最推荐：Vercel

对于您的 Next.js + Firebase 应用，**Vercel 是最佳选择**：

### 为什么选择 Vercel？

1. **专为 Next.js 设计**：零配置，完美支持
2. **完全免费**：个人项目完全够用
3. **自动部署**：每次 push 到 GitHub 自动部署
4. **全球 CDN**：访问速度快
5. **简单易用**：5 分钟即可部署

### 快速部署步骤

1. **准备 GitHub 仓库**（已完成 ✅）

2. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 点击 "Sign Up"
   - 使用 GitHub 账号登录

3. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择您的仓库：`jonathanchcj1021/-HelperCalendar`
   - 点击 "Import"

4. **配置项目**
   - Framework Preset: Next.js（自动检测）
   - Root Directory: `./`（默认）
   - Build Command: `npm run build`（默认）
   - Output Directory: `.next`（默认）

5. **添加环境变量**
   - 在 "Environment Variables" 部分
   - 添加所有 Firebase 环境变量：
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     NEXT_PUBLIC_FIREBASE_PROJECT_ID
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     NEXT_PUBLIC_FIREBASE_APP_ID
     ```
   - 从您的 `.env.local` 文件复制值

6. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-3 分钟）
   - 获得部署 URL（例如：`your-app.vercel.app`）

7. **自定义域名**（可选）
   - 在项目设置中可以添加自定义域名
   - 免费套餐也支持自定义域名

### 后续更新

每次您 push 代码到 GitHub，Vercel 会自动：
1. 检测更改
2. 运行构建
3. 部署新版本

### 成本对比

| 平台 | 免费套餐 | 付费起价 | 推荐度 |
|------|---------|---------|--------|
| **Vercel** | ✅ 100GB/月 | $20/月 | ⭐⭐⭐⭐⭐ |
| Netlify | ✅ 100GB/月 | $19/月 | ⭐⭐⭐⭐ |
| Railway | ❌ $5 试用 | $5/月 | ⭐⭐⭐ |
| Render | ✅ 有限制 | $7/月 | ⭐⭐⭐ |
| Firebase Hosting | ✅ 360MB/天 | $25/月 | ⭐⭐⭐ |

## 总结

**推荐使用 Vercel**，因为：
- ✅ 完全免费（个人项目）
- ✅ 专为 Next.js 优化
- ✅ 部署最简单
- ✅ 自动 CI/CD
- ✅ 全球 CDN，速度快

如果您的应用流量很大，可以考虑升级到 Vercel Pro（$20/月），但对于大多数项目，免费套餐已经足够。

