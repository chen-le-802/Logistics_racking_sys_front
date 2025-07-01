# 物流追踪系统 - 前端

基于Vue 3 + typescript+ Vite的前端实现

## 环境要求
- Node.js 16+
- npm 8+

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
开发服务器默认运行在 `http://localhost:5173`

### 3. 生产环境构建
```bash
npm run build
```
构建产物将输出至 `/dist` 目录

## 开发指南

### 项目结构
```
/src
  /assets        # 静态资源
  /components    # 公共组件
  /views         # 页面视图
  /router        # 路由配置
  /store         # 状态管理
  /api           # 接口服务
  /utils         # 工具函数
```

## 常见问题
- 如遇依赖安装问题，请尝试删除node_modules后重新安装
- 跨域问题请配置vite代理
```
