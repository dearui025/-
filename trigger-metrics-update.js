// 定期触发指标更新的脚本
async function triggerMetricsUpdate() {
  try {
    console.log(`[${new Date().toISOString()}] 触发指标更新...`);
    
    const response = await fetch('http://localhost:3000/api/cron/20-seconds-metrics-interval');
    const text = await response.text();
    
    console.log(`[${new Date().toISOString()}] 更新结果: ${text}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 更新失败:`, error.message);
  }
}

// 立即执行一次
triggerMetricsUpdate();

// 每20秒执行一次
setInterval(triggerMetricsUpdate, 20000);

console.log('指标更新触发器已启动，每20秒自动更新一次数据');