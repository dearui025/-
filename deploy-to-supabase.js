#!/usr/bin/env node

/**
 * Supabase部署脚本
 * 用于将open-nof1.ai项目部署到Supabase项目: tvlmjlfgadvlletfxjwr
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署到Supabase项目: tvlmjlfgadvlletfxjwr');

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

  // 2. 验证环境变量文件存在
  console.log('\n2. 验证环境变量文件...');
  const envPath = path.join(__dirname, '.env.production');
  if (!fs.existsSync(envPath)) {
    console.log('❌ 未找到.env.production文件，请先创建该文件并配置环境变量');
    console.log('   请参考.env.supabase文件创建.env.production文件');
    process.exit(1);
  }
  console.log('✅ .env.production文件存在');

  // 3. 安装依赖
  console.log('\n3. 安装依赖...');
  execSync('bun install', { stdio: 'inherit' });
  
  // 4. 生成Prisma客户端
  console.log('\n4. 生成Prisma客户端...');
  execSync('bunx prisma generate', { stdio: 'inherit' });
  
  // 5. 运行数据库迁移
  console.log('\n5. 运行数据库迁移...');
  console.log('⚠️  注意：这将在您的Supabase数据库中创建表结构');
  console.log('   请确保您已在.env.production文件中正确配置了DATABASE_URL');
  
  // 询问用户是否继续
  console.log('\n是否继续运行数据库迁移？(y/N)');
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      try {
        execSync('bunx prisma migrate dev --name init', { stdio: 'inherit' });
        console.log('✅ 数据库迁移完成');
        
        // 6. 构建项目
        console.log('\n6. 构建项目...');
        execSync('bun run build', { stdio: 'inherit' });
        
        console.log('\n🎉 Supabase部署准备完成！');
        console.log('\n下一步，请选择部署方式：');
        console.log('1. 部署到Vercel（推荐）:');
        console.log('   - 访问 https://vercel.com');
        console.log('   - 创建新项目并连接您的GitHub仓库');
        console.log('   - 在环境变量设置中添加.env.production中的所有变量');
        console.log('   - 部署项目');
        
        console.log('\n2. 使用Docker部署到Supabase:');
        console.log('   - 创建Dockerfile');
        console.log('   - 使用Supabase Functions部署');
        
        console.log('\n3. 手动部署:');
        console.log('   - 将构建输出部署到您选择的平台');
        console.log('   - 确保设置所有环境变量');
        
        console.log('\n📝 重要提醒:');
        console.log('- 请确保在部署平台上设置所有环境变量');
        console.log('- 配置cron任务以定期调用API端点');
        console.log('- 设置正确的API密钥以确保系统正常运行');
        
      } catch (error) {
        console.error('❌ 数据库迁移过程中出现错误:', error.message);
      }
    } else {
      console.log('❌ 操作已取消');
    }
    rl.close();
  });
  
} catch (error) {
  console.error('❌ 部署准备过程中出现错误:', error.message);
  process.exit(1);
}