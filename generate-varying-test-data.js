import fs from 'fs';
import path from 'path';

// 生成具有变化值的测试数据
const generateVaryingTestData = () => {
  const testData = [];
  const baseValue = 9886.45859; // 使用实际的账户余额作为基础值
  const now = new Date();
  
  // 生成50个数据点，每个点之间有小幅度变化
  for (let i = 0; i < 50; i++) {
    const timeOffset = (49 - i) * 20; // 每20秒一个数据点
    const time = new Date(now.getTime() - timeOffset * 1000);
    
    // 添加一些随机变化（±2%）
    const variation = (Math.random() - 0.5) * 0.04; // ±2%
    const totalCashValue = baseValue * (1 + variation);
    
    testData.push({
      // 包装在accountInformationAndPerformance对象中，以匹配API期望的结构
      accountInformationAndPerformance: {
        currentPositionsValue: parseFloat((totalCashValue * 0.1 * Math.random()).toFixed(2)),
        contractValue: 0,
        totalCashValue: parseFloat(totalCashValue.toFixed(2)),
        availableCash: parseFloat((totalCashValue * (0.8 + 0.2 * Math.random())).toFixed(2)),
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
const testData = generateVaryingTestData();
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

console.log('变化的测试数据已生成并保存到:', testMetricsPath);
console.log('数据点数量:', testData.length);
console.log('账户价值范围:', 
  Math.min(...testData.map(d => d.accountInformationAndPerformance.totalCashValue)).toFixed(2), 
  '到', 
  Math.max(...testData.map(d => d.accountInformationAndPerformance.totalCashValue)).toFixed(2)
);
console.log('最新的账户价值:', testData[testData.length - 1].accountInformationAndPerformance.totalCashValue);
console.log('最早的账户价值:', testData[0].accountInformationAndPerformance.totalCashValue);