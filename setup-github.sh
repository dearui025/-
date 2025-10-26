#!/bin/bash

# GitHub 仓库设置脚本
echo "=== GitHub 仓库设置助手 ==="
echo ""

# 检查是否已安装 git
if ! command -v git &> /dev/null
then
    echo "错误: 未找到 git。请先安装 git。"
    exit 1
fi

echo "请按照以下步骤操作："
echo ""
echo "1. 请在 GitHub 上创建一个新的仓库："
echo "   - 访问 https://github.com/new"
echo "   - 设置仓库名称（例如：open-nof1.ai）"
echo "   - 选择公开或私有"
echo "   - 不要初始化 README、.gitignore 或 license"
echo "   - 点击 'Create repository'"
echo ""
echo "2. 创建完成后，复制仓库的 HTTPS 地址"
echo "   （例如：https://github.com/your-username/your-repo.git）"
echo ""
read -p "请输入您的 GitHub 仓库 HTTPS 地址: " repo_url

# 验证输入
if [ -z "$repo_url" ]; then
    echo "错误: 仓库地址不能为空"
    exit 1
fi

# 设置远程仓库
echo "正在设置远程仓库..."
git remote set-url origin $repo_url

# 推送到 GitHub
echo "正在推送到 GitHub..."
git push -u origin main

echo ""
echo "=== 完成 ==="
echo "如果推送成功，您现在可以在 GitHub 上看到您的代码了！"