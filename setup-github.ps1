# GitHub 仓库设置脚本 (PowerShell 版本)
Write-Host "=== GitHub 仓库设置助手 ===" -ForegroundColor Green
Write-Host ""

# 检查是否已安装 git
try {
    $gitVersion = git --version
    Write-Host "Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到 git。请先安装 git。" -ForegroundColor Red
    exit 1
}

Write-Host "请按照以下步骤操作：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 请在 GitHub 上创建一个新的仓库：" -ForegroundColor Yellow
Write-Host "   - 访问 https://github.com/new" -ForegroundColor Yellow
Write-Host "   - 设置仓库名称（例如：open-nof1.ai）" -ForegroundColor Yellow
Write-Host "   - 选择公开或私有" -ForegroundColor Yellow
Write-Host "   - 不要初始化 README、.gitignore 或 license" -ForegroundColor Yellow
Write-Host "   - 点击 'Create repository'" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. 创建完成后，复制仓库的 HTTPS 地址" -ForegroundColor Yellow
Write-Host "   （例如：https://github.com/your-username/your-repo.git）" -ForegroundColor Yellow
Write-Host ""

$repoUrl = Read-Host "请输入您的 GitHub 仓库 HTTPS 地址"

# 验证输入
if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "错误: 仓库地址不能为空" -ForegroundColor Red
    exit 1
}

# 设置远程仓库
Write-Host "正在设置远程仓库..." -ForegroundColor Cyan
git remote set-url origin $repoUrl

# 推送到 GitHub
Write-Host "正在推送到 GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Green
Write-Host "如果推送成功，您现在可以在 GitHub 上看到您的代码了！" -ForegroundColor Green