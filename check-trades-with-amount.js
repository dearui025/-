import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const prisma = new PrismaClient();

async function checkTradesWithAmount() {
  try {
    console.log("正在查找有数量的交易记录...");
    
    // 查找有数量的交易
    const tradesWithAmount = await prisma.trading.findMany({
      where: {
        amount: {
          not: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`找到 ${tradesWithAmount.length} 条有数量的交易记录:`);
    
    tradesWithAmount.forEach((trade, index) => {
      console.log(`\n--- 交易 ${index + 1} ---`);
      console.log(`ID: ${trade.id}`);
      console.log(`操作: ${trade.opeartion}`);
      console.log(`交易对: ${trade.symbol}`);
      console.log(`数量: ${trade.amount}`);
      console.log(`价格: ${trade.pricing}`);
      console.log(`创建时间: ${trade.createdAt}`);
    });
    
    if (tradesWithAmount.length === 0) {
      console.log("没有找到有数量的交易记录。");
    }
    
  } catch (error) {
    console.error("检查交易记录时出错:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTradesWithAmount();