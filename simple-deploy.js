#!/usr/bin/env node

/**
 * 简单部署脚本
 * 用于将open-nof1.ai项目部署到Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 开始部署到Vercel...');

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

  // 2. 安装依赖
  console.log('\n2. 安装依赖...');
  execSync('bun install', { stdio: 'inherit' });
  
  // 3. 生成Prisma客户端
  console.log('\n3. 生成Prisma客户端...');
  execSync('bunx prisma generate', { stdio: 'inherit' });
  
  // 4. 构建项目
  console.log('\n4. 构建项目...');
  execSync('bun run build', { stdio: 'inherit' });
  
  // 5. 部署到Vercel
  console.log('\n5. 部署到Vercel...');
  console.log('⚠️  注意：请确保您已安装Vercel CLI并登录');
  console.log('   如果未安装，请运行: npm install -g vercel');
  console.log('   如果未登录，请运行: vercel login');
  
  // 检查Vercel CLI是否已安装
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI已安装');
    
    // 部署项目
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
    console.log('❌ 未找到Vercel CLI，请先安装:');
    console.log('   npm install -g vercel');
    console.log('   或者使用yarn: yarn global add vercel');
    console.log('\n安装完成后，请运行以下命令:');
    console.log('   vercel login');
    console.log('   vercel --prod');
  }
  
} catch (error) {
  console.error('❌ 部署过程中出现错误:', error.message);
  process.exit(1);
}