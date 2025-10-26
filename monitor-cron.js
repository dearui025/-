// 监控cron任务状态的脚本
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// 加载环境变量
dotenv.config();

async function monitorCron() {
  console.log("开始监控cron任务状态...");
  
  try {
    // 生成token
    const token = jwt.sign(
      {
        sub: "cron-token",
      },
      process.env.CRON_SECRET_KEY || "default-secret-key"
    );
    
    // 构建URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    
    // 检查20秒指标间隔任务
    console.log("\n--- 检查20秒指标间隔任务 ---");
    const metricsUrl = `${baseUrl}/api/cron/20-seconds-metrics-interval?token=${token}`;
    console.log(`调用URL: ${metricsUrl}`);
    
    const metricsResponse = await fetch(metricsUrl, {
      method: "GET",
    });
    
    console.log(`响应状态: ${metricsResponse.status}`);
    const metricsText = await metricsResponse.text();
    console.log(`响应内容: ${metricsText.substring(0, 100)}...`);
    
    // 检查3分钟运行间隔任务
    console.log("\n--- 检查3分钟运行间隔任务 ---");
    const runUrl = `${baseUrl}/api/cron/3-minutes-run-interval?token=${token}`;
    console.log(`调用URL: ${runUrl}`);
    
    const runResponse = await fetch(runUrl, {
      method: "GET",
    });
    
    console.log(`响应状态: ${runResponse.status}`);
    const runText = await runResponse.text();
    console.log(`响应内容: ${runText.substring(0, 100)}...`);
    
    if (runResponse.ok) {
      console.log("\n✅ 所有cron任务API端点正常工作!");
    } else {
      console.log("\n❌ 某些cron任务API端点存在问题!");
    }
    
  } catch (error) {
    console.error("监控cron任务时发生错误:", error.message);
    console.error("错误堆栈:", error.stack);
  }
}

// 每分钟检查一次
console.log("启动cron任务监控器...");
monitorCron();

// 设置定时检查
setInterval(() => {
  console.log(`\n[${new Date().toISOString()}] 执行定时检查...`);
  monitorCron();
}, 60000); // 每分钟检查一次

// 保持进程运行
console.log("监控器已启动，按Ctrl+C退出");