# GitHub 仓库创建和代码上传指南

## 第一步：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com/) 并登录您的账户
2. 点击右上角的 "+" 图标，然后选择 "New repository"
3. 设置仓库信息：
   - **Repository name**: `open-nof1.ai`（或您喜欢的名称）
   - **Description**: `An open-source AI cryptocurrency trading platform`
   - **Public/Private**: 选择 Public（公开）以便其他人可以查看和学习
   - **Initialize this repository with**: 不要勾选任何选项（不要初始化README、.gitignore或license）
4. 点击 "Create repository"

## 第二步：获取仓库地址

创建完成后，您会看到一个页面显示如何推送现有仓库到GitHub。请复制那里的HTTPS地址，它应该类似于：
```
https://github.com/your-username/your-repository-name.git
```

## 第三步：配置本地仓库

在终端中运行以下命令（请将 `<your-repo-url>` 替换为您刚刚复制的实际仓库URL）：

```bash
git remote add origin <your-repo-url>
```

例如：
```bash
git remote add origin https://github.com/your-username/open-nof1.ai.git
```

## 第四步：推送代码到 GitHub

运行以下命令将代码推送到GitHub：

```bash
git push -u origin main
```

## 第五步：验证上传

1. 刷新您的GitHub仓库页面
2. 您应该能看到所有文件都已成功上传
3. README.md 文件会自动渲染为主页内容

## 故障排除

### 如果推送失败

如果您遇到身份验证问题，可以尝试以下方法：

1. 使用 GitHub Personal Access Token：
   ```bash
   git remote set-url origin https://<your-token>@github.com/<your-username>/<your-repo-name>.git
   ```

2. 或者配置 SSH 密钥（更安全的方法）：
   - 生成 SSH 密钥：`ssh-keygen -t ed25519 -C "your_email@example.com"`
   - 将公钥添加到 GitHub 账户
   - 使用 SSH URL 而不是 HTTPS URL

### 如果遇到其他问题

请检查：
1. 网络连接是否正常
2. GitHub 账户是否有足够的权限
3. 仓库名称是否正确

## 后续维护

推送成功后，以后每次提交更改都可以使用以下命令：

```bash
git add .
git commit -m "描述您的更改"
git push
```

这样您的项目就会持续同步到GitHub上了。