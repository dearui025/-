// 服务器启动脚本，确保cron任务正确运行
import dotenv from 'dotenv';
import './cron'; // 导入并启动cron任务

// 加载环境变量
dotenv.config();

console.log('服务器启动脚本已执行，cron任务已启动');

// 保持进程运行
setInterval(() => {
  console.log(`服务器运行中... ${new Date().toISOString()}`);
}, 60000); // 每分钟输出一次状态