async function checkMetricsData() {
  try {
    console.log("正在获取指标数据...");
    
    const response = await fetch('http://localhost:3000/api/metrics');
    const text = await response.text();
    
    console.log("响应状态:", response.status);
    console.log("响应头:", [...response.headers.entries()]);
    
    // 尝试解析JSON
    try {
      const data = JSON.parse(text);
      
      if (data.success && data.data.metrics.length > 0) {
        // 获取最新的数据点
        const latestMetric = data.data.metrics[data.data.metrics.length - 1];
        
        console.log("最新的指标数据:");
        console.log(`总账户价值: $${latestMetric.totalCashValue?.toFixed(2)}`);
        console.log(`可用现金: $${latestMetric.availableCash?.toFixed(2)}`);
        console.log(`持仓价值: $${latestMetric.currentPositionsValue?.toFixed(2)}`);
        console.log(`总回报率: ${(latestMetric.currentTotalReturn * 100)?.toFixed(2)}%`);
        console.log(`夏普比率: ${latestMetric.sharpeRatio?.toFixed(2)}`);
        console.log(`创建时间: ${latestMetric.createdAt}`);
        
        // 检查持仓详情
        if (latestMetric.positions) {
          console.log("\n持仓详情:");
          try {
            const positions = typeof latestMetric.positions === 'string' 
              ? JSON.parse(latestMetric.positions) 
              : latestMetric.positions;
            
            if (Array.isArray(positions) && positions.length > 0) {
              positions.forEach((position, index) => {
                console.log(`${index + 1}. ${position.symbol}: 数量=${position.amount}, 价格=${position.price}`);
              });
            } else {
              console.log("无持仓信息");
            }
          } catch (parseError) {
            console.log("持仓信息解析失败:", latestMetric.positions);
          }
        }
      } else {
        console.log("无指标数据");
      }
    } catch (parseError) {
      console.log("JSON解析失败:", parseError.message);
      console.log("响应内容:", text.substring(0, 500) + "..."); // 只显示前500个字符
    }
  } catch (error) {
    console.error("获取指标数据时出错:", error.message);
  }
}

checkMetricsData();