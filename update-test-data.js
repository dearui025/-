import fs from 'fs';
import path from 'path';

// 读取数据库文件
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

// 生成测试数据
const generateTestData = () => {
  const testData = [];
  const baseValue = 10000;
  const now = new Date();
  
  // 生成20个数据点，每个点之间有小幅度变化
  for (let i = 0; i < 20; i++) {
    const timeOffset = (19 - i) * 30; // 每30秒一个数据点
    const time = new Date(now.getTime() - timeOffset * 1000);
    
    // 添加一些随机变化（±5%）
    const variation = (Math.random() - 0.5) * 0.1; // ±5%
    const totalCashValue = baseValue * (1 + variation);
    
    testData.push({
      accountInformationAndPerformance: {
        currentPositionsValue: parseFloat((totalCashValue * 0.1 * Math.random()).toFixed(2)),
        contractValue: 0,
        totalCashValue: parseFloat(totalCashValue.toFixed(2)),
        availableCash: parseFloat((totalCashValue * 0.8).toFixed(2)),
        currentTotalReturn: parseFloat(variation.toFixed(4)),
        positions: [],
        sharpeRatio: parseFloat((Math.random() * 2 - 1).toFixed(2)), // -1到1之间的随机值
      },
      createdAt: time.toISOString(),
    });
  }
  
  return testData;
};

// 创建测试数据并保存到文件
const testData = generateTestData();
const testMetrics = {
  id: "test-id",
  name: "20-seconds-metrics",
  model: "Deepseek",
  metrics: JSON.stringify(testData),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 保存到测试文件
const testMetricsPath = path.join(process.cwd(), 'prisma', 'test-metrics.json');
fs.writeFileSync(testMetricsPath, JSON.stringify(testMetrics, null, 2));

console.log('测试数据已生成并保存到:', testMetricsPath);
console.log('数据点数量:', testData.length);
console.log('最新的账户价值:', testData[testData.length - 1].accountInformationAndPerformance.totalCashValue);
console.log('最早的账户价值:', testData[0].accountInformationAndPerformance.totalCashValue);