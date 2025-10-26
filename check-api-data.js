async function checkApiData() {
  try {
    console.log("正在获取API数据...");
    
    const response = await fetch('http://localhost:3000/api/model/chat');
    const text = await response.text();
    
    // 检查响应状态
    if (!response.ok) {
      console.log("API响应状态:", response.status);
      console.log("响应内容:", text.substring(0, 200) + "...");
      return;
    }
    
    // 尝试解析JSON
    const data = JSON.parse(text);
    
    console.log("API响应数据:");
    console.log(`找到 ${data.data.length} 条聊天记录`);
    
    // 检查所有交易记录
    console.log("\n所有交易记录摘要:");
    let totalPositionValue = 0;
    
    data.data.forEach((chat, index) => {
      if (chat.tradings && chat.tradings.length > 0) {
        chat.tradings.forEach((trade, tradeIndex) => {
          console.log(`记录 ${index + 1}, 交易 ${tradeIndex + 1}: ${trade.opeartion} ${trade.symbol} 数量: ${trade.amount} 价格: ${trade.pricing}`);
          
          // 计算持仓价值
          if (trade.amount && trade.pricing && trade.opeartion === "Buy") {
            const value = trade.amount * trade.pricing;
            totalPositionValue += value;
            console.log(`  -> 持仓价值: ${value.toFixed(2)}`);
          }
        });
      }
    });
    
    console.log(`\n总持仓价值计算: ${totalPositionValue.toFixed(2)}`);
    
  } catch (error) {
    console.error("获取API数据时出错:", error.message);
  }
}

checkApiData();