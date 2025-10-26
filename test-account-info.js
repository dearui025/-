import { getAccountInformationAndPerformance } from './lib/trading/account-information-and-performance';

async function testAccountInfo() {
  try {
    console.log("正在获取账户信息...");
    
    const accountInfo = await getAccountInformationAndPerformance(10000);
    
    console.log("账户信息:");
    console.log(`总账户价值: $${accountInfo.totalCashValue.toFixed(2)}`);
    console.log(`可用现金: $${accountInfo.availableCash.toFixed(2)}`);
    console.log(`持仓价值: $${accountInfo.currentPositionsValue.toFixed(2)}`);
    console.log(`总回报率: ${(accountInfo.currentTotalReturn * 100).toFixed(2)}%`);
    console.log(`夏普比率: ${accountInfo.sharpeRatio.toFixed(2)}`);
    
    console.log("\n持仓详情:");
    if (accountInfo.positions.length > 0) {
      accountInfo.positions.forEach((position, index) => {
        console.log(`${index + 1}. ${position.symbol}:`);
        console.log(`   数量: ${position.amount.toFixed(4)}`);
        console.log(`   平均价格: $${position.avgPrice.toFixed(2)}`);
        console.log(`   当前价格: $${position.currentPrice.toFixed(2)}`);
        console.log(`   价值: $${position.value.toFixed(2)}`);
      });
    } else {
      console.log("无持仓");
    }
    
  } catch (error) {
    console.error("获取账户信息时出错:", error.message);
  }
}

testAccountInfo();