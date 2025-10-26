import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

async function triggerAI() {
  console.log("开始手动触发AI运行任务...");
  
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
    const url = `${baseUrl}/api/cron/3-minutes-run-interval?token=${token}`;
    
    console.log(`正在调用API: ${url}`);
    
    // 调用API
    const response = await fetch(url, {
      method: "GET",
    });
    
    const text = await response.text();
    console.log(`API响应状态: ${response.status}`);
    console.log(`API响应内容: ${text}`);
    
    if (response.ok) {
      console.log("✅ AI运行任务触发成功!");
    } else {
      console.error("❌ AI运行任务触发失败!");
    }
  } catch (error) {
    console.error("❌ 触发AI运行任务时发生错误:", error.message);
    console.error("错误堆栈:", error.stack);
  }
}

triggerAI();