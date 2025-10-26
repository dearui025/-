#!/usr/bin/env node

/**
 * Supabase部署脚本
 * 
 * 此脚本将帮助您将open-nof1.ai项目部署到Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始Supabase部署准备...');

try {
  // 1. 检查必要的工具
  console.log('\n1. 检查必要的工具...');
  
  try {
    execSync('bun --version', { stdio: 'ignore' });
    console.log('✅ Bun已安装');
  } catch (error) {
    console.log('❌ 未找到Bun，请先安装Bun');
    process.exit(1);
  }
  
  try {
    execSync('git --version', { stdio: 'ignore' });
    console.log('✅ Git已安装');
  } catch (error) {
    console.log('❌ 未找到Git，请先安装Git');
    process.exit(1);
  }

  // 2. 安装依赖
  console.log('\n2. 安装依赖...');
  execSync('bun install', { stdio: 'inherit' });
  
  // 3. 生成Prisma客户端
  console.log('\n3. 生成Prisma客户端...');
  execSync('bunx prisma generate', { stdio: 'inherit' });
  
  // 4. 创建数据库迁移
  console.log('\n4. 创建数据库迁移...');
  execSync('bunx prisma migrate dev --name init', { stdio: 'inherit' });
  
  // 5. 构建项目
  console.log('\n5. 构建项目...');
  execSync('bun run build', { stdio: 'inherit' });
  
  console.log('\n✅ Supabase部署准备完成！');
  console.log('\n接下来的步骤：');
  console.log('1. 在Supabase创建新项目');
  console.log('2. 获取数据库连接信息并更新.env.supabase文件');
  console.log('3. 使用Supabase CLI部署或通过Vercel等平台部署');
  console.log('4. 设置环境变量');
  
} catch (error) {
  console.error('❌ 部署准备过程中出现错误:', error.message);
  process.exit(1);
}