import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const prisma = new PrismaClient();

async function checkRecords() {
  try {
    console.log("开始检查数据库记录...");
    
    // 检查聊天记录
    const chatCount = await prisma.chat.count();
    console.log(`聊天记录总数: ${chatCount}`);
    
    if (chatCount > 0) {
      const latestChats = await prisma.chat.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 3,
        include: {
          tradings: true
        }
      });
      
      console.log("\n最新的3条聊天记录:");
      latestChats.forEach((chat, index) => {
        console.log(`\n--- 记录 ${index + 1} ---`);
        console.log(`ID: ${chat.id}`);
        console.log(`创建时间: ${chat.createdAt}`);
        console.log(`聊天内容: ${chat.chat.substring(0, 100)}...`);
        console.log(`推理内容: ${chat.reasoning.substring(0, 100)}...`);
        console.log(`交易数量: ${chat.tradings.length}`);
        
        if (chat.tradings.length > 0) {
          chat.tradings.forEach((trade, tradeIndex) => {
            console.log(`  交易 ${tradeIndex + 1}: ${trade.opeartion} ${trade.symbol} 数量: ${trade.amount}`);
          });
        }
      });
    }
    
    // 检查指标记录
    const metrics = await prisma.metrics.findMany({
      where: {
        model: 'Deepseek'
      }
    });
    
    console.log(`\nDeepSeek指标记录数: ${metrics.length}`);
    
    if (metrics.length > 0) {
      const latestMetric = metrics[0];
      console.log(`最新指标记录ID: ${latestMetric.id}`);
      console.log(`指标数据长度: ${latestMetric.metrics.length}`);
      
      try {
        const parsedMetrics = JSON.parse(latestMetric.metrics);
        console.log(`解析后的指标数量: ${parsedMetrics.length}`);
        if (parsedMetrics.length > 0) {
          const lastMetric = parsedMetrics[parsedMetrics.length - 1];
          console.log(`最后一条指标时间: ${lastMetric.createdAt}`);
          if (lastMetric.accountInformationAndPerformance) {
            console.log(`账户总价值: $${lastMetric.accountInformationAndPerformance.totalCashValue?.toFixed(2)}`);
          }
        }
      } catch (parseError) {
        console.log("指标数据解析失败");
      }
    }
    
  } catch (error) {
    console.error("检查数据库记录时出错:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecords();