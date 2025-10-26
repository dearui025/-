#!/usr/bin/env node

/**
 * Vercel直接部署脚本
 * 用于将open-nof1.ai项目直接部署到Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始直接部署到Vercel...');

try {
  // 1. 检查必要的工具
  console.log('\n1. 检查必要的工具...');
  
  try {
    execSync('bun --version', { stdio: 'ignore' });
    console.log('✅ Bun已安装');
  } catch (error) {
    console.log('❌ 未找到Bun，请先安装Bun: https://bun.sh');
    process.exit(1);
  }
  
  try {
    execSync('git --version', { stdio: 'ignore' });
    console.log('✅ Git已安装');
  } catch (error) {
    console.log('❌ 未找到Git，请先安装Git');
    process.exit(1);
  }

  // 2. 检查Vercel CLI是否已安装
  console.log('\n2. 检查Vercel CLI...');
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI已安装');
  } catch (error) {
    console.log('ℹ️  正在安装Vercel CLI...');
    execSync('bun install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI安装完成');
  }

  // 3. 登录Vercel（如果尚未登录）
  console.log('\n3. 检查Vercel登录状态...');
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
    console.log('✅ 已登录Vercel');
  } catch (error) {
    console.log('ℹ️  请登录Vercel...');
    execSync('vercel login', { stdio: 'inherit' });
  }

  // 4. 安装依赖
  console.log('\n4. 安装依赖...');
  execSync('bun install', { stdio: 'inherit' });
  
  // 5. 生成Prisma客户端
  console.log('\n5. 生成Prisma客户端...');
  execSync('bunx prisma generate', { stdio: 'inherit' });
  
  // 6. 直接部署到Vercel
  console.log('\n6. 部署到Vercel...');
  console.log('⚠️  注意：请确保您已在Vercel项目中配置了所有环境变量');
  
  // 使用Vercel CLI进行部署
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('\n🎉 部署完成！');
  console.log('\n📝 重要提醒:');
  console.log('1. 请在Vercel项目设置中添加以下环境变量:');
  console.log('   - DATABASE_URL');
  console.log('   - DEEPSEEK_API_KEY');
  console.log('   - BINANCE_API_KEY');
  console.log('   - BINANCE_API_SECRET');
  console.log('   - CRON_SECRET_KEY');
  console.log('   - START_MONEY');
  console.log('   - OPENROUTER_API_KEY (可选)');
  console.log('   - EXA_API_KEY (可选)');
  
  console.log('\n2. 配置cron任务以定期调用API端点');
  console.log('3. 确保数据库已正确迁移');
  
} catch (error) {
  console.error('❌ 部署过程中出现错误:', error.message);
  process.exit(1);
}